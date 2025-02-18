"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>(defaultSettings);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    } else {
      setSettings(JSON.parse(consent));
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setSettings(allAccepted);
    setShowBanner(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(settings));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(defaultSettings));
    setSettings(defaultSettings);
    setShowBanner(false);
  };

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
                    Używamy plików cookie, aby zapewnić najlepszą jakość korzystania z naszej strony. 
                    Możesz zaakceptować wszystkie pliki cookie lub dostosować swoje preferencje w ustawieniach.
                    Więcej informacji znajdziesz w naszej{' '}
                    <Link href="/polityka-prywatnosci" className="text-[#f36e21] hover:underline">
                      Polityce Prywatności
                    </Link>.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-4 py-2 text-white border border-white/20 rounded hover:bg-white/5 transition-colors"
                  >
                    Ustawienia
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2 text-white border border-white/20 rounded hover:bg-white/5 transition-colors"
                  >
                    Odrzuć wszystkie
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 bg-[#f36e21] text-white rounded hover:bg-[#ff7b2e] transition-colors"
                  >
                    Akceptuj wszystkie
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
              <h2 className="text-2xl font-bold text-white mb-6">Ustawienia plików cookie</h2>
              
              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Niezbędne</h3>
                    <p className="text-white/70 text-sm mt-1">
                      Te pliki cookie są wymagane do działania strony i nie mogą być wyłączone.
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
                    <h3 className="text-white font-medium">Analityczne</h3>
                    <p className="text-white/70 text-sm mt-1">
                      Pomagają nam zrozumieć, jak użytkownicy korzystają z naszej strony.
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
                    <h3 className="text-white font-medium">Marketingowe</h3>
                    <p className="text-white/70 text-sm mt-1">
                      Używane do wyświetlania spersonalizowanych reklam i treści.
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
                  Anuluj
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-[#f36e21] text-white rounded hover:bg-[#ff7b2e] transition-colors"
                >
                  Zapisz ustawienia
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
