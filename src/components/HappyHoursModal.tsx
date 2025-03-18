"use client";

import { useState, useEffect } from 'react';
import { X, Clock, Gift, ArrowRight, Calendar } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';

interface HappyHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HappyHoursModal({ isOpen, onClose }: HappyHoursModalProps) {
  const { t } = useI18n();
  const [benefits, setBenefits] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Загружаем компонент только на клиенте
  useEffect(() => {
    setMounted(true);
  }, []);

  // Устанавливаем задержку для анимации при закрытии
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      // Если модальное окно закрывается, ждем окончания анимации перед удалением из DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Задержка должна соответствовать длительности анимации
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Загружаем данные о преимуществах
  useEffect(() => {
    if (!mounted) return;
    
    try {
      const benefitsData = t('happyHours.benefits', { returnObjects: true });
      
      if (Array.isArray(benefitsData)) {
        setBenefits(benefitsData);
      } else {
        console.error('happyHours.benefits is not an array:', benefitsData);
        setBenefits(['Lower prices', 'Less crowded', 'Same great experience', 'Full equipment included']);
      }
    } catch (error) {
      console.error('Error loading benefits:', error);
      setBenefits(['Lower prices', 'Less crowded', 'Same great experience', 'Full equipment included']);
    }
  }, [t, mounted]);

  // Следим за изменениями состояния открытия модального окна
  useEffect(() => {
    // пустой useEffect для отслеживания изменений
  }, [isOpen]);

  const handleBooking = () => {
    try {
      window.open('https://smashandfun.simplybook.it/v2/#book/count/1/', '_blank');
      onClose();
    } catch (error) {
      console.error('Error opening booking page:', error);
    }
  };

  // Не рендерим на сервере
  if (!mounted) return null;
  
  // Не рендерим, если shouldRender = false
  if (!shouldRender) return null;

  return (
    <>
      {/* Фон модального окна */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Контейнер модального окна */}
      <div className="fixed inset-0 z-[1001] overflow-y-auto p-4 flex items-center justify-center">
        {/* Содержимое модального окна */}
        <div
          className={`w-full max-w-md bg-[#1a1718] rounded-xl shadow-lg border border-[#f36e21]/20 relative overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Декоративная линия */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#f36e21]/30 to-transparent" />

          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/60 hover:text-white bg-black/20 rounded-full p-1.5 z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Содержимое */}
          <div className="p-5">
            {/* Заголовок */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-impact text-[#f36e21] uppercase">
                {t('happyHours.title') || 'HAPPY HOURS'}
              </h2>
              <p className="text-white/70 text-sm">
                {t('happyHours.subtitle') || 'Special offer for early birds!'}
              </p>
            </div>

            {/* Расписание и преимущества */}
            <div className="bg-black/20 rounded-lg p-4 mb-4">
              {/* Расписание */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                <Calendar className="text-[#f36e21] w-4 h-4 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">{t('happyHours.schedule.weekdays') || 'Monday - Friday'}</span>
                    <span className="text-white text-sm font-medium">{t('happyHours.schedule.time') || '12:00 - 16:00'}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-white/80 text-sm">{t('happyHours.schedule.discountname') || 'Discount'}</span>
                    <span className="text-[#f36e21] font-impact text-lg">{t('happyHours.schedule.discount') || '-20%'}</span>
                  </div>
                </div>
              </div>

              {/* Преимущества */}
              <div className="flex items-start gap-2">
                <Gift className="text-[#f36e21] w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 flex-1">
                  {benefits.length > 0 ? (
                    benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-[#f36e21]" />
                        <span className="text-white/80 text-xs">{benefit}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-1 col-span-2">
                      <span className="text-white/80 text-xs">Special offer with discount</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Кнопка CTA */}
            <button
              onClick={handleBooking}
              className="w-full bg-[#f36e21] text-white font-impact uppercase py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#ff7b2e] transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>{t('happyHours.cta') || 'BOOK HAPPY HOURS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 