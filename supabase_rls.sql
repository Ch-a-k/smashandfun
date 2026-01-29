-- Enable Row Level Security and policies for Supabase
-- Run this in Supabase SQL editor.

-- Helper: admin check based on admins table
-- SECURITY DEFINER avoids RLS recursion on admins table
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    where a.email = (auth.jwt() ->> 'email')
  );
$$;

-- Enable RLS
alter table if exists public.holidays enable row level security;
alter table if exists public.users enable row level security;
alter table if exists public.rooms enable row level security;
alter table if exists public.bookings enable row level security;
alter table if exists public.packages enable row level security;
alter table if exists public.promo_codes enable row level security;
alter table if exists public.admins enable row level security;
alter table if exists public.booking_settings_dates enable row level security;
alter table if exists public.booking_history enable row level security;
alter table if exists public.extra_items enable row level security;
alter table if exists public.comments enable row level security;
alter table if exists public.payments enable row level security;

-- Packages: public read, admin write
drop policy if exists "packages_select_public" on public.packages;
create policy "packages_select_public"
  on public.packages for select
  using (true);

drop policy if exists "packages_admin_all" on public.packages;
create policy "packages_admin_all"
  on public.packages for all
  using (public.is_admin())
  with check (public.is_admin());

-- Rooms: public read, admin write
drop policy if exists "rooms_select_public" on public.rooms;
create policy "rooms_select_public"
  on public.rooms for select
  using (true);

drop policy if exists "rooms_admin_all" on public.rooms;
create policy "rooms_admin_all"
  on public.rooms for all
  using (public.is_admin())
  with check (public.is_admin());

-- Extra items: public read, admin write
drop policy if exists "extra_items_select_public" on public.extra_items;
create policy "extra_items_select_public"
  on public.extra_items for select
  using (true);

drop policy if exists "extra_items_admin_all" on public.extra_items;
create policy "extra_items_admin_all"
  on public.extra_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- Promo codes: public read (validation), admin write
drop policy if exists "promo_codes_select_public" on public.promo_codes;
create policy "promo_codes_select_public"
  on public.promo_codes for select
  using (true);

drop policy if exists "promo_codes_admin_all" on public.promo_codes;
create policy "promo_codes_admin_all"
  on public.promo_codes for all
  using (public.is_admin())
  with check (public.is_admin());

-- Bookings: admin insert/select/update/delete
drop policy if exists "bookings_admin_insert" on public.bookings;
create policy "bookings_admin_insert"
  on public.bookings for insert
  with check (public.is_admin());

drop policy if exists "bookings_admin_select" on public.bookings;
create policy "bookings_admin_select"
  on public.bookings for select
  using (public.is_admin());

drop policy if exists "bookings_admin_update" on public.bookings;
create policy "bookings_admin_update"
  on public.bookings for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "bookings_admin_delete" on public.bookings;
create policy "bookings_admin_delete"
  on public.bookings for delete
  using (public.is_admin());

-- Users: admin only (writes are done via server service role)
drop policy if exists "users_admin_all" on public.users;
create policy "users_admin_all"
  on public.users for all
  using (public.is_admin())
  with check (public.is_admin());

-- Holidays: admin only
drop policy if exists "holidays_admin_all" on public.holidays;
create policy "holidays_admin_all"
  on public.holidays for all
  using (public.is_admin())
  with check (public.is_admin());

-- Booking history: admin only
drop policy if exists "booking_history_admin_all" on public.booking_history;
create policy "booking_history_admin_all"
  on public.booking_history for all
  using (public.is_admin())
  with check (public.is_admin());

-- Comments: admin only
drop policy if exists "comments_admin_all" on public.comments;
create policy "comments_admin_all"
  on public.comments for all
  using (public.is_admin())
  with check (public.is_admin());

-- Payments: admin only
drop policy if exists "payments_admin_all" on public.payments;
create policy "payments_admin_all"
  on public.payments for all
  using (public.is_admin())
  with check (public.is_admin());

-- Admins: admin only (superadmin gating is handled in app)
drop policy if exists "admins_admin_all" on public.admins;
create policy "admins_admin_all"
  on public.admins for all
  using (public.is_admin())
  with check (public.is_admin());

-- Booking settings dates (if exists): admin only
drop policy if exists "booking_settings_dates_admin_all" on public.booking_settings_dates;
create policy "booking_settings_dates_admin_all"
  on public.booking_settings_dates for all
  using (public.is_admin())
  with check (public.is_admin());
