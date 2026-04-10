"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

// const FB_PIXEL_ID = '2294482037707761'; Fb account Smash&Fun
const FB_PIXEL_ID = "936001329413711"; // Instagram account Smash&Fun

export default function MetaPixel() {
  const pathname = usePathname();
  const hasTrackedInitialPageView = useRef(false);

  // PageView при смене страницы (первый PageView стреляет в inline-скрипте)
  useEffect(() => {
    if (pathname && typeof window !== "undefined" && window.fbq) {
      if (hasTrackedInitialPageView.current) {
        window.fbq("track", "PageView");
      } else {
        hasTrackedInitialPageView.current = true;
      }
    }
  }, [pathname]);

  // Не трекаем в админке
  if (typeof window !== "undefined" && pathname?.startsWith("/admin")) {
    return null;
  }

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
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
