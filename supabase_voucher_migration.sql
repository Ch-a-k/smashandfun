-- Voucher Requests table — stores orders from /vouchery form
CREATE TABLE IF NOT EXISTS public.voucher_requests (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL,
  package      TEXT NOT NULL CHECK (package IN ('easy','medium','hard','extreme')),
  message      TEXT,
  status       TEXT DEFAULT 'new' CHECK (status IN ('new','in_progress','completed','rejected')),
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  utm_term     TEXT,
  utm_content  TEXT,
  referrer     TEXT,
  landing_page TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.voucher_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "voucher_requests_insert" ON public.voucher_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "voucher_requests_select" ON public.voucher_requests
  FOR SELECT USING (true);

CREATE POLICY "voucher_requests_update" ON public.voucher_requests
  FOR UPDATE USING (true);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_voucher_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER voucher_requests_updated_at
  BEFORE UPDATE ON public.voucher_requests
  FOR EACH ROW EXECUTE FUNCTION update_voucher_updated_at();
