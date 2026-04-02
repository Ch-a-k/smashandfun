"use client";
import { useEffect } from "react";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const STORAGE_KEY = "booking_utm";

export default function UtmCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const val = params.get(key);
      if (val) utm[key] = val;
    }
    if (Object.keys(utm).length === 0) return;
    // Merge with existing (new values override old)
    // Use localStorage so it persists across tabs (target="_blank" booking links)
    const saved = localStorage.getItem(STORAGE_KEY);
    let merged = utm;
    if (saved) {
      try { merged = { ...JSON.parse(saved), ...utm }; } catch { /* ignore */ }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }, []);
  return null;
}
