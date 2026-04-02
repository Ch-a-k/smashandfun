"use client";
import { useEffect } from "react";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const STORAGE_KEY = "booking_utm";

// Map click IDs and referrer domains to source names
const CLICK_ID_MAP: Record<string, string> = {
  gclid: "google",
  gbraid: "google",
  wbraid: "google",
  fbclid: "facebook",
  ttclid: "tiktok",
};

const REFERRER_MAP: [RegExp, string][] = [
  [/google\./i, "google"],
  [/facebook\.com|fb\.com|fb\.me/i, "facebook"],
  [/instagram\.com/i, "facebook"],
  [/tiktok\.com/i, "tiktok"],
  [/youtube\.com|youtu\.be/i, "google"],
  [/bing\.com/i, "bing"],
];

export default function UtmCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};

    // 1. Capture standard UTM params
    for (const key of UTM_KEYS) {
      const val = params.get(key);
      if (val) utm[key] = val;
    }

    // 2. Detect source from click IDs (gclid, fbclid, ttclid) if utm_source is missing
    if (!utm.utm_source) {
      for (const [clickId, source] of Object.entries(CLICK_ID_MAP)) {
        if (params.get(clickId)) {
          utm.utm_source = source;
          if (!utm.utm_medium) utm.utm_medium = "cpc";
          break;
        }
      }
    }

    // 3. Detect source from referrer if still nothing
    if (!utm.utm_source && document.referrer) {
      const ref = document.referrer;
      const isSelf = ref.includes(window.location.hostname);
      if (!isSelf) {
        for (const [pattern, source] of REFERRER_MAP) {
          if (pattern.test(ref)) {
            utm.utm_source = source;
            if (!utm.utm_medium) utm.utm_medium = "referral";
            break;
          }
        }
        if (!utm.utm_source) {
          try {
            utm.utm_source = new URL(ref).hostname.replace("www.", "");
            if (!utm.utm_medium) utm.utm_medium = "referral";
          } catch { /* ignore */ }
        }
      }
    }

    // 4. Always capture referrer and landing page on first visit
    const saved = localStorage.getItem(STORAGE_KEY);
    let existing: Record<string, string> = {};
    if (saved) {
      try { existing = JSON.parse(saved); } catch { /* ignore */ }
    }

    // Save original referrer (only first time — don't overwrite with internal referrer)
    if (!existing.referrer && document.referrer) {
      const isSelf = document.referrer.includes(window.location.hostname);
      if (!isSelf) {
        utm.referrer = document.referrer;
      }
    }

    // Save original landing page (only first time)
    if (!existing.landing_page) {
      utm.landing_page = window.location.pathname + window.location.search;
    }

    if (Object.keys(utm).length === 0) return;

    // Merge: new values override old
    const merged = { ...existing, ...utm };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }, []);
  return null;
}
