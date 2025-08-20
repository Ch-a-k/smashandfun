/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { isMarketingAllowed } from '@/lib/analytics';
import Script from 'next/script';

// ID пикселя Facebook
const FB_PIXEL_ID = '3458226151146279';

// Флаг инициализации
const PIXEL_INIT_FLAG = 'FB_PIXEL_INIT_V3';


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

  }
}

// Удаляю функцию cleanupPixelScripts и связанные с ней переменные

export default function MetaPixel() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Отслеживаем изменение пути для отправки PageView
  useEffect(() => {
    if (!isClient() || !isMarketingAllowed() || !pathname) return;
    // Отправляем PageView при изменении пути
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  // Проверяем согласие на маркетинг и монтирование (чтобы избежать SSR/CSR расхождений)
  if (!mounted || !isMarketingAllowed()) return null;

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
        <Image
          height={1}
          width={1}
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
