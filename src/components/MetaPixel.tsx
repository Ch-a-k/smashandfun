'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';
import { isMarketingAllowed } from '@/lib/analytics';

// ID пикселя Facebook
const FB_PIXEL_ID = '3458226151146279';

export default function MetaPixel() {
  const pathname = usePathname();

  // Инициализируем пиксель при первой загрузке
  useEffect(() => {
    // Проверяем разрешение на маркетинговые куки
    if (typeof window === 'undefined' || !isMarketingAllowed()) {
      return;
    }

    // Проверяем, не инициализирован ли уже пиксель
    if (!window._fbPixelInit && window.fbq) {
      console.log('Facebook Pixel already present, marking as initialized');
      window._fbPixelInit = true;
    }
  }, []);

  // Отслеживание изменения страницы
  useEffect(() => {
    if (pathname && typeof window !== 'undefined' && window.fbq && isMarketingAllowed()) {
      // Отправляем событие PageView только если скрипт уже загружен
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  // Не загружаем скрипт, если пользователь не дал согласие на маркетинговые куки
  if (typeof window !== 'undefined' && !isMarketingAllowed()) {
    return null;
  }

  // Если пиксель уже загружен, не загружаем скрипт повторно
  if (typeof window !== 'undefined' && window._fbPixelInit) {
    return null;
  }

  return (
    <>
      {/* Meta Pixel Code */}
      <Script
        id="meta-pixel-script"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Meta Pixel script loaded successfully');
        }}
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
            
            // Предотвращаем повторную инициализацию с тем же ID
            if (!window._fbPixelInit) {
              fbq('init', '${FB_PIXEL_ID}');
              fbq('track', 'PageView');
              window._fbPixelInit = true;
              console.log('Facebook Pixel initialized with ID: ${FB_PIXEL_ID}');
            }
          `,
        }}
      />

      {/* Meta Pixel NoScript */}
      <noscript>
        <img 
          height="1" 
          width="1" 
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
