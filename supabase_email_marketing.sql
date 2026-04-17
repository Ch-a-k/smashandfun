-- Email Marketing (SUPERADMIN) — схема

create table if not exists email_brand (
  id int primary key default 1,
  logo_url text,
  primary_color text default '#f36e21',
  sender_name text default 'Smash and Fun',
  updated_at timestamptz default now(),
  constraint email_brand_singleton check (id = 1)
);
insert into email_brand (id) values (1) on conflict do nothing;

create table if not exists email_templates (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,          -- minimal | corporate | promo | custom:*
  name text not null,
  html text not null,
  is_system boolean default false,
  created_at timestamptz default now()
);

create table if not exists email_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  subject_b text,                    -- A/B: wariant B
  ab_split_b_pct int default 0 check (ab_split_b_pct between 0 and 100),
  html text not null,
  template_key text,
  from_name text,
  from_email text,
  reply_to text,
  utm_source text,
  utm_medium text default 'email',
  utm_campaign text,
  primary_color text,                -- override email_brand.primary_color
  cta_url text,                      -- link docelowy przycisku CTA
  track_clicks boolean default true,
  scheduled_at timestamptz,          -- null = wyślij natychmiast
  status text not null default 'draft'
    check (status in ('draft','queued','sending','sent','failed','cancelled')),
  segment jsonb not null default '{}'::jsonb,  -- zapisane filtry
  recipients_count int default 0,
  sent_count int default 0,
  opens_count int default 0,
  clicks_count int default 0,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  started_at timestamptz,
  finished_at timestamptz
);
create index if not exists email_campaigns_status_idx on email_campaigns(status, scheduled_at);

create table if not exists email_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references email_campaigns(id) on delete cascade,
  to_email text not null,
  variant char(1) default 'A' check (variant in ('A','B')),
  subject text not null,
  personalization jsonb default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending','sent','failed','skipped')),
  error text,
  message_id text,
  sent_at timestamptz,
  opened_at timestamptz,
  first_click_at timestamptz,
  opens int default 0,
  clicks int default 0,
  created_at timestamptz default now()
);
create index if not exists email_logs_campaign_idx on email_logs(campaign_id, status);
create index if not exists email_logs_email_idx on email_logs(to_email);

create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  log_id uuid references email_logs(id) on delete cascade,
  campaign_id uuid references email_campaigns(id) on delete cascade,
  kind text not null check (kind in ('open','click')),
  url text,
  user_agent text,
  ip text,
  created_at timestamptz default now()
);
create index if not exists email_events_campaign_idx on email_events(campaign_id, kind);

create table if not exists email_unsubscribes (
  email text primary key,
  reason text,
  campaign_id uuid references email_campaigns(id) on delete set null,
  created_at timestamptz default now()
);

-- widok: kontakt jako agregat klienta z bookings
create or replace view email_contacts as
select
  lower(b.user_email)                                     as email,
  max(b.name)                                             as name,
  max(b.phone)                                            as phone,
  min(b.created_at)                                       as first_booking_at,
  max(b.created_at)                                       as last_booking_at,
  count(*)                                                as bookings_count,
  coalesce(sum(case when b.status in ('paid','deposit')
                    then b.total_price else 0 end), 0)    as total_order_value,
  coalesce(max(p.people_count), 0)                        as guests_count,
  bool_or(b.status = 'paid')                              as has_paid,
  bool_or(b.status = 'deposit')                           as has_deposit,
  bool_or(b.status = 'pending')                           as has_pending,
  (array_agg(b.total_price order by b.created_at desc))[1] as last_order,
  (array_agg(b.id order by b.created_at desc))[1]         as last_booking_id
from bookings b
left join packages p on p.id = b.package_id
where b.user_email is not null and b.status <> 'cancelled'
group by lower(b.user_email);

-- seedy systemowych szablonów (pust HTML — nadpisujemy z kodu, tu tylko marker)
insert into email_templates (key, name, html, is_system) values
  ('minimal',   'Minimal',   '', true),
  ('corporate', 'Corporate', '', true),
  ('promo',     'Promo',     '', true)
on conflict (key) do nothing;
