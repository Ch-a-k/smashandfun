-- per-kampania: kolor, link CTA, tracking kliknięć
alter table email_campaigns
  add column if not exists primary_color text,
  add column if not exists cta_url text,
  add column if not exists track_clicks boolean default true;
