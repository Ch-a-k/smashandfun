"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nContext';

type CookieSettings = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const defaultSettings: CookieSettings = {
  necessary: true, // Always true and cannot be changed
  analytics: false,
  marketing: false,
};

// Безопасно получает значение из localStorage
const safeGetFromStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return null;
  }
};

// Безопасно устанавливает значение в localStorage
const safeSetToStorage = (key: string, value: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
    return false;
  }
};

export default function CookieConsent() {
  const { t } = useI18n();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>(defaultSettings);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    try {
      // Check if user has already made a choice
      const consent = safeGetFromStorage('cookieConsent');
      if (!consent) {
        setShowBanner(true);
        return;
      }

      // Проверяем, что значение является валидным JSON
      const parsedConsent = JSON.parse(consent);
      
      // Проверяем, что все необходимые поля присутствуют
      if (typeof parsedConsent === 'object' && 
          'necessary' in parsedConsent && 
          'analytics' in parsedConsent && 
          'marketing' in parsedConsent) {
        setSettings(parsedConsent);
      } else {
        // Если структура неверная, сбрасываем к настройкам по умолчанию
        safeSetToStorage('cookieConsent', JSON.stringify(defaultSettings));
        setShowBanner(true);
      }
    } catch (error) {
      // Если возникла ошибка при парсинге JSON, сбрасываем к настройкам по умолчанию
      console.error('Error parsing cookie consent:', error);
      safeSetToStorage('cookieConsent', JSON.stringify(defaultSettings));
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    try {
      // Получаем текущие настройки из localStorage
      const currentConsent = safeGetFromStorage('cookieConsent');
      const currentSettings = currentConsent ? JSON.parse(currentConsent) : defaultSettings;
      
      // Сохраняем новые настройки
      safeSetToStorage('cookieConsent', JSON.stringify(allAccepted));
      setSettings(allAccepted);
      setShowBanner(false);
      
      // Если настройки аналитики или маркетинга изменились, перезагружаем страницу
      if (currentSettings?.analytics !== allAccepted.analytics || 
          currentSettings?.marketing !== allAccepted.marketing) {
        // Задержка перед перезагрузкой, чтобы модальное окно успело закрыться
        setTimeout(() => {
          console.log('Reloading page after accepting all cookies');
          window.location.reload();
        }, 300);
      }
    } catch (error) {
      console.error('Error saving cookie consent:', error);
    }
  };

  const handleSaveSettings = () => {
    try {
      // Получаем текущие настройки из localStorage
      const currentConsent = safeGetFromStorage('cookieConsent');
      const currentSettings = currentConsent ? JSON.parse(currentConsent) : defaultSettings;
      
      // Сохраняем новые настройки
      safeSetToStorage('cookieConsent', JSON.stringify(settings));
      setShowBanner(false);
      setShowSettings(false);
      
      // Если настройки аналитики или маркетинга изменились, перезагружаем страницу
      if (currentSettings?.analytics !== settings.analytics || 
          currentSettings?.marketing !== settings.marketing) {
        // Задержка перед перезагрузкой, чтобы модальное окно успело закрыться
        setTimeout(() => {
          console.log('Reloading page after saving cookie settings');
          window.location.reload();
        }, 300);
      }
    } catch (error) {
      console.error('Error saving cookie settings:', error);
    }
  };

  const handleRejectAll = () => {
    try {
      // Получаем текущие настройки из localStorage
      const currentConsent = safeGetFromStorage('cookieConsent');
      const currentSettings = currentConsent ? JSON.parse(currentConsent) : settings;
      
      // Сохраняем настройки по умолчанию
      safeSetToStorage('cookieConsent', JSON.stringify(defaultSettings));
      setSettings(defaultSettings);
      setShowBanner(false);
      
      // Если настройки аналитики или маркетинга изменились, перезагружаем страницу
      if (currentSettings?.analytics !== defaultSettings.analytics || 
          currentSettings?.marketing !== defaultSettings.marketing) {
        // Задержка перед перезагрузкой, чтобы модальное окно успело закрыться
        setTimeout(() => {
          console.log('Reloading page after rejecting all cookies');
          window.location.reload();
        }, 300);
      }
    } catch (error) {
      console.error('Error rejecting cookies:', error);
    }
  };

  // Если компонент не смонтирован (серверный рендеринг), ничего не показываем
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-[#1a1718] border-t border-white/10 p-4 z-50"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-white/70 text-sm flex-1">
                  <p>
                    {t('cookies.banner.text')}{' '}
                    <Link href="/polityka-prywatnosci" className="text-[#f36e21] hover:underline">
                      {t('privacyPolicy.title')}
                    </Link>.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-4 py-2 text-white border border-white/20 rounded hover:bg-white/5 transition-colors"
                  >
                    {t('cookies.banner.settings')}
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2 text-white border border-white/20 rounded hover:bg-white/5 transition-colors"
                  >
                    {t('cookies.banner.rejectAll')}
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 bg-[#f36e21] text-white rounded hover:bg-[#ff7b2e] transition-colors"
                  >
                    {t('cookies.banner.acceptAll')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1718] rounded-2xl p-6 max-w-2xl w-full relative"
            >
              <h2 className="text-2xl font-bold text-white mb-6">{t('cookies.modal.title')}</h2>
              
              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">{t('cookies.modal.necessary.title')}</h3>
                    <p className="text-white/70 text-sm mt-1">
                      {t('cookies.modal.necessary.description')}
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.necessary}
                      disabled
                      className="appearance-none w-12 h-6 bg-white/20 rounded-full checked:bg-[#f36e21] transition-colors cursor-not-allowed"
                    />
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform transform translate-x-6" />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">{t('cookies.modal.analytics.title')}</h3>
                    <p className="text-white/70 text-sm mt-1">
                      {t('cookies.modal.analytics.description')}
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.analytics}
                      onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })}
                      className="appearance-none w-12 h-6 bg-white/20 rounded-full checked:bg-[#f36e21] transition-colors cursor-pointer"
                    />
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform transform ${settings.analytics ? 'translate-x-6' : ''}`} />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">{t('cookies.modal.marketing.title')}</h3>
                    <p className="text-white/70 text-sm mt-1">
                      {t('cookies.modal.marketing.description')}
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.marketing}
                      onChange={(e) => setSettings({ ...settings, marketing: e.target.checked })}
                      className="appearance-none w-12 h-6 bg-white/20 rounded-full checked:bg-[#f36e21] transition-colors cursor-pointer"
                    />
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform transform ${settings.marketing ? 'translate-x-6' : ''}`} />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-white border border-white/20 rounded hover:bg-white/5 transition-colors"
                >
                  {t('cookies.modal.cancel')}
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-[#f36e21] text-white rounded hover:bg-[#ff7b2e] transition-colors"
                >
                  {t('cookies.modal.save')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
