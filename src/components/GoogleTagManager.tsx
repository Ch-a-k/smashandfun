"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import { isAnalyticsAllowed, trackPageview } from "@/lib/analytics";

export default function GoogleTagManager() {
  const pathname = usePathname();
  const gaId = "G-VFW33JQ6EG";
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

  // Не грузим аналитику в админке (и не получаем CORS/iframe шум в консоли)
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Не загружаем скрипт, если пользователь не дал согласие на аналитику
  if (!analyticsAllowed) {
    return null;
  }

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        id="gtag-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        onLoad={() => {
          console.log("Google Analytics loaded successfully");
        }}
        onError={(e) => {
          console.error("Error loading Google Analytics:", e);
        }}
      />

      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', { send_page_view: false });
          `,
        }}
      />

      {/* Google Analytics - NoScript fallback (не нужен для gtag, но сохраняем для совместимости) */}
      <noscript>
        <img
          src={`https://www.google-analytics.com/collect?v=1&tid=${gaId}&t=pageview`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          alt=""
        />
      </noscript>
    </>
  );
}
