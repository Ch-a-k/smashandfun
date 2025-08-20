'use client';

import { useEffect } from 'react';

type UtmParams = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  referrer?: string | null;
  landing_page?: string | null;
  first_touch_at?: string | null; // ISO
};

export default function UTMTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const entries: Partial<UtmParams> = {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_term: params.get('utm_term'),
        utm_content: params.get('utm_content'),
        gclid: params.get('gclid'),
        fbclid: params.get('fbclid'),
      };

      const hasAny = Object.values(entries).some(Boolean);
      const storedRaw = localStorage.getItem('utmParams');
      const stored: UtmParams | null = storedRaw ? JSON.parse(storedRaw) : null;

      const nowIso = new Date().toISOString();
      const merged: UtmParams = {
        utm_source: hasAny ? (entries.utm_source ?? stored?.utm_source ?? null) : (stored?.utm_source ?? null),
        utm_medium: hasAny ? (entries.utm_medium ?? stored?.utm_medium ?? null) : (stored?.utm_medium ?? null),
        utm_campaign: hasAny ? (entries.utm_campaign ?? stored?.utm_campaign ?? null) : (stored?.utm_campaign ?? null),
        utm_term: hasAny ? (entries.utm_term ?? stored?.utm_term ?? null) : (stored?.utm_term ?? null),
        utm_content: hasAny ? (entries.utm_content ?? stored?.utm_content ?? null) : (stored?.utm_content ?? null),
        gclid: hasAny ? (entries.gclid ?? stored?.gclid ?? null) : (stored?.gclid ?? null),
        fbclid: hasAny ? (entries.fbclid ?? stored?.fbclid ?? null) : (stored?.fbclid ?? null),
        referrer: (stored?.referrer ?? (document.referrer || null)) ?? null,
        landing_page: (stored?.landing_page ?? (window.location.href || null)) ?? null,
        first_touch_at: stored?.first_touch_at ?? nowIso,
      };

      localStorage.setItem('utmParams', JSON.stringify(merged));
    } catch {
      // no-op
    }
  }, []);

  return null;
}


