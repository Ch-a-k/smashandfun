-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'superadmin'::text])),
  last_active timestamp with time zone,
  CONSTRAINT admins_pkey PRIMARY KEY (id)
);
CREATE TABLE public.booking_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid,
  action text NOT NULL,
  comment text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT booking_history_pkey PRIMARY KEY (id),
  CONSTRAINT booking_history_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);
CREATE TABLE public.booking_settings_dates (
  id integer NOT NULL,
  default_start text NOT NULL,
  default_end text NOT NULL,
  special_dates jsonb,
  default_start_weekdays text,
  default_end_weekdays text,
  default_start_weekends text,
  default_end_weekends text,
  CONSTRAINT booking_settings_dates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  package_id uuid,
  room_id uuid,
  date date NOT NULL,
  time time without time zone NOT NULL,
  extra_items jsonb,
  total_price numeric NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'deposit'::text, 'cancelled'::text])),
  payment_id text,
  promo_code text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  name text,
  phone text,
  change_token text,
  isBestseller boolean,
  comment text,
  payu_id text,
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id),
  CONSTRAINT bookings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id)
);
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid,
  author_id uuid,
  author_role text NOT NULL CHECK (author_role = ANY (ARRAY['user'::text, 'admin'::text])),
  text text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);
CREATE TABLE public.extra_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  description text,
  CONSTRAINT extra_items_pkey PRIMARY KEY (id)
);
CREATE TABLE public.holidays (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  date character varying NOT NULL,
  CONSTRAINT holidays_pkey PRIMARY KEY (id)
);
CREATE TABLE public.packages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  duration integer NOT NULL,
  people_count integer,
  cleanup_time integer NOT NULL DEFAULT 15,
  people text,
  bookingurl text,
  isBestseller boolean DEFAULT false,
  items ARRAY,
  tools ARRAY,
  allowed_rooms ARRAY,
  room_priority ARRAY,
  position integer NOT NULL DEFAULT 0,
  CONSTRAINT packages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid,
  status text NOT NULL CHECK (status = ANY (ARRAY['paid'::text, 'deposit'::text, 'unpaid'::text])),
  amount numeric NOT NULL,
  transaction_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);
CREATE TABLE public.promo_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percent numeric NOT NULL,
  valid_from date,
  valid_to date,
  usage_limit integer,
  used_count integer DEFAULT 0,
  discount_amount numeric,
  time_from time without time zone,
  time_to time without time zone,
  CONSTRAINT promo_codes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  priority integer NOT NULL,
  CONSTRAINT rooms_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);