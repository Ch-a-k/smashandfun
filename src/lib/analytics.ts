// Типы для работы с Google Analytics
interface GTagEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  non_interaction?: boolean;
}

// Типы для window.gtag
type GTagArg = string | GTagEvent | Record<string, unknown>;

// Типы для Facebook Pixel
type FbqCommand = 'init' | 'track' | 'trackCustom' | 'trackSingle' | 'consent';
type FbqEvent = 'PageView' | 'ViewContent' | 'CompleteRegistration' | 'Lead' | 'Purchase' | string;
type FbqParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, ...args: GTagArg[]) => void;
    dataLayer?: unknown[];
    fbq?: (command: FbqCommand, eventOrId: FbqEvent | string, params?: FbqParams | FbqEvent, eventParams?: FbqParams) => void;
    _fbPixelInit?: boolean; // Флаг для отслеживания инициализации пикселя
  }
}

// Проверяет, выполняется ли код на клиенте
const isClient = () => typeof window !== 'undefined';

// Инициализация Google Analytics
export const pageview = (url: string): void => {
  if (!isClient() || !window.gtag) return;
  
  window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID as string, {
    page_path: url,
  });
};

// Отправка события в Google Analytics
export const event = ({ action, category, label, value, non_interaction }: GTagEvent): void => {
  if (!isClient() || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    non_interaction: non_interaction,
  });
};

// Безопасно получает значение из localStorage
const safeGetLocalStorage = (key: string): string | null => {
  if (!isClient()) return null;
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error accessing localStorage for key ${key}:`, error);
    return null;
  }
};

// Проверяет, разрешена ли аналитика в настройках куки
export const isAnalyticsAllowed = (): boolean => {
  if (!isClient()) return false;
  
  try {
    const consent = safeGetLocalStorage('cookieConsent');
    if (!consent) return false;
    
    const parsedConsent = JSON.parse(consent);
    return parsedConsent?.analytics === true;
  } catch (error) {
    console.error('Error checking analytics consent:', error);
    return false;
  }
};

// Проверяет, разрешены ли маркетинговые файлы cookie в настройках
export const isMarketingAllowed = (): boolean => {
  if (!isClient()) return false;
  
  try {
    const consent = safeGetLocalStorage('cookieConsent');
    if (!consent) return false;
    
    const parsedConsent = JSON.parse(consent);
    return parsedConsent?.marketing === true;
  } catch (error) {
    console.error('Error checking marketing consent:', error);
    return false;
  }
};

// Трекинг событий на основе пользовательского согласия
export const trackEvent = (eventParams: GTagEvent): void => {
  if (isAnalyticsAllowed()) {
    event(eventParams);
  }
};

// Трекинг просмотра страницы на основе пользовательского согласия
export const trackPageview = (url: string): void => {
  if (isAnalyticsAllowed()) {
    pageview(url);
  }
}; 