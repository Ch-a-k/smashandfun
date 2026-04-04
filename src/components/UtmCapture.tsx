"use client";
import { useEffect } from "react";
import { mergeUtmAttribution } from "@/lib/utmAttribution";

const STORAGE_KEY = "booking_utm";

export default function UtmCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let existing: Record<string, string> = {};
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (typeof p === "object" && p !== null) existing = p;
      } catch {
        /* ignore */
      }
    }

    const params = new URLSearchParams(window.location.search);
    const merged = mergeUtmAttribution(
      existing,
      params,
      window.location.hostname,
      document.referrer || null
    );

    if (!merged.landing_page) {
      merged.landing_page = window.location.pathname + window.location.search;
    }
    if (!merged.referrer && document.referrer) {
      const isSelf = document.referrer.includes(window.location.hostname);
      if (!isSelf) merged.referrer = document.referrer;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }, []);
  return null;
}
