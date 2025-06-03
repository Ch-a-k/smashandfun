-- Таблица пакетов (услуг)
create table if not exists packages (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    difficulty text,
    price numeric not null,
    duration integer not null,
    people_count integer not null,
    items jsonb not null,
    tools jsonb not null,
    allowed_rooms jsonb not null,
    room_priority jsonb
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
    package_id uuid references packages(id),
    room_id uuid references rooms(id),
    date date not null,
    time time not null,
    extra_items jsonb,
    total_price numeric not null,
    status text not null check (status in ('pending', 'paid', 'deposit', 'cancelled')),
    payment_id text,
    promo_code text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

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