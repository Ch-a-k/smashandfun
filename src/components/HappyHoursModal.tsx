"use client";

import { useState, useEffect } from 'react';
import { X, Copy, Check, ArrowRight } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;
    
    try {
      const benefitsData = t('happyHours.benefits', { returnObjects: true });
      if (Array.isArray(benefitsData)) {
        setBenefits(benefitsData);
      }
    } catch {
      setBenefits([]);
    }
  }, [t, mounted]);

  const handleCopy = () => {
    const code = t('happyHours.schedule.time');
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBooking = () => {
    window.open('/rezerwacja', '_blank');
    onClose();
  };

  if (!mounted || !shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/95 backdrop-blur-md z-[1000] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      >
        {/* Диагональные полоски с BLACK FRIDAY */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Верхняя полоса */}
          <div className="absolute top-[15%] -left-20 w-[150%] h-16 bg-black border-y-4 border-white transform -rotate-12 shadow-2xl animate-slide-right">
            <div className="flex items-center h-full whitespace-nowrap animate-scroll-infinite">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="flex items-center mx-4">
                  <span className="text-2xl font-impact text-[#f36e21] mr-2">BLACK</span>
                  <span className="text-2xl font-impact text-white">FRIDAY</span>
                </div>
              ))}
            </div>
          </div>

          {/* Нижняя полоса */}
          <div className="absolute bottom-[15%] -right-20 w-[150%] h-16 bg-black border-y-4 border-white transform rotate-12 shadow-2xl animate-slide-left">
            <div className="flex items-center h-full whitespace-nowrap animate-scroll-infinite-reverse">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="flex items-center mx-4">
                  <span className="text-2xl font-impact text-[#f36e21] mr-2">BLACK</span>
                  <span className="text-2xl font-impact text-white">FRIDAY</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating элементы */}
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-[#f36e21]/5 blur-3xl animate-float-slow"></div>
        <div className="absolute top-[20%] right-[8%] w-40 h-40 rounded-full bg-[#f36e21]/5 blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[15%] left-[10%] w-36 h-36 rounded-full bg-[#f36e21]/5 blur-3xl animate-float-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Container */}
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative pointer-events-auto">

          {/* Modal */}
          <div className={`relative transition-all duration-700 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#f36e21]/20 via-[#ff9f58]/20 to-[#f36e21]/20 blur-3xl animate-pulse-slow rounded-3xl"></div>
            
            {/* Main card */}
            <div className="relative w-full max-w-[900px] bg-black rounded-2xl overflow-hidden border-2 border-[#f36e21] shadow-2xl shadow-[#f36e21]/20">
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-30 text-white/50 hover:text-white transition-all duration-300 hover:rotate-90 hover:scale-110 bg-white/5 hover:bg-white/10 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content - Горизонтальный layout */}
              <div className="relative z-10 flex flex-col md:flex-row items-stretch">
                
                {/* Левая часть - BLACK FRIDAY большой текст */}
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-center items-center bg-gradient-to-br from-[#f36e21]/5 to-transparent border-r border-[#f36e21]/20">
                  
                  {/* BLACK FRIDAY огромный текст */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <h1 className="text-6xl md:text-7xl lg:text-8xl font-impact text-white uppercase tracking-wider leading-none mb-2" 
                        style={{ 
                          textShadow: '0 0 30px rgba(243, 110, 33, 0.5), 0 0 60px rgba(243, 110, 33, 0.3)',
                          letterSpacing: '0.1em'
                        }}>
                        BLACK
                      </h1>
                      <h1 className="text-6xl md:text-7xl lg:text-8xl font-impact text-[#f36e21] uppercase tracking-wider leading-none" 
                        style={{ 
                          textShadow: '0 0 30px rgba(243, 110, 33, 0.8), 0 0 60px rgba(243, 110, 33, 0.4)',
                          letterSpacing: '0.1em'
                        }}>
                        FRIDAY
                      </h1>
                      
                      {/* Линии по бокам */}
                      <div className="absolute -left-16 top-1/2 w-12 h-px bg-gradient-to-r from-transparent to-[#f36e21]"></div>
                      <div className="absolute -right-16 top-1/2 w-12 h-px bg-gradient-to-l from-transparent to-[#f36e21]"></div>
                    </div>
                    
                    <p className="text-white/60 text-sm md:text-base mt-4 uppercase tracking-widest">
                      {t('happyHours.subtitle')}
                    </p>
                  </div>

                  {/* Огромная скидка */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#f36e21] blur-2xl opacity-30"></div>
                    <div className="relative bg-gradient-to-br from-[#f36e21] to-[#ff7b2e] rounded-xl p-6 border-2 border-[#ff9f58]">
                      <div className="text-center">
                        <p className="text-white/80 text-xs uppercase tracking-widest mb-1">Zniżka</p>
                        <p className="text-white font-impact text-6xl md:text-7xl tracking-wider" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
                          -50 ZŁ
                        </p>
                        <p className="text-white/90 text-xs uppercase tracking-widest mt-1">Na wszystkie pakiety</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Правая часть - промокод и кнопка */}
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-between bg-gradient-to-bl from-[#f36e21]/5 to-transparent">
                  
                  {/* Промокод */}
                  <div className="space-y-6 mb-8">
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-widest mb-3 text-center">
                        {t('happyHours.schedule.weekdays')}
                      </p>
                      
                      <div 
                        className="bg-black border-2 border-[#f36e21] rounded-xl p-5 cursor-pointer hover:border-[#ff9f58] hover:shadow-lg hover:shadow-[#f36e21]/30 transition-all duration-300 group"
                        onClick={handleCopy}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-white font-impact text-4xl md:text-5xl tracking-[0.3em]" style={{ textShadow: '0 0 20px rgba(243, 110, 33, 0.5)' }}>
                            {t('happyHours.schedule.time')}
                          </span>
                          {copied ? (
                            <Check className="w-6 h-6 text-[#f36e21] animate-scale-check" />
                          ) : (
                            <Copy className="w-6 h-6 text-white/60 group-hover:text-[#f36e21] transition-colors" />
                          )}
                        </div>
                        <p className="text-white/40 text-[10px] mt-3 text-center uppercase tracking-widest">
                          {copied ? '✓ Skopiowano' : 'Kliknij, aby skopiować'}
                        </p>
                      </div>
                    </div>

                    {/* Преимущества */}
                    <div className="space-y-3">
                      {benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 text-white/80 text-sm opacity-0 animate-slide-in"
                          style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
                        >
                          <div className="w-1 h-1 rounded-full bg-[#f36e21]"></div>
                          <span className="leading-snug">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={handleBooking}
                    className="w-full relative group overflow-hidden bg-gradient-to-r from-[#f36e21] to-[#ff7b2e] hover:from-[#ff7b2e] hover:to-[#f36e21] text-white font-impact uppercase py-4 rounded-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#f36e21]/50 border-2 border-[#ff9f58]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative text-lg md:text-xl tracking-wider flex items-center justify-center gap-3">
                      <span>{t('happyHours.cta')}</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scale-check {
          0% { transform: scale(0) rotate(-180deg); }
          50% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes scroll-infinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-infinite-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes slide-right {
          0%, 100% { transform: translateX(0) rotate(-12deg); }
          50% { transform: translateX(30px) rotate(-12deg); }
        }
        @keyframes slide-left {
          0%, 100% { transform: translateX(0) rotate(12deg); }
          50% { transform: translateX(-30px) rotate(12deg); }
        }
        
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-slide-in { animation: slide-in 0.6s ease-out; }
        .animate-scale-check { animation: scale-check 0.4s ease-out; }
        .animate-scroll-infinite { animation: scroll-infinite 20s linear infinite; }
        .animate-scroll-infinite-reverse { animation: scroll-infinite-reverse 20s linear infinite; }
        .animate-slide-right { animation: slide-right 8s ease-in-out infinite; }
        .animate-slide-left { animation: slide-left 8s ease-in-out infinite; }
      `}</style>
    </>
  );
}
