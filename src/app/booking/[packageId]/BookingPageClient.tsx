'use client'
import { useCallback, useEffect, useState, useRef } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Image from 'next/image';
import InFomoFooterButton from '@/components/InFomoFooterButton';
import { pl } from 'date-fns/locale/pl';
import { trackTikTokViewContent, trackTikTokInitiateCheckout, trackFBViewContent, trackFBInitiateCheckout, identifyTikTokUser } from '@/lib/analytics';
import { sendGTMEvent } from '@next/third-parties/google';
import { getUtmParams } from '@/lib/bookingUtm';

registerLocale('pl', pl);

interface BookingPageClientProps {
  packageId?: string;
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: number;
  people_count?: number;
}

interface ExtraItem {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface ExtraItemSelection {
  id: string;
  count: number;
}

interface BookingForm {
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  extraItems: ExtraItemSelection[];
  paymentType: 'full' | 'deposit';
  promoCode: string;
}

// Летающие предметы на фоне
const flyingImages = [
  '/images/1.png',
  '/images/2o.png',
  '/images/3o.png',
  '/images/4o.png',
  '/images/5o.png',
  '/images/6o.png',
];

// Возвращает текущую дату/время в зоне Europe/Warsaw
function getPolandDate(): Date {
  const now = new Date();
  const polandString = now.toLocaleString('en-US');
  return new Date(polandString);
}

// Преобразует строку 'YYYY-MM-DD' в Date в зоне Europe/Warsaw
function parsePolandDate(str: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const [y, m, d] = str.split('-').map(Number);
  const polandString = new Date(y, m - 1, d).toLocaleString('en-US');
  return new Date(polandString);
}

// Возвращает YYYY-MM-DD для даты в зоне Europe/Warsaw
function formatDatePoland(date: Date): string {
  const poland = new Date(date.toLocaleString('en-US'));
  const year = poland.getFullYear();
  const month = (poland.getMonth() + 1).toString().padStart(2, '0');
  const day = poland.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizePrice(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const asString = String(value ?? '').replace(',', '.');
  const parsed = Number(asString);
  return Number.isFinite(parsed) ? parsed : 0;
}

function FlyingObjects() {
  // Генерируем массив с разными параметрами для каждого предмета
  const objects = Array.from({ length: 22 }).map((_, i) => {
    const img = flyingImages[i % flyingImages.length];
    const size = 48 + Math.round(Math.random() * 60); // 48-108px
    const top = Math.round(Math.random() * 80); // 0-80%
    const left = Math.round(Math.random() * 90); // 0-90%
    const opacity = 0.45 + Math.random() * 0.45; // 0.45-0.9
    const duration = 16 + Math.random() * 12; // 16-28s
    const delay = Math.random() * 10; // 0-10s
    return { img, size, top, left, opacity, duration, delay, idx: i };
  });
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {objects.map(({ img, size, top, left, opacity, duration, delay, idx }) => (
        <Image
          key={idx}
          src={img}
          alt="flying object"
          width={size}
          height={size}
          style={{
            position: 'absolute',
            top: `${top}%`,
            left: `${left}%`,
            opacity,
            filter: 'drop-shadow(0 4px 16px #0008)',
            animation: `fly${idx} ${duration}s linear infinite`,
            animationDelay: `${delay}s`,
            zIndex: 1,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      ))}
      <style>{`
        ${objects.map(({ idx }) =>
          `@keyframes fly${idx} {
            0% { transform: translateY(0) scale(1) rotate(0deg); }
            60% { transform: translateY(-30vh) scale(${0.9 + Math.random() * 0.3}) rotate(${Math.random() > 0.5 ? '-' : ''}${Math.round(Math.random()*40)}deg); }
            100% { transform: translateY(-60vh) scale(${0.8 + Math.random() * 0.4}) rotate(${Math.random() > 0.5 ? '-' : ''}${Math.round(Math.random()*80)}deg); }
          }`
        ).join('\n')}
      `}</style>
    </div>
  );
}

export default function BookingPageClient({ packageId }: BookingPageClientProps) {
  const { t, locale, setLocale } = useI18n();
  const [pkg, setPkg] = useState<Package | null>(null);
  const viewContentTracked = useRef(false);
  const [form, setForm] = useState<BookingForm>({
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    extraItems: [],
    paymentType: 'full',
    promoCode: ''
  });
  const [step, setStep] = useState(1);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState('');
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);
  const [payLoading, setPayLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
  const [loadingDates, setLoadingDates] = useState(false);
  const [promoStatus, setPromoStatus] = useState<'idle'|'checking'|'valid'|'invalid'>('idle');
  const [promoDiscount, setPromoDiscount] = useState<{amount: number, percent: number, newTotal: number}|null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  // Валидация email и телефона
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const phoneValid = /^[+]?[(]?[0-9]{2,4}[)]?[-\s./0-9]*$/.test(form.phone) && form.phone.replace(/\D/g, '').length >= 9;

  // Для анимации unicode-иконки в option
  const loadingIcons = ['10', '10', '10', '9', '9', '9', '8', '8', '8', '7', '7', '7', '6', '6', '6', '5', '5', '5', '4', '4', '4', '3', '3', '3', '2', '2', '2', '1', '1', '1', '0', '0', '0'];
  const [loadingIconIdx, setLoadingIconIdx] = useState(0);
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingIconIdx(idx => (idx + 1) % loadingIcons.length);
    }, 200);
    return () => clearInterval(interval);
  }, [loading, loadingIcons.length]);

  // Селектор языка (PL/EN)
  const LangSelector = (
    <div style={{ position: 'absolute', top: 18, right: 24, zIndex: 10 }}>
      <button
        onClick={() => setLocale('pl')}
        style={{
          background: locale === 'pl' ? '#f36e21' : '#23222a',
          color: '#fff',
          border: '2px solid #f36e21',
          borderRadius: 8,
          padding: '4px 14px',
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer',
          marginRight: 6
        }}
      >PL</button>
      <button
        onClick={() => setLocale('en')}
        style={{
          background: locale === 'en' ? '#f36e21' : '#23222a',
          color: '#fff',
          border: '2px solid #f36e21',
          borderRadius: 8,
          padding: '4px 14px',
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer'
        }}
      >EN</button>
    </div>
  );

  useEffect(() => {
    if (!packageId) return;
    fetch(`/api/booking/packages`)
      .then(res => res.json())
      .then((data: Package[]) => {
        const found = data.find((p) => p.id === packageId) || null;
        setPkg(found);
        // Track TikTok ViewContent event with content_id (required for VSA)
        if (found && !viewContentTracked.current) {
          viewContentTracked.current = true;
          trackTikTokViewContent({
            content_id: found.id,
            content_name: found.name,
            content_type: 'product',
            price: found.price,
            currency: 'PLN',
          });
          trackFBViewContent({
            content_ids: [found.id],
            content_name: found.name,
            content_type: 'product',
            value: found.price,
            currency: 'PLN',
          });
          sendGTMEvent({
            event: 'view_content',
            ecommerce: {
              items: [{
                item_id: found.id,
                item_name: found.name,
                price: found.price,
                item_category: 'rage_room_package',
                quantity: 1,
              }],
              currency: 'PLN',
              value: found.price,
            },
          });
        }
      });
    fetch(`/api/booking/extra-items`)
      .then(res => res.json())
      .then((items: ExtraItem[]) => setExtraItems(items));
  }, [packageId]);

  // Функция для загрузки дат по диапазону
  const loadDates = useCallback(async (start: Date, end: Date) => {
    if (!packageId) return;
    setLoadingDates(true);
    const startDate = formatDatePoland(start);
    const endDate = formatDatePoland(end);
    const res = await fetch('/api/booking/available-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId, startDate, endDate })
    });
    if (!res.ok) {
      // Fallback: allow all dates in range if API fails
      const fallbackDates: string[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        fallbackDates.push(formatDatePoland(d));
      }
      setAvailableDates(prev => Array.from(new Set([...prev, ...fallbackDates])));
      setLoadingDates(false);
      return;
    }
    const data = await res.json();
    if (data.dates) {
      setAvailableDates(prev => Array.from(new Set([...prev, ...data.dates])));
    }
    setLoadingDates(false);
  }, [packageId]);

  // Загружаем даты для текущего месяца при инициализации
  useEffect(() => {
    if (!packageId) return;
    const today = getPolandDate();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const monthKey = `${start.getFullYear()}-${start.getMonth()}`;
    if (!loadedMonths.has(monthKey)) {
      loadDates(start, end);
      setLoadedMonths(prev => new Set(prev).add(monthKey));
    }
  }, [packageId, loadDates, loadedMonths]);

  useEffect(() => {
    if (!form.date || !packageId) return;
    const today = new Date().setHours(0,0,0,0);
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    setLoading(true);
    fetch(`/api/booking/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: packageId, date: form.date, time: today === new Date(form.date).setHours(0,0,0,0) ? `${hours}:${minutes}` : null })
    })
      .then(res => res.json())
      .then(data => {
        setAvailableTimes(data.times || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [form.date, packageId]);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  // Step 1: выбор даты и времени
  const availableDatesSet = new Set(availableDates);
  function isDateAvailable(date: Date) {
    const iso = formatDatePoland(date);
    return availableDatesSet.has(iso);
  }
  // При смене месяца подгружаем даты для нового месяца
  const handleMonthChange = (date: Date) => {
    if (!packageId) return;
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const monthKey = `${start.getFullYear()}-${start.getMonth()}`;
    if (!loadedMonths.has(monthKey)) {
      loadDates(start, end);
      setLoadedMonths(prev => new Set(prev).add(monthKey));
    }
  };
  const Step1 = (
    <div style={{ position: 'relative' }}>
      {LangSelector}
      <h1>{t('booking.chooseDateTime')}</h1>
      {loadingDates && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          background: 'rgba(24,24,28,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <div className="custom-spinner-big" />
          <div style={{ color: '#fff', marginTop: 24, fontSize: 20, fontWeight: 600 }}>Ładowanie dat...</div>
          <style>{`
            .custom-spinner-big {
              width: 56px;
              height: 56px;
              border: 7px solid #f3f3f3;
              border-top: 7px solid #f36e21;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      <label>{t('booking.date')}<br />
        <DatePicker
          selected={form.date ? parsePolandDate(form.date) : null} 
          onChange={date => {
            if (date) {
              const iso = formatDatePoland(date);
              setForm(f => ({ ...f, date: iso, time: '' }));
            }
          }}
          filterDate={isDateAvailable}
          minDate={getPolandDate()}
          maxDate={new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate())}
          onMonthChange={handleMonthChange}
          placeholderText={t('booking.date')}
          dateFormat="yyyy-MM-dd"
          locale="pl"
          className="datepicker-input"
        />
      </label>
      <br />
      {/* ВРЕМЕННО: выводим массив доступных дат для отладки */}
      {/*
      <pre style={{color: 'green', fontSize: 12}}>{JSON.stringify(availableDates, null, 2)}</pre>
      */}
      {form.date && (
        <label>{t('booking.time')}<br />
          <select
            value={form.time}
            onChange={e => setForm((f: BookingForm) => ({ ...f, time: e.target.value }))}
            disabled={loading || availableTimes.length === 0}
            style={{
              width: '100%',
              background: '#23222a',
              color: !form.time ? '#aaa' : '#fff',
              border: '2px solid #f36e21',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 16,
              fontWeight: 600,
              outline: 'none',
              height: 48,
              maxHeight: 48,
              appearance: 'none',
              marginTop: 6
            }}
            size={1}
          >
            {loading && <option value={""}>{`Ładowanie godzin... ${loadingIcons[loadingIconIdx]}`}</option>}
            {!loading && availableTimes.length === 0 && <option value="">Brak dostępnych godzin</option>}
            {!loading && availableTimes.length > 0 && <option value="">{t('booking.selectTime')}</option>}
            {!loading && availableTimes.length > 0 && availableTimes.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </label>
      )}
      <br />
      <button
        onClick={nextStep}
        disabled={!form.date || !form.time}
        style={{
          marginTop: 24,
          background: !form.date || !form.time ? '#f36e21aa' : '#f36e21',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '14px 0',
          width: '100%',
          fontWeight: 800,
          fontSize: 20,
          cursor: !form.date || !form.time ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 16px #f36e2180',
          transition: 'background 0.18s, box-shadow 0.18s',
        }}
        onMouseOver={e => {
          if (form.date && form.time) e.currentTarget.style.background = '#ff9f58';
        }}
        onMouseOut={e => {
          if (form.date && form.time) e.currentTarget.style.background = '#f36e21';
        }}
      >
        {t('booking.next')}
      </button>
      <style>{`
        .custom-spinner {
          display: inline-block;
          width: 48px;
          height: 48px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #f36e21;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Step 2: данные клиента
  const Step2 = (
    <div style={{ position: 'relative' }}>
      {LangSelector}
      <h1>{t('booking.enterDetails')}</h1>
      <label>{t('booking.name')}<br />
        <input
          type="text"
          value={form.name}
          onChange={e => setForm((f: BookingForm) => ({ ...f, name: e.target.value }))}
          required
        />
      </label>
      <br />
      <label>{t('booking.email')}<br />
        <input
          type="email"
          value={form.email}
          onChange={e => {
            setForm((f: BookingForm) => ({ ...f, email: e.target.value }));
          }}
          required
        />
      </label>
      {!emailValid && form.email && <div style={{color: 'red', fontSize: 13, marginTop: 2}}>Nieprawidłowy adres e-mail</div>}
      <br />
      <label>{t('booking.phone')}<br />
        <input
          type="tel"
          value={form.phone}
          onChange={e => {
            setForm((f: BookingForm) => ({ ...f, phone: e.target.value }));
          }}
          required
        />
      </label>
      {!phoneValid && form.phone && <div style={{color: 'red', fontSize: 13, marginTop: 2}}>Nieprawidłowy numer telefonu</div>}
      <br />
      <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
        <button onClick={prevStep} style={{ background: '#23222a', color: '#fff', border: '2px solid #f36e21', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>Powrót</button>
        <button
          onClick={() => {
            const errors: {email?: string, phone?: string} = {};
            if (!emailValid) errors.email = 'Nieprawidłowy adres e-mail';
            if (!phoneValid) errors.phone = 'Nieprawidłowy numer telefonu';
            if (!form.name || !form.email || !form.phone || !emailValid || !phoneValid) return;
            // Identify user for TikTok Advanced Matching as soon as we have their data
            identifyTikTokUser({ email: form.email, phone_number: form.phone });
            nextStep();
          }}
          disabled={!form.name || !form.email || !form.phone || !emailValid || !phoneValid}
          style={{ background: '#f36e21', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 17, cursor: !form.name || !form.email || !form.phone || !emailValid || !phoneValid ? 'not-allowed' : 'pointer', marginTop: 0 }}
        >
          {t('booking.next')}
        </button>
      </div>
    </div>
  );

  // Step 3: кроссел
  const Step3 = (
    <div>
      <h1>{t('booking.extraItemsTitle')}</h1>
      <p>{t('booking.extraItemsSubtitle')}</p>
      <div style={{ margin: '24px 0' }}>
        {extraItems.map(item => {
          const selected = form.extraItems.find((ei: ExtraItemSelection) => ei.id === item.id)?.count || 0;
          const itemPrice = normalizePrice(item.price);
          return (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', color: '#ff5a00',background: '#23222a', border: '2px solid #f36e21', borderRadius: 8, padding: '10px 14px', fontSize: 16, fontWeight: 600, outline: 'none', marginBottom: 12 }}>
              <span style={{ flex: 1 }}>{item.name} (+{itemPrice} zł)</span>
              <button
                type="button"
                onClick={() => setForm((f: BookingForm) => ({
                  ...f,
                  extraItems: f.extraItems.map((ei: ExtraItemSelection) => ei.id === item.id ? { ...ei, count: Math.max(0, ei.count - 1) } : ei)
                }))}
                disabled={selected === 0}
                style={{ marginRight: 8 }}
              >-</button>
              <input
                type="number"
                min={0}
                value={selected}
                onChange={e => {
                  const value = Math.max(0, Number(e.target.value));
                  setForm((f: BookingForm) => ({
                    ...f,
                    extraItems: [
                      ...f.extraItems.filter((ei: ExtraItemSelection) => ei.id !== item.id),
                      ...(value > 0 ? [{ id: item.id, count: value }] : [])
                    ]
                  }));
                }}
                style={{ width: 40, textAlign: 'center' }}
              />
              <button
                type="button"
                onClick={() => setForm((f: BookingForm) => ({
                  ...f,
                  extraItems: [
                    ...f.extraItems.filter((ei: ExtraItemSelection) => ei.id !== item.id),
                    { id: item.id, count: selected + 1 }
                  ]
                }))}
                style={{ marginLeft: 8 }}
              >+</button>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
        <button onClick={prevStep} style={{ background: '#23222a', color: '#fff', border: '2px solid #f36e21', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>Powrót</button>
        <button
          onClick={() => {
            // Track InitiateCheckout when entering payment step
            if (pkg) {
              identifyTikTokUser({ email: form.email, phone_number: form.phone });
              trackTikTokInitiateCheckout({
                content_id: pkg.id,
                content_name: pkg.name,
                content_type: 'product',
                value: getTotal(),
                currency: 'PLN',
              });
              trackFBInitiateCheckout({
                content_ids: [pkg.id],
                content_name: pkg.name,
                content_type: 'product',
                value: getTotal(),
                currency: 'PLN',
              });
              sendGTMEvent({
                event: 'begin_checkout',
                ecommerce: {
                  items: [{
                    item_id: pkg.id,
                    item_name: pkg.name,
                    price: getTotal(),
                    item_category: 'rage_room_package',
                    quantity: 1,
                  }],
                  currency: 'PLN',
                  value: getTotal(),
                },
              });
            }
            nextStep();
          }}
          style={{ background: '#f36e21', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 17, cursor: 'pointer', marginTop: 0 }}
        >
          {t('booking.next')}
        </button>
      </div>
    </div>
  );

  // Step 4: выбор типа оплаты
  function getTotal() {
    let total = pkg ? Number(pkg.price) : 0;
    for (const sel of form.extraItems) {
      const item = extraItems.find((ei: ExtraItem) => ei.id === sel.id);
      if (item) total += normalizePrice(item.price) * sel.count;
    }
    return Number.isFinite(total) ? total : 0;
  }

  function getTotalWithPromo() {
    if (promoDiscount && promoStatus === 'valid') return promoDiscount.newTotal;
    return getTotal();
  }

  const Step4 = (
    <div>
      <h1>{t('booking.paymentTypeTitle')}</h1>
      <p>{t('booking.paymentTypeSubtitle')}</p>
      <label>{t('booking.promo')}<br />
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={form.promoCode}
            onChange={e => {
              setForm((f: BookingForm) => ({ ...f, promoCode: e.target.value }));
              setPromoStatus('idle');
              setPromoDiscount(null);
            }}
            onBlur={checkPromo}
            placeholder={t('booking.promoPlaceholder')}
            style={{ width: '100%', marginTop: 6, background: '#23222a', color: '#fff', border: '2px solid #f36e21', borderRadius: 8, padding: '10px 14px', fontSize: 16, fontWeight: 600, outline: 'none' }}
          />
          <button type="button" onClick={checkPromo} style={{ background: '#f36e21', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 6 }}>{t('booking.promoBtn')}</button>
        </div>
        {promoStatus === 'checking' && <div style={{ color: '#ff9f58', marginTop: 4 }}>{t('booking.promoChecking')}</div>}
        {promoStatus === 'valid' && <div style={{ color: '#4caf50', marginTop: 4 }}>{t('booking.promoValid')} {promoDiscount?.amount ? `(-${promoDiscount.amount} zł)` : promoDiscount?.percent ? `(-${promoDiscount.percent}%)` : ''}</div>}
        {promoStatus === 'invalid' && <div style={{ color: '#ff4d4f', marginTop: 4 }}>{t('booking.promoInvalid')}</div>}
      </label>
      <div style={{ margin: '24px 0' }}>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <input
            type="radio"
            name="paymentType"
            value="full"
            checked={form.paymentType === 'full'}
            onChange={() => setForm((f: BookingForm) => ({ ...f, paymentType: 'full' }))}
          />{' '}
          {t('booking.payFull')} (<span style={promoDiscount && promoStatus==='valid' ? {textDecoration:'line-through', color:'#aaa'} : {}}>{getTotal().toFixed(2)}</span>{promoDiscount && promoStatus==='valid' ? <span style={{color:'#4caf50', fontWeight:700}}> → {promoDiscount.newTotal.toFixed(2)} zł</span> : ' zł'})
        </label>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <input
            type="radio"
            name="paymentType"
            value="deposit"
            checked={form.paymentType === 'deposit'}
            onChange={() => setForm((f: BookingForm) => ({ ...f, paymentType: 'deposit' }))}
          />{' '}
          {t('booking.payDeposit')} (20 zł)
        </label>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
        <button onClick={prevStep} style={{ background: '#23222a', color: '#fff', border: '2px solid #f36e21', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>Powrót</button>
        <button
          onClick={nextStep}
          disabled={!form.paymentType}
          style={{ background: '#f36e21', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 17, cursor: !form.paymentType ? 'not-allowed' : 'pointer', marginTop: 0 }}
        >
          {t('booking.next')}
        </button>
      </div>
    </div>
  );

  // Step 5: подтверждение и оплата
  const Step5 = (
    <div>
      <h1>{t('booking.confirmTitle')}</h1>
      <p>{t('booking.confirmSubtitle')}</p>
      <div style={{ margin: '24px 0', textAlign: 'left' }}>
        <div><b>{t('booking.date')}:</b> {form.date}</div>
        <div><b>{t('booking.time')}:</b> {form.time}</div>
        <div><b>{t('booking.name')}:</b> {form.name}</div>
        <div><b>{t('booking.email')}:</b> {form.email}</div>
        <div><b>{t('booking.phone')}:</b> {form.phone}</div>
        <div><b>{t('booking.extraItemsTitle')}:</b>
          <ul>
            {form.extraItems.length === 0 && <li>{t('booking.noExtraItems')}</li>}
            {form.extraItems.map(sel => {
              const item = extraItems.find(ei => ei.id === sel.id);
              if (!item) return null;
              const itemPrice = normalizePrice(item.price);
              return <li key={sel.id}>{item.name} × {sel.count} ({(itemPrice * sel.count).toFixed(2)} zł)</li>;
            })}
          </ul>
        </div>
        <div><b>{t('booking.paymentType')}:</b> {form.paymentType === 'full' ? t('booking.payFull') : t('booking.payDeposit')}</div>
        <div style={{ marginTop: 16, fontWeight: 600, fontSize: 18 }}>
          {t('booking.total')}: {form.paymentType === 'full' ? (
            promoDiscount && promoStatus==='valid' ? <><span style={{textDecoration:'line-through', color:'#aaa'}}>{getTotal().toFixed(2)}</span> <span style={{color:'#4caf50', fontWeight:700}}>{promoDiscount.newTotal.toFixed(2)} zł</span></> : <>{getTotal().toFixed(2)} zł</>
          ) : '20.00 zł'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
        <button onClick={prevStep} style={{ background: '#23222a', color: '#fff', border: '2px solid #f36e21', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>Powrót</button>
        <button
          onClick={async () => {
            setPayLoading(true);

            // Identify user for Advanced Matching before payment
            identifyTikTokUser({ email: form.email, phone_number: form.phone });

            // TikTok SubmitForm event
            if (typeof window !== 'undefined' && window.ttq && pkg) {
              window.ttq.track('SubmitForm', {
                content_id: pkg.id,
                content_name: pkg.name,
                value: form.paymentType === 'full' ? getTotalWithPromo() : 20,
                currency: 'PLN',
              });
            }

            // Save email/phone/value for thank-you page CompletePayment event
            try {
              localStorage.setItem('booking_email', form.email);
              localStorage.setItem('booking_phone', form.phone);
              localStorage.setItem('booking_value', String(form.paymentType === 'full' ? getTotalWithPromo() : 20));
              localStorage.setItem('booking_package_id', packageId || '');
            } catch {}

            if (pkg) {
              sendGTMEvent({
                event: 'add_to_cart',
                ecommerce: {
                  items: [{
                    item_id: pkg.id,
                    item_name: pkg.name,
                    price: form.paymentType === 'full' ? getTotalWithPromo() : 20,
                    item_category: 'rage_room_package',
                    quantity: 1,
                  }],
                  currency: 'PLN',
                  value: form.paymentType === 'full' ? getTotalWithPromo() : 20,
                },
              });
            }
            
            let currentBookingId = bookingId;
            if (!currentBookingId) {
              // 1. Создать бронирование, если ещё не создана
              
              const utmParams = getUtmParams();
              const res = await fetch('/api/booking/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: form.email,
                  packageId: packageId,
                  date: form.date,
                  time: form.time,
                  extraItems: form.extraItems,
                  promoCode: form.promoCode,
                  paymentType: form.paymentType,
                  name: form.name,
                  phone: form.phone,
                  ...utmParams,
                  // referrer & landing_page from localStorage (captured on first visit)
                  // utmParams already contains them if UtmCapture saved them
                  referrer: utmParams.referrer || (typeof document !== 'undefined' ? document.referrer || null : null),
                  landing_page: utmParams.landing_page || (typeof window !== 'undefined' ? window.location.pathname : null),
                })
              });
              const data = await res.json();
              if (!data.booking || data.error) {
                setPayLoading(false);
                alert(data.error || 'Błąd rezerwacji');
                return;
              }
              currentBookingId = data.booking.id;
              setBookingId(currentBookingId);
            }
            // 3. Получить ссылку на оплату через PayU
            const payRes = await fetch('/api/payu/order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: String(Math.round((form.paymentType === 'full' ? getTotalWithPromo() : 20) * 100)),
                currency: 'PLN',
                description: `Rezerwacja: ${pkg?.name || ''} (${form.date} ${form.time})`,
                email: form.email,
                products: [
                  {
                    name: pkg?.name || 'Pakiet',
                    unitPrice: String(Math.round((form.paymentType === 'full' ? getTotalWithPromo() : 20) * 100)),
                    quantity: 1
                  },
                  ...form.extraItems.map(sel => {
                    const item = extraItems.find(ei => ei.id === sel.id);
                    if (!item) return null;
                    const itemPrice = normalizePrice(item.price);
                    if (itemPrice <= 0 || sel.count <= 0) return null;
                    return {
                      name: item.name,
                      unitPrice: String(Math.round(itemPrice * 100)),
                      quantity: sel.count
                    };
                  }).filter(Boolean)
                ],
                extOrderId: currentBookingId
              })
            });
            const payData = await payRes.json();
            setPayLoading(false);
            if (payData.redirectUri) {
              window.location.href = payData.redirectUri;
            } else {
              alert(payData.error || 'Błąd płatności');
            }
          }}
          disabled={payLoading}
          style={{ background: '#f36e21', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: payLoading ? 'not-allowed' : 'pointer', marginTop: 0 }}
        >
          {payLoading ? t('booking.loading') : t('booking.payNow')}
        </button>
      </div>
    </div>
  );

  // Новый компонент для отображения информации о пакете
  const PackageInfoBlock = pkg && (
    <div style={{
      background: 'rgba(30, 30, 30, 0.96)',
      borderRadius: 22,
      padding: '36px 28px',
      marginBottom: 36,
      boxShadow: '0 6px 36px 0 rgba(0,0,0,0.22)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 180,
      border: '2px solid #f36e21',
      zIndex: 2
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
        <span style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#f36e21',
          textShadow: '0 2px 8px #0002',
          letterSpacing: 0.5
        }}>{pkg.name}</span>
        <span style={{
          fontSize: 15,
          fontWeight: 600,
          color: '#ff9f58',
          background: 'rgba(255,159,88,0.12)',
          borderRadius: 8,
          padding: '2px 12px',
          marginLeft: 8
        }}>{pkg.price} zł</span>
      </div>
      <div style={{ fontSize: 16, opacity: 0.92, marginBottom: 12 }}>{pkg.description}</div>
      <div style={{ display: 'flex', gap: 18, marginTop: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, color: '#fff' }}>
          <svg width="18" height="18" fill="#f36e21" style={{marginRight:2}}><circle cx="9" cy="9" r="8" stroke="#f36e21" strokeWidth="2" fill="none"/><text x="9" y="13" textAnchor="middle" fontSize="11" fill="#f36e21">⏱</text></svg>
          {pkg.duration ? `${pkg.duration} min` : ''}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, color: '#fff' }}>
          <svg width="18" height="18" fill="#ff9f58" style={{marginRight:2}}><circle cx="9" cy="9" r="8" stroke="#ff9f58" strokeWidth="2" fill="none"/><text x="9" y="13" textAnchor="middle" fontSize="11" fill="#ff9f58">👥</text></svg>
          {pkg.people_count ? `${pkg.people_count} osób` : ''}
        </span>
      </div>
    </div>
  );

  // Проверка промокода (поднимаю выше Step2)
  async function checkPromo() {
    if (!form.promoCode) {
      setPromoStatus('idle');
      setPromoDiscount(null);
      return;
    }
    if (!form.time) {
      setPromoStatus('invalid');
      setPromoDiscount(null);
      alert('Najpierw wybierz godzinę, aby sprawdzić kod promocyjny.');
      return;
    }
    setPromoStatus('checking');
    const total = getTotal();
    const res = await fetch('/api/booking/check-promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: form.promoCode, total, time: form.time, date: form.date })
    });
    const data = await res.json();
    if (data.valid) {
      setPromoStatus('valid');
      setPromoDiscount({ amount: data.discountAmount, percent: data.discountPercent, newTotal: data.newTotal });
    } else {
      setPromoStatus('invalid');
      setPromoDiscount(null);
    }
  }

  // Сброс bookingId при изменении даты, времени или packageId
  useEffect(() => {
    setBookingId(null);
  }, [form.date, form.time, packageId]);

  if (!packageId) {
    return <div style={{color:'#fff',textAlign:'center',marginTop:80}}>Nie znaleziono pakietu.</div>;
  }

  if (!pkg) return <div style={{color:'#fff',textAlign:'center',marginTop:80}}>{t('booking.loading')}</div>;

  return (
    <div style={{
      minHeight: '100vh',
      background: `#18171c url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png') repeat`,
      backgroundSize: 'auto',
      padding: '0',
      margin: 0,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <FlyingObjects />
      {/* IN-FOMO button */}
      <InFomoFooterButton />
      <div style={{
        maxWidth: 540,
        margin: '0 auto',
        padding: '48px 0 48px 0',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        zIndex: 2
      }}>
        {PackageInfoBlock}
        <div style={{
          width: '100%',
          background: 'rgba(24, 23, 28, 0.98)',
          borderRadius: 18,
          boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)',
          padding: 32,
          color: '#fff',
          marginBottom: 32,
          position: 'relative',
          zIndex: 2
        }}>
          {step === 1 && Step1}
          {step === 2 && Step2}
          {step === 3 && Step3}
          {step === 4 && Step4}
          {step === 5 && Step5}
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
      </div>
      <style>{`
        .datepicker-input {
          background: #23222a;
          color: #fff;
          border: 2px solid #f36e21;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 16px;
          font-weight: 600;
          outline: none;
        }
        .datepicker-input:focus {
          border-color: #ff9f58;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background: #f36e21 !important;
          color: #fff !important;
        }
        .react-datepicker__day--today {
          color: #000 !important;
          border: 0.1px solid #f36e21;
          border-radius: 8px;
        }
        select, input[type="text"], input[type="email"], input[type="tel"] {
          background: #23222a;
          color: #fff;
          border: 2px solid #f36e21;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 16px;
          font-weight: 600;
          outline: none;
        }
        select:focus, input:focus {
          border-color: #ff9f58;
        }
        option {
          background: #23222a;
          color: #fff;
        }
        select option:checked {
          background: #f36e21;
          color: #fff;
        }
        select {
          max-height: 220px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
