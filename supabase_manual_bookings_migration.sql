-- Manual booking support for admin panel
-- Allows ad-hoc B2B / B2C / walk-in bookings with arbitrary
-- duration, custom price and deposit tracking — without forcing
-- a fake "free package" that pollutes sales analytics.
--
-- Apply via Supabase SQL editor.

-- 1. New columns on bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS num_people       INT,
  ADD COLUMN IF NOT EXISTS source           TEXT,
  ADD COLUMN IF NOT EXISTS duration_minutes INT,
  ADD COLUMN IF NOT EXISTS deposit_amount   NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS admin_note       TEXT;

-- 2. Constrain `source` to known values (NULL = legacy/unspecified)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_source_check'
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT bookings_source_check
      CHECK (source IS NULL OR source IN ('b2c', 'b2b', 'walkin', 'manual'));
  END IF;
END $$;

-- 3. Allow manual bookings without a package
ALTER TABLE bookings ALTER COLUMN package_id DROP NOT NULL;

-- 4. Filter index for analytics by source
CREATE INDEX IF NOT EXISTS idx_bookings_source ON bookings(source);

-- 5. Redefine atomic booking RPCs so manual bookings (package_id IS NULL,
--    duration_minutes set) are correctly seen as occupying the slot.
--    Span priority: bookings.duration_minutes -> packages.duration + cleanup_time -> 75 min default.

CREATE OR REPLACE FUNCTION book_room(
  p_room_order uuid[],
  p_date date,
  p_time time,
  p_duration_minutes int,
  p_cleanup_minutes int,
  p_user_email text,
  p_package_id uuid,
  p_extra_items jsonb DEFAULT '[]'::jsonb,
  p_total_price numeric DEFAULT 0,
  p_status text DEFAULT 'pending',
  p_promo_code text DEFAULT NULL,
  p_name text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_change_token text DEFAULT NULL,
  p_utm_source text DEFAULT NULL,
  p_utm_medium text DEFAULT NULL,
  p_utm_campaign text DEFAULT NULL,
  p_utm_term text DEFAULT NULL,
  p_utm_content text DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_landing_page text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_room_id uuid;
  v_rid uuid;
  v_target_start timestamp;
  v_target_end timestamp;
  v_has_conflict boolean;
  v_row bookings%ROWTYPE;
BEGIN
  v_target_start := p_date + p_time;
  v_target_end   := v_target_start + make_interval(mins := p_duration_minutes + p_cleanup_minutes);

  PERFORM pg_advisory_xact_lock(hashtext('book_' || p_date::text));

  FOREACH v_rid IN ARRAY p_room_order LOOP
    SELECT EXISTS (
      SELECT 1
      FROM bookings b
      LEFT JOIN packages pkg ON pkg.id = b.package_id
      WHERE b.room_id = v_rid
        AND b.date = p_date
        AND b.status != 'cancelled'
        AND v_target_start < (
          b.date + b.time + make_interval(
            mins := COALESCE(
              b.duration_minutes,
              COALESCE(pkg.duration, 60) + COALESCE(pkg.cleanup_time, 15)
            )
          )
        )
        AND (b.date + b.time) < v_target_end
    ) INTO v_has_conflict;

    IF NOT v_has_conflict THEN
      v_room_id := v_rid;
      EXIT;
    END IF;
  END LOOP;

  IF v_room_id IS NULL THEN
    RETURN jsonb_build_object('error', 'NO_AVAILABLE_ROOM');
  END IF;

  INSERT INTO bookings (
    user_email, package_id, room_id, date, time,
    extra_items, total_price, status, promo_code,
    name, phone, change_token,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
    referrer, landing_page
  ) VALUES (
    p_user_email, p_package_id, v_room_id, p_date, p_time,
    p_extra_items, p_total_price, p_status, p_promo_code,
    p_name, p_phone, p_change_token,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_term, p_utm_content,
    p_referrer, p_landing_page
  )
  RETURNING * INTO v_row;

  RETURN row_to_json(v_row)::jsonb;
END;
$$;

CREATE OR REPLACE FUNCTION change_booking_room(
  p_booking_id uuid,
  p_room_order uuid[],
  p_new_date date,
  p_new_time time,
  p_duration_minutes int,
  p_cleanup_minutes int
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_room_id uuid;
  v_rid uuid;
  v_target_start timestamp;
  v_target_end timestamp;
  v_has_conflict boolean;
BEGIN
  v_target_start := p_new_date + p_new_time;
  v_target_end   := v_target_start + make_interval(mins := p_duration_minutes + p_cleanup_minutes);

  PERFORM pg_advisory_xact_lock(hashtext('book_' || p_new_date::text));

  FOREACH v_rid IN ARRAY p_room_order LOOP
    SELECT EXISTS (
      SELECT 1
      FROM bookings b
      LEFT JOIN packages pkg ON pkg.id = b.package_id
      WHERE b.room_id = v_rid
        AND b.date = p_new_date
        AND b.status != 'cancelled'
        AND b.id != p_booking_id
        AND v_target_start < (
          b.date + b.time + make_interval(
            mins := COALESCE(
              b.duration_minutes,
              COALESCE(pkg.duration, 60) + COALESCE(pkg.cleanup_time, 15)
            )
          )
        )
        AND (b.date + b.time) < v_target_end
    ) INTO v_has_conflict;

    IF NOT v_has_conflict THEN
      v_room_id := v_rid;
      EXIT;
    END IF;
  END LOOP;

  IF v_room_id IS NULL THEN
    RETURN jsonb_build_object('error', 'NO_AVAILABLE_ROOM');
  END IF;

  UPDATE bookings
  SET date = p_new_date, time = p_new_time, room_id = v_room_id, updated_at = now()
  WHERE id = p_booking_id;

  RETURN jsonb_build_object('room_id', v_room_id);
END;
$$;
