"use client";

import { useEffect, useMemo, useState } from 'react';
import { X, Copy, Sparkles, Snowflake, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';

interface HappyHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HappyHoursModal({ isOpen, onClose }: HappyHoursModalProps) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [copied, setCopied] = useState(false);
  const [snow, setSnow] = useState<
    Array<{
      id: number;
      left: number;
      size: number;
      duration: number;
      delay: number;
      opacity: number;
      blur: number;
      sway: number;
    }>
  >([]);

  const promoCode = useMemo(() => 'GWIAZDKA', []);

  // Загружаем компонент только на клиенте
  useEffect(() => {
    setMounted(true);
  }, []);

  // Генерируем снежинки только на клиенте (без SSR/гидрационных сюрпризов)
  useEffect(() => {
    if (!mounted) return;
    const count = 26;
    const next = Array.from({ length: count }, (_, id) => {
      const size = 6 + Math.random() * 10; // px
      const duration = 6 + Math.random() * 7; // s
      return {
        id,
        left: Math.random() * 100, // %
        size,
        duration,
        delay: -Math.random() * duration, // negative for "already falling"
        opacity: 0.25 + Math.random() * 0.55,
        blur: Math.random() * 1.8,
        sway: 10 + Math.random() * 28, // px
      };
    });
    setSnow(next);
  }, [mounted]);

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

  // Следим за изменениями состояния открытия модального окна
  useEffect(() => {
    // пустой useEffect для отслеживания изменений
  }, [isOpen]);

  const handleBooking = () => {
    try {
      window.open('/rezerwacja', '_blank');
      onClose();
    } catch (error) {
      console.error('Error opening booking page:', error);
    }
  };

  const handleCopy = async () => {
    try {
      // Clipboard API может быть недоступен/заблокирован — делаем fallback
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(promoCode);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = promoCode;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!ok) throw new Error('execCommand copy failed');
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error('Error copying promo code:', error);
    }
  };

  // Не рендерим на сервере
  if (!mounted) return null;
  
  // Не рендерим, если shouldRender = false
  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm ${isOpen ? 'animate-holidayFadeIn' : 'animate-holidayFadeOut'}`}
        onClick={onClose}
      />

      {/* Modal container */}
      <div
        className="fixed inset-0 z-[1001] overflow-y-auto p-4 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('holidayPromo.aria.title') || 'Holiday promotion'}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-lg relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl ${
            isOpen ? 'animate-holidayModalIn' : 'animate-holidayModalOut'
          } bg-gradient-to-br from-[#151314] via-[#1a1718] to-[#0b1220]`}
        >
          {/* Snow layer */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {snow.map((s) => (
              <span
                key={s.id}
                className="snowflake"
                style={{
                  left: `${s.left}%`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  opacity: s.opacity,
                  filter: `blur(${s.blur}px)`,
                  animationDuration: `${s.duration}s, ${Math.max(4, s.duration * 0.65)}s`,
                  animationDelay: `${s.delay}s, ${s.delay * 0.6}s`,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ['--sway' as any]: `${s.sway}px`,
                }}
              />
            ))}
          </div>

          {/* Accent line (brand orange) */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#f36e21]/40 to-transparent" />

          {/* Decorative glow */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#f36e21]/10 blur-3xl" />
          <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(243,110,33,0.12),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(56,189,248,0.10),transparent_50%),radial-gradient(circle_at_40%_90%,rgba(255,255,255,0.06),transparent_45%)]" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 z-10 transition-colors"
            aria-label={t('common.close') || 'Close'}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative p-6 sm:p-7">
            {/* Copy toast */}
            <div
              className={`pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 z-20 transition-all duration-200 ${
                copied ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
              aria-hidden={!copied}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-black/55 backdrop-blur border border-white/10 px-3 py-2 text-sm font-semibold text-white shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Skopiowano</span>
              </div>
            </div>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="relative">
                  <Snowflake className="w-7 h-7 text-sky-200 animate-iceFloat" />
                  <Sparkles className="w-4 h-4 text-[#f36e21]/90 absolute -bottom-1 -right-1 animate-sparkle" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-medium text-white/80">
                    {t('holidayPromo.badge') || 'Limited time'}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#f36e21]/15 border border-[#f36e21]/25 px-2.5 py-1 text-xs font-semibold text-[#ffd9c4]">
                    {t('holidayPromo.discountBadge') || '−50 zł'}
                  </span>
                </div>

                <h2 className="mt-3 text-2xl sm:text-3xl font-impact uppercase tracking-wide text-white">
                  {t('holidayPromo.title') || 'Holiday special'}
                </h2>
                <p className="mt-1 text-white/70 text-sm sm:text-base">
                  {t('holidayPromo.subtitle') || 'Use promo code to get 50 zł off your booking.'}
                </p>
              </div>
            </div>

            {/* Code box */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 relative overflow-hidden">
              {/* Декор-слой НЕ должен перехватывать клики */}
              <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_10%_10%,rgba(243,110,33,0.10),transparent_40%),radial-gradient(circle_at_90%_60%,rgba(56,189,248,0.08),transparent_45%)]" />
              <div className="relative z-[1] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white/60">
                    {t('holidayPromo.codeLabel') || 'Promo code'}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-lg sm:text-xl tracking-widest text-white">
                      {promoCode}
                    </span>
                    <span className="text-xs text-white/50">
                      {t('holidayPromo.codeHint') || 'at checkout'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopy}
                  className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? (t('holidayPromo.copied') || 'Copied') : (t('holidayPromo.copy') || 'Copy')}</span>
                </button>
              </div>
              <p className="mt-3 text-xs text-white/55">
                {t('holidayPromo.terms') || 'Discount applies once per booking. Cannot be combined with other promotions.'}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBooking}
                className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#f36e21] hover:bg-[#ff7b2e] text-white font-impact uppercase tracking-wide py-3 transition-colors shadow-[0_10px_30px_rgba(243,110,33,0.20)]"
              >
                <span>{t('holidayPromo.cta') || 'BOOK NOW'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-semibold py-3 px-4 transition-colors"
              >
                {t('holidayPromo.secondaryCta') || (t('common.close') || 'Close')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .snowflake {
          position: absolute;
          top: -12%;
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.45));
          box-shadow: 0 0 18px rgba(255, 255, 255, 0.12);
          animation-name: snowFall, snowSway;
          animation-timing-function: linear, ease-in-out;
          animation-iteration-count: infinite, infinite;
        }

        @keyframes snowFall {
          from {
            transform: translate3d(0, -10vh, 0);
          }
          to {
            transform: translate3d(0, 115vh, 0);
          }
        }

        @keyframes snowSway {
          0%,
          100% {
            margin-left: calc(var(--sway, 18px) * -0.5);
          }
          50% {
            margin-left: var(--sway, 18px);
          }
        }

        @keyframes holidayFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes holidayFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes holidayModalIn {
          0% {
            opacity: 0;
            transform: translate3d(0, 18px, 0) scale(0.985) rotate(-0.4deg);
          }
          60% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1.01) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
          }
        }
        @keyframes holidayModalOut {
          from {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
          }
          to {
            opacity: 0;
            transform: translate3d(0, 18px, 0) scale(0.985) rotate(0.2deg);
          }
        }

        :global(.animate-holidayFadeIn) {
          animation: holidayFadeIn 260ms ease-out both;
        }
        :global(.animate-holidayFadeOut) {
          animation: holidayFadeOut 220ms ease-in both;
        }
        :global(.animate-holidayModalIn) {
          animation: holidayModalIn 360ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }
        :global(.animate-holidayModalOut) {
          animation: holidayModalOut 260ms ease-in both;
        }

        @keyframes iceFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -2px, 0) rotate(-6deg);
          }
        }
        :global(.animate-iceFloat) {
          animation: iceFloat 2.6s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.85;
          }
          50% {
            transform: translate3d(0, 0, 0) scale(1.12);
            opacity: 1;
          }
        }
        :global(.animate-sparkle) {
          animation: sparkle 1.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .snowflake {
            animation: none !important;
          }
          :global(.animate-holidayFadeIn),
          :global(.animate-holidayFadeOut),
          :global(.animate-holidayModalIn),
          :global(.animate-holidayModalOut),
          :global(.animate-iceFloat),
          :global(.animate-sparkle) {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
} 