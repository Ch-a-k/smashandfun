/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isMarketingAllowed } from '@/lib/analytics';

// ID пикселя Facebook
const FB_PIXEL_ID = '3458226151146279';

// Переменная для отслеживания, что инициализацию делаем мы
const OUR_INIT_FLAG = 'SMF_FB_PIXEL_INIT';

// Расширяем типизацию Window и добавляем типы для Facebook Pixel
declare global {
  interface Window {
    [OUR_INIT_FLAG]?: boolean;
    _fbq?: any; // Facebook использует это свойство для отслеживания состояния пикселя
  }
}

// Тип для стаба fbq
interface FbqStub {
  (...args: any[]): void;
  callMethod?: (...args: any[]) => void;
  queue: any[];
  push: FbqStub;
  loaded: boolean;
  version: string;
}

// Функция для инициализации пикселя Facebook
const initPixel = () => {
  if (typeof window === 'undefined') return;
  
  // Если наш флаг инициализации установлен, ничего не делаем
  if (window[OUR_INIT_FLAG]) return;
  
  // Если window.fbq не определен, не можем инициализировать
  if (!window.fbq) return;
  
  try {
    // Устанавливаем наш флаг до инициализации, чтобы предотвратить рекурсию
    window[OUR_INIT_FLAG] = true;
    
    // Проверяем, не существует ли уже _fbq (что указывает на то, что пиксель уже инициализирован)
    if (!window._fbq) {
      console.log('Initializing Facebook Pixel for the first time');
      window.fbq('init', FB_PIXEL_ID);
      window.fbq('track', 'PageView');
    } else {
      console.log('Facebook Pixel appears to be already initialized, skipping init');
    }
    
    // Устанавливаем общий флаг инициализации
    window._fbPixelInit = true;
  } catch (err) {
    console.error('Error initializing Facebook Pixel:', err);
    // В случае ошибки сбрасываем флаг
    window[OUR_INIT_FLAG] = false;
  }
};

// Функция для проверки и удаления существующих дублирующихся скриптов
const cleanupExistingScripts = () => {
  if (typeof window === 'undefined') return;
  
  // Находим все скрипты с фрагментом fbevents.js в src
  const scripts = document.querySelectorAll('script[src*="fbevents.js"]');
  
  // Если найдено более одного скрипта, удаляем все, кроме первого
  if (scripts.length > 1) {
    console.log(`Found ${scripts.length} Facebook Pixel scripts, removing duplicates`);
    for (let i = 1; i < scripts.length; i++) {
      const script = scripts[i];
      script.parentNode?.removeChild(script);
    }
  }
};

// Функция для загрузки скрипта Facebook Pixel
const loadPixelScript = () => {
  if (typeof window === 'undefined') return;
  
  // Сначала очищаем существующие скрипты
  cleanupExistingScripts();
  
  // Проверяем, может быть fbq уже существует
  if (window.fbq) {
    console.log('Facebook Pixel already exists, initializing directly');
    initPixel();
    return;
  }

  // Базовая инициализация fbq
  const fbqStub = function(...args: any[]) {
    if ((fbqStub as FbqStub).callMethod) {
      const method = (fbqStub as FbqStub).callMethod;
      if (method) method(...args);
    } else {
      (fbqStub as FbqStub).queue.push(args);
    }
  } as FbqStub;
  
  fbqStub.queue = [];
  fbqStub.push = fbqStub;
  fbqStub.loaded = true;
  fbqStub.version = '2.0';
  
  window.fbq = fbqStub as any;
  window._fbq = fbqStub;

  // Создаем скрипт вручную
  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';

  // Инициализируем Facebook Pixel после загрузки скрипта
  script.onload = () => {
    console.log('Facebook Pixel script loaded');
    initPixel();
  };

  // Обработка ошибок
  script.onerror = (err) => {
    console.error('Error loading Facebook Pixel script:', err);
    window[OUR_INIT_FLAG] = false;
  };

  // Добавляем скрипт в DOM
  document.head.appendChild(script);

  // Добавляем noscript элемент
  const noscript = document.createElement('noscript');
  const img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.src = `https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`;
  img.alt = "";
  noscript.appendChild(img);
  document.head.appendChild(noscript);
};

export default function MetaPixel() {
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);

  // Загружаем скрипт при монтировании компонента
  useEffect(() => {
    // Проверяем разрешение на маркетинговые куки
    if (typeof window === 'undefined' || !isMarketingAllowed()) {
      return;
    }

    // Загружаем скрипт только один раз
    if (!initialized && !window[OUR_INIT_FLAG]) {
      loadPixelScript();
      setInitialized(true);
    }
  }, [initialized]);

  // Отслеживание изменения страницы
  useEffect(() => {
    if (
      pathname && 
      typeof window !== 'undefined' && 
      window.fbq && 
      isMarketingAllowed() && 
      window._fbPixelInit
    ) {
      // Отправляем событие PageView только если скрипт инициализирован
      window.fbq('track', 'PageView');
      console.log('PageView tracked for path:', pathname);
    }
  }, [pathname]);

  // Компонент ничего не рендерит
  return null;
}
