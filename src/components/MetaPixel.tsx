'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isMarketingAllowed } from '@/lib/analytics';

// ID пикселя Facebook
const FB_PIXEL_ID = '2341539319565981';

// Флаг инициализации
const PIXEL_INIT_FLAG = 'FB_PIXEL_INIT';

// Типы для Facebook Pixel
type FbqCommand = 'init' | 'track' | 'trackCustom' | 'trackSingle' | 'consent';
type FbqEvent = 'PageView' | 'ViewContent' | 'CompleteRegistration' | 'Lead' | 'Purchase' | string;
type FbqParams = Record<string, string | number | boolean | null | undefined>;
type Fbq = (command: FbqCommand, eventOrId: FbqEvent | string, params?: FbqParams | FbqEvent, eventParams?: FbqParams) => void;

// Расширяем глобальный интерфейс Window
declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    [PIXEL_INIT_FLAG]?: boolean;
  }
}

export default function MetaPixel() {
  const pathname = usePathname();

  // Инициализация Meta Pixel
  useEffect(() => {
    // Проверяем, разрешены ли маркетинговые куки и не на сервере ли мы
    if (typeof window === 'undefined' || !isMarketingAllowed()) return;
    
    // Если пиксель уже инициализирован, не продолжаем
    if (window[PIXEL_INIT_FLAG]) return;
    
    // Функция инициализации пикселя
    const initPixel = () => {
      // Если fbq уже существует, не переопределяем
      if (window.fbq) return;
      
      // Создаем функцию fbq с расширенными параметрами для TypeScript
      window.fbq = function(command: FbqCommand, eventOrId: FbqEvent | string, params?: FbqParams | FbqEvent, eventParams?: FbqParams) {
        // @ts-expect-error - Необходимо для инициализации Pixel
        if (window.fbq.callMethod) {
          // @ts-expect-error - Необходимо для инициализации Pixel
          window.fbq.callMethod(command, eventOrId, params, eventParams);
        } else {
          // @ts-expect-error - Необходимо для инициализации Pixel
          window.fbq.queue.push([command, eventOrId, params, eventParams]);
        }
      };
      
      // Устанавливаем резервную копию fbq
      if (!window._fbq) window._fbq = window.fbq;
      
      // @ts-expect-error - Добавляем необходимые свойства для fbq
      window.fbq.push = window.fbq;
      // @ts-expect-error - Добавляем необходимые свойства для fbq
      window.fbq.loaded = true;
      // @ts-expect-error - Добавляем необходимые свойства для fbq
      window.fbq.version = '2.0';
      // @ts-expect-error - Добавляем необходимые свойства для fbq
      window.fbq.queue = [];
      
      // Создаем и добавляем скрипт fbevents.js
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      
      script.onload = () => {
        // После загрузки скрипта инициализируем пиксель
        if (window.fbq) {
          window.fbq('init', FB_PIXEL_ID);
          window.fbq('track', 'PageView');
          console.log('Facebook Pixel initialized with ID:', FB_PIXEL_ID);
        }
      };
      
      script.onerror = (e) => {
        console.error('Failed to load Facebook Pixel script:', e);
      };
      
      // Вставляем скрипт в начало head
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
      
      // Устанавливаем флаг инициализации
      window[PIXEL_INIT_FLAG] = true;
    };
    
    // Запускаем инициализацию
    try {
      initPixel();
    } catch (error) {
      console.error('Error initializing Facebook Pixel:', error);
    }
    
    // Очистка при размонтировании компонента
    return () => {
      // Ничего не делаем, так как скрипт должен оставаться на странице
    };
  }, []);
  
  // Отслеживаем изменение URL для отправки PageView при навигации
  useEffect(() => {
    if (typeof window === 'undefined' || !pathname || !isMarketingAllowed()) return;
    
    // Если fbq доступен, отправляем событие PageView при изменении пути
    if (window.fbq) {
      window.fbq('track', 'PageView');
      console.log('PageView tracked for:', pathname);
    }
  }, [pathname]);
  
  // Возвращаем noscript тег для пользователей без JavaScript
  return (
    <noscript>
      <img 
        height="1" 
        width="1" 
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
