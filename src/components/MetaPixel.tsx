/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isMarketingAllowed } from '@/lib/analytics';

// ID пикселя Facebook
const FB_PIXEL_ID = '2341539319565981';

// Старый ID пикселя, который нужно обнаружить и удалить
const OLD_PIXEL_ID = '3458226151146279';

// Флаг инициализации
const PIXEL_INIT_FLAG = 'FB_PIXEL_INIT_V3';

// Глобальный флаг для предотвращения повторной очистки
let fbPixelCleaned = false;

// Функция для безопасной проверки, выполняется ли код на клиенте
const isClient = () => typeof window !== 'undefined';

// Расширяем глобальный интерфейс Window для типизации
declare global {
  interface Window {
    // @ts-ignore
    fbq?: any;
    // @ts-ignore
    _fbq?: any;
    [PIXEL_INIT_FLAG]?: boolean;
    // Добавляем специальное свойство для отслеживания очистки
    fbPixelCleaned?: boolean;
  }
}

/**
 * Очистка старых скриптов и данных Facebook Pixel
 */
function cleanupPixelScripts() {
  if (!isClient() || fbPixelCleaned) return;
  
  console.log('Cleaning up old Facebook pixel scripts and data');
  
  try {
    // Удаляем все скрипты, относящиеся к Facebook Pixel
    document.querySelectorAll('script').forEach(script => {
      const src = script.getAttribute('src') || '';
      if (src.includes('connect.facebook.net') || 
          src.includes('facebook.com/tr') || 
          (script.innerHTML && (
            script.innerHTML.includes('fbq') || 
            script.innerHTML.includes(OLD_PIXEL_ID) || 
            script.innerHTML.includes(FB_PIXEL_ID)
          ))) {
        script.parentNode?.removeChild(script);
      }
    });
    
    // Удаляем все noscript теги, которые могут относиться к Facebook Pixel
    document.querySelectorAll('noscript').forEach(noscript => {
      if (noscript.innerHTML && (
        noscript.innerHTML.includes('facebook.com/tr') || 
        noscript.innerHTML.includes(OLD_PIXEL_ID) || 
        noscript.innerHTML.includes(FB_PIXEL_ID)
      )) {
        noscript.parentNode?.removeChild(noscript);
      }
    });
    
    // Удаляем все куки Facebook
    document.cookie.split(';').forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.startsWith('_fb') || 
          cookieName.startsWith('fr') || 
          cookieName.startsWith('fb') || 
          cookieName.includes('facebook')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    // Очищаем локальное хранилище от элементов, связанных с Facebook
    if (isClient() && window.localStorage) {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('fb') || 
            key.includes('FB') || 
            key.includes('facebook') || 
            key.includes('pixel')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // Очищаем sessionStorage от элементов, связанных с Facebook
    if (isClient() && window.sessionStorage) {
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('fb') || 
            key.includes('FB') || 
            key.includes('facebook') || 
            key.includes('pixel')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    // Удаляем глобальный объект fbq
    if (isClient() && (window as any).fbq) {
      delete (window as any).fbq;
    }
    
    fbPixelCleaned = true;
  } catch (error) {
    console.error('Error cleaning up Facebook Pixel:', error);
  }
}

export default function MetaPixel() {
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);

  // Инициализация Meta Pixel
  useEffect(() => {
    if (!isClient()) return;
    
    // Очищаем старые скрипты и данные
    cleanupPixelScripts();
    
    // Проверяем согласие на маркетинг
    if (!isMarketingAllowed()) {
      console.log('Marketing not allowed by user, Facebook Pixel not initialized');
      return;
    }
    
    // Если пиксель уже инициализирован в этой сессии, не продолжаем
    if (initialized) return;
    
    // Функция инициализации пикселя
    const initPixel = () => {
      // На всякий случай еще раз очищаем
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
    
    // Запускаем инициализацию с небольшой задержкой, чтобы дать время другим скриптам загрузиться
    setTimeout(() => {
      try {
        initPixel();
      } catch (error) {
        console.error('Error initializing Facebook Pixel:', error);
        setInitialized(false);
      }
    }, 100);
    
    return () => {
      // Очистка при размонтировании компонента
      cleanupPixelScripts();
    };
  }, [initialized]);
  
  // Отслеживаем изменение пути для отправки PageView
  useEffect(() => {
    if (!isClient() || !isMarketingAllowed() || !pathname) return;
    
    // Отправляем PageView при изменении пути
    // @ts-ignore
    if (window.fbq) {
      // @ts-ignore
      window.fbq('track', 'PageView');
    }
  }, [pathname]);
  
  return null;
}
