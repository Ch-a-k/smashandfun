-- Таблица пакетов (услуг)
create table if not exists packages (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    difficulty text,
    price numeric not null,
    duration integer not null, -- длительность услуги в минутах
    people_count integer not null,
    items jsonb not null,
    tools jsonb not null,
    allowed_rooms jsonb not null, -- массив id комнат, где можно проводить услугу
    room_priority jsonb,          -- массив id комнат по приоритету
    cleanup_time integer not null default 15 -- время уборки после услуги, в минутах
);

-- Дополнительные предметы
create table if not exists extra_items (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    price numeric not null,
    description text
);

-- Комнаты
create table if not exists rooms (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    priority integer not null
);

-- Бронирования
create table if not exists bookings (
    id uuid primary key default gen_random_uuid(),
    user_email text not null,
    name text,
    package_id uuid references packages(id),
    room_id uuid references rooms(id),
    date date not null,         -- дата бронирования (Europe/Warsaw)
    time time not null,         -- время начала (Europe/Warsaw)
    extra_items jsonb,
    total_price numeric not null,
    status text not null check (status in ('pending', 'paid', 'deposit', 'cancelled')),
    payment_id text,
    promo_code text,
    phone text,
    change_token text, -- одноразовый токен для смены даты/времени
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Доп. аналитические поля (UTM/клики/реферер)
alter table if exists bookings add column if not exists utm_source text;
alter table if exists bookings add column if not exists utm_medium text;
alter table if exists bookings add column if not exists utm_campaign text;
alter table if exists bookings add column if not exists utm_term text;
alter table if exists bookings add column if not exists utm_content text;
alter table if exists bookings add column if not exists gclid text;
alter table if exists bookings add column if not exists fbclid text;
alter table if exists bookings add column if not exists referrer text;
alter table if exists bookings add column if not exists landing_page text;

-- Пользователи (клиенты)
create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    name text,
    phone text,
    created_at timestamp with time zone default now()
);

-- Администраторы
create table if not exists admins (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    role text not null check (role in ('admin', 'superadmin')),
    last_active timestamp with time zone
);

-- История изменений бронирования
create table if not exists booking_history (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid references bookings(id),
    action text not null,
    comment text,
    created_by uuid,
    created_at timestamp with time zone default now()
);

-- Комментарии
create table if not exists comments (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid references bookings(id),
    author_id uuid,
    author_role text not null check (author_role in ('user', 'admin')),
    text text not null,
    created_at timestamp with time zone default now()
);

-- Промокоды
create table if not exists promo_codes (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    discount_percent integer not null,
    discount_amount numeric,
    valid_from date,
    valid_to date,
    usage_limit integer,
    used_count integer default 0,
    time_from time, -- начало действия по времени суток
    time_to time    -- конец действия по времени суток
);

-- Платежи
create table if not exists payments (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid references bookings(id),
    status text not null check (status in ('paid', 'deposit', 'unpaid')),
    amount numeric not null,
    transaction_id text,
    created_at timestamp with time zone default now()
); 