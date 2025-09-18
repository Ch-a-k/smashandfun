/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { isMarketingAllowed } from "@/lib/analytics";
import Script from "next/script";

// ID пикселя Facebook (разрешённый единственный ID)
const FB_PIXEL_ID = "737878458949440";

const PIXEL_INIT_FLAG = "FB_PIXEL_INIT_V3";

const isClient = () => typeof window !== "undefined";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isClient() || !isMarketingAllowed() || !pathname) return;
    // Отправляем PageView при изменении пути
    if (window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  if (!mounted || !isMarketingAllowed()) return null;

  return (
    <>
      {/* Guard/Wrapper: блокирует инициализации Pixel с чужими ID, в т.ч. из GTM */}
      <Script
        id="fb-pixel-guard"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(allowedId){
              try {
                var wrapped = false;
                var tryWrap = function(){
                  if (wrapped) return;
                  if (!window.fbq || window.fbq.__wrapped) return;
                  var realFbq = window.fbq;
                  var wrappedFbq = function(command){
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (command === 'init') {
                      var id = String(args[0] || '');
                      if (id !== allowedId) {
                        console.warn('[FBQ] Blocked init for disallowed ID', id);
                        return;
                      }
                    }
                    if (command === 'trackSingle') {
                      var singleId = String(args[0] || '');
                      if (singleId !== allowedId) {
                        console.warn('[FBQ] Blocked trackSingle for disallowed ID', singleId);
                        return;
                      }
                    }
                    return realFbq.apply(window, [command].concat(args));
                  };
                  wrappedFbq.__wrapped = true;
                  window.fbq = wrappedFbq;
                  wrapped = true;
                };
                // Пытаемся обернуть сразу и ещё несколько раз, чтобы опередить GTM
                tryWrap();
                var iv = setInterval(tryWrap, 20);
                setTimeout(function(){ clearInterval(iv); }, 10000);
              } catch (e) {
                console.error('FBQ guard error', e);
              }
            })('${FB_PIXEL_ID}');
          `,
        }}
      />
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
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
