'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { isAnalyticsAllowed } from '@/lib/analytics';

export default function TikTokPixel() {
  const pathname = usePathname();
  const pixelId = 'D6276P3C77U6LCNG39R0';
  const [isMounted, setIsMounted] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  // Проверяем разрешения и устанавливаем состояние
  useEffect(() => {
    setIsMounted(true);
    setAnalyticsAllowed(isAnalyticsAllowed());
  }, []);

  // Отслеживание изменения страницы
  useEffect(() => {
    if (pathname && isMounted && analyticsAllowed && typeof window !== 'undefined' && window.ttq) {
      window.ttq.page();
    }
  }, [pathname, isMounted, analyticsAllowed]);

  // Во время первого рендера на сервере или до монтирования возвращаем пустой фрагмент
  if (!isMounted) {
    return null;
  }

  // Не грузим аналитику в админке
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Не загружаем скрипт, если пользователь не дал согласие на аналитику
  if (!analyticsAllowed) {
    return null;
  }

  return (
    <>
      {/* TikTok Pixel Code */}
      <Script
        id="tiktok-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

  ttq.load('${pixelId}');
  ttq.page();
}(window, document, 'ttq');
          `,
        }}
        onLoad={() => {
          console.log('TikTok Pixel loaded successfully');
        }}
        onError={(e) => {
          console.error('Error loading TikTok Pixel:', e);
        }}
      />
    </>
  );
}
