# Инструкция по настройке проекта

## 1. Настройка переменных окружения

### Получение учетных данных Supabase

1. Откройте ваш проект в [Supabase Dashboard](https://app.supabase.com/)
2. Перейдите в **Settings** → **API**
3. Скопируйте следующие значения:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (public key) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (secret key) → `SUPABASE_SERVICE_ROLE_KEY`

### Обновление файла .env.local

Откройте файл `.env.local` и замените значения по умолчанию:

```bash
# Замените на ваши реальные значения из Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-публичный-ключ
SUPABASE_SERVICE_ROLE_KEY=ваш-сервисный-ключ

# Google Tag Manager (уже настроен)
NEXT_PUBLIC_GTM_ID=

# URL приложения (для локальной разработки)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Установка зависимостей

```bash
npm install
```

## 3. Запуск проекта

### Режим разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

### Сборка для продакшена

```bash
npm run build
npm start
```

## 4. Настройка базы данных

Если база данных еще не настроена, выполните SQL-скрипты:

```bash
# В Supabase Dashboard → SQL Editor вставьте содержимое файлов:
1. supabase_schema.sql
2. supabase_rls.sql
```

## 5. Дополнительные настройки (опционально)

### Email (для уведомлений о бронированиях, контактной формы и B2B)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=twoj-email@gmail.com
SMTP_PASSWORD=haslo-aplikacji
SMTP_SECURE=false

# Куда приходят уведомления с форм
EMAIL_FROM=hello@twojadomena.pl
EMAIL_TO=hello@twojadomena.pl

# Необязательные алиасы для совместимости со старой конфигурацией
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=twoj-email@gmail.com
EMAIL_PASS=haslo-aplikacji
ZOHO_HOST=
ZOHO_PORT=
ZOHO_USER=
ZOHO_PASS=
EMAIL_RECEIVER=
EMAIL_CC=
```

### PayU (для приема платежей)

```bash
PAYU_CLIENT_ID=
PAYU_CLIENT_SECRET=
PAYU_POS_ID=
PAYU_MD5_KEY=
```

## 6. Аналитика (через переменные окружения)

Все трекинг-скрипты загружаются **только если соответствующая переменная установлена**. Добавьте нужные ID в Vercel → Settings → Environment Variables:

| Переменная | Сервис |
|---|---|
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Meta (Facebook) Pixel |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | TikTok Pixel |

Все аналитические инструменты работают с системой Cookie Consent и загружаются только после согласия пользователя.

## Troubleshooting

### Ошибка "supabaseUrl is required"

Убедитесь, что файл `.env.local` существует и содержит правильные переменные окружения Supabase.

### Ошибки при установке зависимостей

Используйте флаг `--legacy-peer-deps`:

```bash
npm install --legacy-peer-deps
```

### Конфликты портов

Если порт 3000 занят, укажите другой:

```bash
npm run dev -- -p 3001
```
