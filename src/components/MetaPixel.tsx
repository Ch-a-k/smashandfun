/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isMarketingAllowed } from '@/lib/analytics';

// ID пикселя Facebook
const FB_PIXEL_ID = '2341539319565981';

// Флаг инициализации
const PIXEL_INIT_FLAG = 'FB_PIXEL_INIT_V2';

// Расширяем глобальный интерфейс Window для типизации
declare global {
  interface Window {
    // @ts-ignore
    fbq?: any;
    // @ts-ignore
    _fbq?: any;
    [PIXEL_INIT_FLAG]?: boolean;
  }
}

export default function MetaPixel() {
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);

  // Очищаем старые скрипты Facebook Pixel
  const cleanupPixelScripts = () => {
    if (typeof window === 'undefined') return;

    console.log('Cleaning up old Facebook pixel scripts and data');
    
    // Находим и удаляем все скрипты с fbevents.js
    const scripts = document.querySelectorAll('script[src*="fbevents.js"]');
    if (scripts.length > 0) {
      console.log(`Removing ${scripts.length} existing Facebook Pixel scripts`);
      scripts.forEach(script => script.parentNode?.removeChild(script));
    }
    
    // Удаляем старые noscript теги с пикселями
    const noscripts = document.querySelectorAll('noscript img[src*="facebook.com/tr"]');
    if (noscripts.length > 0) {
      noscripts.forEach(img => {
        const noscript = img.closest('noscript');
        if (noscript) noscript.parentNode?.removeChild(noscript);
      });
    }
    
    // Удаляем глобальные объекты Facebook Pixel
    try {
      delete window.fbq;
      delete window._fbq;
      delete window[PIXEL_INIT_FLAG];
      
      // Удаляем все cookie с именами, содержащими "fb"
      document.cookie.split(';').forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();
        if (cookieName.includes('fb') || cookieName.includes('_fb')) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
    } catch (error) {
      console.error('Error cleaning up Facebook Pixel data:', error);
    }
  };

  // Инициализация Meta Pixel
  useEffect(() => {
    // Проверяем, разрешены ли маркетинговые куки и не на сервере ли мы
    if (typeof window === 'undefined') return;
    
    // Если маркетинговые куки не разрешены, очищаем пиксель
    if (!isMarketingAllowed()) {
      cleanupPixelScripts();
      return;
    }
    
    // Если пиксель уже инициализирован в этой сессии, не продолжаем
    if (initialized) return;
    
    // Функция инициализации пикселя
    const initPixel = () => {
      // Сначала очищаем старые скрипты
      cleanupPixelScripts();
      
      // Создаем функцию fbq
      window.fbq = function(command, eventOrId, params, eventParams) {
        // @ts-ignore
        if (window.fbq.callMethod) {
          // @ts-ignore
          window.fbq.callMethod(command, eventOrId, params, eventParams);
        } else {
          // @ts-ignore
          window.fbq.queue.push([command, eventOrId, params, eventParams]);
        }
      };
      
      // Устанавливаем резервную копию fbq
      if (!window._fbq) window._fbq = window.fbq;
      
      // @ts-ignore
      window.fbq.push = window.fbq;
      // @ts-ignore
      window.fbq.loaded = true;
      // @ts-ignore
      window.fbq.version = '2.0';
      // @ts-ignore
      window.fbq.queue = [];
      
      // Создаем и добавляем скрипт fbevents.js
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      
      script.onload = () => {
        // После загрузки скрипта инициализируем пиксель с новым ID
        if (window.fbq) {
          console.log(`Initializing Facebook Pixel with ID: ${FB_PIXEL_ID}`);
          window.fbq('init', FB_PIXEL_ID);
          window.fbq('track', 'PageView');
          
          // Устанавливаем флаг инициализации
          window[PIXEL_INIT_FLAG] = true;
          setInitialized(true);
        }
      };
      
      script.onerror = (e) => {
        console.error('Failed to load Facebook Pixel script:', e);
        setInitialized(false);
      };
      
      // Вставляем скрипт в начало head
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    };
    
    // Запускаем инициализацию
    try {
      initPixel();
    } catch (error) {
      console.error('Error initializing Facebook Pixel:', error);
      setInitialized(false);
    }
  }, [initialized]);
  
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
  return isMarketingAllowed() ? (
    <noscript>
      <img 
        height="1" 
        width="1" 
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  ) : null;
}
