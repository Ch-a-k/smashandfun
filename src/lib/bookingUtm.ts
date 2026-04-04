import { mergeUtmAttribution } from '@/lib/utmAttribution';

const STORAGE_KEY = 'booking_utm';

/** Merges localStorage (`booking_utm` from UtmCapture) + current URL for booking/create. */
export function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  let existing: Record<string, string> = {};
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      existing = JSON.parse(raw);
      if (typeof existing !== 'object' || existing === null) existing = {};
    } catch {
      existing = {};
    }
  }

  const params = new URLSearchParams(window.location.search);
  const merged = mergeUtmAttribution(
    existing,
    params,
    window.location.hostname,
    typeof document !== 'undefined' ? document.referrer || null : null
  );

  if (!merged.landing_page) {
    merged.landing_page = window.location.pathname + window.location.search;
  }
  if (!merged.referrer && document.referrer) {
    const isSelf = document.referrer.includes(window.location.hostname);
    if (!isSelf) merged.referrer = document.referrer;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}
