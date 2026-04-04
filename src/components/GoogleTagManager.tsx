"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isAnalyticsAllowed, trackPageview } from "@/lib/analytics";

export default function GoogleTagManager() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  // Проверяем разрешения и устанавливаем состояние
  useEffect(() => {
    setIsMounted(true);
    setAnalyticsAllowed(isAnalyticsAllowed());
  }, []);

  // Отслеживание изменения страницы
  useEffect(() => {
    if (pathname && isMounted && analyticsAllowed && !pathname.startsWith("/admin")) {
      trackPageview(pathname);
    }
  }, [pathname, isMounted, analyticsAllowed]);

  return null;
}
