const CLICK_ID_MAP: Record<string, string> = {
  gclid: 'google',
  gbraid: 'google',
  wbraid: 'google',
  fbclid: 'facebook',
  ttclid: 'tiktok',
};

const REFERRER_MAP: [RegExp, string][] = [
  [/google\./i, 'google'],
  [/facebook\.com|fb\.com|fb\.me/i, 'facebook'],
  [/instagram\.com/i, 'facebook'],
  [/tiktok\.com/i, 'tiktok'],
  [/youtube\.com|youtu\.be/i, 'google'],
  [/bing\.com/i, 'bing'],
];

/** Merges URL + localStorage (`booking_utm` from UtmCapture) for attribution on booking/create. */
export function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }

  if (!utm.utm_source) {
    for (const [clickId, source] of Object.entries(CLICK_ID_MAP)) {
      if (params.get(clickId)) {
        utm.utm_source = source;
        if (!utm.utm_medium) utm.utm_medium = 'cpc';
        break;
      }
    }
  }

  if (!utm.utm_source && document.referrer) {
    const ref = document.referrer;
    const isSelf = ref.includes(window.location.hostname);
    if (!isSelf) {
      for (const [pattern, source] of REFERRER_MAP) {
        if (pattern.test(ref)) {
          utm.utm_source = source;
          if (!utm.utm_medium) utm.utm_medium = 'referral';
          break;
        }
      }
      if (!utm.utm_source) {
        try {
          utm.utm_source = new URL(ref).hostname.replace('www.', '');
          utm.utm_medium = 'referral';
        } catch {
          /* ignore */
        }
      }
    }
  }

  if (Object.keys(utm).length > 0) {
    localStorage.setItem('booking_utm', JSON.stringify(utm));
  }
  const saved = localStorage.getItem('booking_utm');
  if (saved) {
    try {
      return { ...JSON.parse(saved), ...utm };
    } catch {
      return utm;
    }
  }
  return utm;
}
