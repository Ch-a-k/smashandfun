/**
 * First-touch UTM: always merge from localStorage first, then current URL.
 * Referrer-based "google + referral" runs only if there is still no utm_source
 * (so it cannot overwrite a saved gclid/UTM/campaign from the first landing).
 */

export const UTM_PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

export const CLICK_ID_MAP: Record<string, string> = {
  gclid: 'google',
  gbraid: 'google',
  wbraid: 'google',
  fbclid: 'facebook',
  ttclid: 'tiktok',
};

/** Order matters: more specific hosts before generic (e.g. google.). */
export const REFERRER_MAP: [RegExp, string][] = [
  [/chat\.openai\.com|chatgpt\.com/i, 'chatgpt'],
  [/perplexity\.ai/i, 'perplexity'],
  [/claude\.ai/i, 'claude'],
  [/copilot\.microsoft\.com/i, 'copilot'],
  [/gemini\.google\.com/i, 'gemini'],
  [/duckduckgo\./i, 'duckduckgo'],
  [/yandex\./i, 'yandex'],
  [/google\./i, 'google'],
  [/facebook\.com|fb\.com|fb\.me/i, 'facebook'],
  [/instagram\.com/i, 'facebook'],
  [/tiktok\.com/i, 'tiktok'],
  [/youtube\.com|youtu\.be/i, 'google'],
  [/bing\.com/i, 'bing'],
];

/**
 * @param existing — parsed booking_utm from localStorage (may be {})
 */
export function mergeUtmAttribution(
  existing: Record<string, string>,
  searchParams: URLSearchParams,
  hostname: string,
  documentReferrer: string | null
): Record<string, string> {
  const out: Record<string, string> = { ...existing };

  for (const key of UTM_PARAM_KEYS) {
    const v = searchParams.get(key);
    if (v) out[key] = v;
  }

  if (!searchParams.get('utm_source')) {
    for (const [clickId, source] of Object.entries(CLICK_ID_MAP)) {
      if (searchParams.get(clickId)) {
        out.utm_source = source;
        if (!out.utm_medium) out.utm_medium = 'cpc';
        break;
      }
    }
  }

  if (!out.utm_source && documentReferrer) {
    const isSelf = documentReferrer.includes(hostname);
    if (!isSelf) {
      for (const [pattern, source] of REFERRER_MAP) {
        if (pattern.test(documentReferrer)) {
          out.utm_source = source;
          if (!out.utm_medium) out.utm_medium = 'referral';
          break;
        }
      }
      if (!out.utm_source) {
        try {
          out.utm_source = new URL(documentReferrer).hostname.replace('www.', '');
          if (!out.utm_medium) out.utm_medium = 'referral';
        } catch {
          /* ignore */
        }
      }
    }
  }

  return out;
}
