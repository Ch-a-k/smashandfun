/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isMarketingAllowed } from '@/lib/analytics';
import Script from 'next/script';

// ID пикселя Facebook
const FB_PIXEL_ID = '3458226151146279';

// Старый ID пикселя, который нужно обнаружить и удалить
const OLD_PIXEL_ID = '1234567890';

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

  // Проверяем согласие на маркетинг
  if (!isMarketingAllowed()) return null;

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
            window['${PIXEL_INIT_FLAG}'] = true;
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
