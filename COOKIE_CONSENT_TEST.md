# Тестирование Cookie Consent

## ✅ Проверка системы согласия на cookies

### Архитектура системы:

```
CookieConsent Component
    ↓
localStorage: 'cookieConsent'
    ↓
analytics.ts: isAnalyticsAllowed()
    ↓
GoogleTagManager & TikTokPixel
```

## 🧪 Как протестировать

### 1. Очистка данных (начало теста)

Откройте DevTools (F12) → Console и выполните:

```javascript
// Очистить согласие на cookies
localStorage.removeItem('cookieConsent');

// Перезагрузить страницу
location.reload();
```

**Ожидаемый результат:** Баннер с согласием должен появиться внизу экрана.

---

### 2. Тест: Отклонение всех cookies

1. Нажмите кнопку **"Odrzuć wszystkie"** (Reject all)
2. Откройте DevTools → Console
3. Проверьте localStorage:

```javascript
JSON.parse(localStorage.getItem('cookieConsent'))
```

**Ожидаемый результат:**
```json
{
  "necessary": true,
  "analytics": false,
  "marketing": false
}
```

4. Проверьте, что аналитические скрипты НЕ загружены:

```javascript
// Google Tag Manager НЕ должен быть загружен
console.log('GTM loaded:', typeof window.gtag !== 'undefined');

// TikTok Pixel НЕ должен быть загружен
console.log('TikTok Pixel loaded:', typeof window.ttq !== 'undefined');
```

**Ожидаемый результат:** Оба должны показать `false`

---

### 3. Тест: Принятие всех cookies

1. Очистите данные (см. шаг 1)
2. Нажмите кнопку **"Akceptuj wszystkie"** (Accept all)
3. Страница должна автоматически перезагрузиться
4. После перезагрузки проверьте:

```javascript
// Проверка localStorage
JSON.parse(localStorage.getItem('cookieConsent'))

// Проверка загрузки скриптов
console.log('GTM loaded:', typeof window.gtag !== 'undefined');
console.log('TikTok Pixel loaded:', typeof window.ttq !== 'undefined');
console.log('DataLayer:', window.dataLayer);
```

**Ожидаемый результат:**
- Согласие: `{ necessary: true, analytics: true, marketing: true }`
- GTM loaded: `true`
- TikTok Pixel loaded: `true`
- DataLayer: массив с данными

---

### 4. Тест: Выборочное согласие

1. Очистите данные (см. шаг 1)
2. Нажмите **"Ustawienia"** (Settings)
3. Включите **ТОЛЬКО аналитические** cookies
4. Выключите маркетинговые cookies
5. Нажмите **"Zapisz ustawienia"** (Save settings)
6. Страница перезагрузится
7. Проверьте:

```javascript
JSON.parse(localStorage.getItem('cookieConsent'))
```

**Ожидаемый результат:**
```json
{
  "necessary": true,
  "analytics": true,
  "marketing": false
}
```

---

### 5. Тест: Изменение согласия

1. Откройте модальное окно настроек снова
2. Измените настройки
3. Сохраните
4. **Страница должна автоматически перезагрузиться** (только если изменились analytics или marketing)

---

### 6. Тест: Отслеживание событий

После принятия аналитических cookies, проверьте отслеживание:

```javascript
// Проверка Google Tag Manager
window.dataLayer.push({
  event: 'test_event',
  category: 'test',
  action: 'manual_test'
});

console.log('DataLayer after push:', window.dataLayer);

// Проверка TikTok Pixel
if (window.ttq) {
  window.ttq.track('ViewContent', {
    content_type: 'test',
    content_name: 'cookie_test'
  });
  console.log('TikTok event sent');
}
```

---

### 7. Тест: Поведение в админке

1. Перейдите на `/admin/login`
2. Откройте Console
3. Проверьте:

```javascript
console.log('GTM in admin:', typeof window.gtag !== 'undefined');
console.log('TikTok in admin:', typeof window.ttq !== 'undefined');
```

**Ожидаемый результат:** Оба должны быть `false` - аналитика не загружается в админке

---

## 🔍 Проверка в Network Tab

1. Откройте DevTools → Network
2. Перезагрузите страницу с принятым согласием
3. Отфильтруйте по:
   - `analytics.tiktok.com` - для TikTok Pixel
   - `googletagmanager.com` - для GTM

**Ожидаемый результат:** При согласии - запросы присутствуют, без согласия - отсутствуют

---

## 📱 Мобильное тестирование

1. Откройте DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Выберите мобильное устройство
3. Проверьте:
   - Баннер отображается корректно
   - Кнопки кликабельны
   - Модальное окно настроек адаптивно

---

## 🌐 Тест переключения языка

1. Переключите язык на английский (EN)
2. Очистите согласие: `localStorage.removeItem('cookieConsent')`
3. Перезагрузите страницу
4. Проверьте, что тексты на английском:
   - "We use cookies to ensure the best experience on our website."
   - "Accept all" / "Reject all" / "Settings"

---

## ✅ Критерии успеха

- [ ] Баннер появляется при первом посещении
- [ ] Согласие сохраняется в localStorage
- [ ] Аналитика загружается ТОЛЬКО при согласии
- [ ] Страница перезагружается при изменении настроек
- [ ] Аналитика НЕ загружается в `/admin/*`
- [ ] Модальное окно настроек работает корректно
- [ ] Переводы работают на PL и EN
- [ ] Мобильная версия адаптивна

---

## 🐛 Возможные проблемы

### Баннер не появляется:
```javascript
// Проверьте, что согласие НЕ сохранено
console.log(localStorage.getItem('cookieConsent'));

// Если есть, удалите и перезагрузите
localStorage.removeItem('cookieConsent');
location.reload();
```

### Скрипты не загружаются после согласия:
```javascript
// Проверьте флаг согласия
const consent = JSON.parse(localStorage.getItem('cookieConsent'));
console.log('Analytics allowed:', consent?.analytics);

// Проверьте, что страница перезагрузилась после согласия
// (аналитика загружается только при первой загрузке страницы)
```

### Ошибки в консоли:
- Проверьте, что `.env.local` настроен корректно
- Убедитесь, что все зависимости установлены

---

## 📊 Интеграция с аналитикой

### Google Tag Manager (GTM-WNX4P4QZ)
- Загружается при `analytics: true`
- Доступен через `window.gtag()`
- DataLayer: `window.dataLayer`

### TikTok Pixel (D5UT3I3C77U3UMFCPIVG)
- Загружается при `analytics: true`
- Доступен через `window.ttq`
- Методы: `page()`, `track()`, `identify()`

### События для трекинга:
```javascript
// В вашем коде используйте:
import { trackEvent, trackTikTokEvent } from '@/lib/analytics';

// Google Analytics событие
trackEvent({
  action: 'booking_completed',
  category: 'ecommerce',
  label: 'package_premium',
  value: 200
});

// TikTok событие
trackTikTokEvent('CompleteRegistration', {
  value: 200,
  currency: 'PLN',
  content_type: 'booking'
});
```
