-- B2B Requests table — stores structured inquiries from /organizacja-imprez-b2b form
CREATE TABLE IF NOT EXISTS public.b2b_requests (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  service          TEXT NOT NULL CHECK (service IN ('team_building','corporate_events','integration')),
  people           INTEGER NOT NULL CHECK (people > 0),
  date_from        DATE NOT NULL,
  date_to          DATE,
  extra_items      JSONB DEFAULT '[]'::jsonb,
  message          TEXT,
  status           TEXT DEFAULT 'new' CHECK (status IN ('new','in_progress','completed','rejected')),
  estimated_revenue NUMERIC DEFAULT 0,
  utm_source       TEXT,
  utm_medium       TEXT,
  utm_campaign     TEXT,
  utm_term         TEXT,
  utm_content      TEXT,
  referrer         TEXT,
  landing_page     TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.b2b_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "b2b_requests_insert" ON public.b2b_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "b2b_requests_select" ON public.b2b_requests FOR SELECT USING (true);
CREATE POLICY "b2b_requests_update" ON public.b2b_requests FOR UPDATE USING (true);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_b2b_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER b2b_requests_updated_at
  BEFORE UPDATE ON public.b2b_requests
  FOR EACH ROW EXECUTE FUNCTION update_b2b_updated_at();
