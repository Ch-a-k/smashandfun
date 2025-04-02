'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { isAnalyticsAllowed, trackPageview } from '@/lib/analytics';

export default function GoogleTagManager() {
  const pathname = usePathname();
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-WNX4P4QZ';
  const [isMounted, setIsMounted] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  // Проверяем разрешения и устанавливаем состояние
  useEffect(() => {
    setIsMounted(true);
    setAnalyticsAllowed(isAnalyticsAllowed());
  }, []);

  // Отслеживание изменения страницы
  useEffect(() => {
    if (pathname && isMounted && analyticsAllowed) {
      trackPageview(pathname);
    }
  }, [pathname, isMounted, analyticsAllowed]);

  // Во время первого рендера на сервере или до монтирования возвращаем пустой фрагмент
  if (!isMounted) {
    return null;
  }

  // Не загружаем скрипт, если пользователь не дал согласие на аналитику
  if (!analyticsAllowed) {
    return null;
  }

  return (
    <>
      {/* Google Tag Manager - Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
        onLoad={() => {
          console.log('Google Tag Manager loaded successfully');
        }}
        onError={(e) => {
          console.error('Error loading Google Tag Manager:', e);
        }}
      />

      {/* Инициализация dataLayer без предварительной загрузки */}
      <Script
        id="gtm-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtmId}', { send_page_view: false });
          `,
        }}
      />

      {/* Google Tag Manager - NoScript */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
} 