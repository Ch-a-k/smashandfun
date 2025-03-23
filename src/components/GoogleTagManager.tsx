'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';
import { isAnalyticsAllowed, trackPageview } from '@/lib/analytics';

export default function GoogleTagManager() {
  const pathname = usePathname();
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-WNX4P4QZ'; // Добавляем фолбэк на ID из ошибки

  // Отслеживание изменения страницы
  useEffect(() => {
    if (pathname) {
      trackPageview(pathname);
    }
  }, [pathname]);

  // Не загружаем скрипт, если пользователь не дал согласие на аналитику
  // Это проверяется только на клиенте
  if (typeof window !== 'undefined' && !isAnalyticsAllowed()) {
    return null;
  }

  return (
    <>
      {/* Google Tag Manager - Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
      />

      {/* Инициализация dataLayer */}
      <Script
        id="gtm-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtmId}');
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
        />
      </noscript>
    </>
  );
} 