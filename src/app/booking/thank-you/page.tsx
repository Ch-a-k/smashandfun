"use client";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nContext';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const THANK_YOU_FLYING_IMAGES = [
  '/images/glass-shard-1.png',
  '/images/glass-shard-2.png',
  '/images/glass-shard-3.png',
  '/images/glass-shard-4.png',
  '/images/glass-shard-5.png',
  '/images/glass-shard-6.png',
] as const;

const THANK_YOU_TEXTS = {
  pl: {
    title: 'Dziękujemy za rezerwację!',
    subtitle: 'Twoja rezerwacja została przyjęta. Potwierdzenie wysłaliśmy na Twój e-mail.',
    homeBtn: 'Powrót na stronę główną',
  },
  en: {
    title: 'Thank you for your booking!',
    subtitle: 'Your booking has been received. We have sent a confirmation to your email.',
    homeBtn: 'Back to homepage',
  }
};

type FlyingObjectProps = {
  img: string;
  size: number;
  top: number;
  left: number;
  opacity: number;
  duration: number;
  direction: number;
  idx: number;
  scale1: number;
  scale2: number;
  scale3: number;
  rot1: number;
  rot2: number;
  rot3: number;
};

// Компонент летающих осколков
function FlyingObjects() {
  const [objects, setObjects] = useState<FlyingObjectProps[]>([]);
  useEffect(() => {
    const arr = Array.from({ length: 22 }).map((_, i) => {
      const img = THANK_YOU_FLYING_IMAGES[i % THANK_YOU_FLYING_IMAGES.length];
      const size = 38 + Math.round(Math.random() * 90);
      const top = Math.round(Math.random() * 80);
      const left = Math.round(Math.random() * 95);
      const opacity = 0.32 + Math.random() * 0.45;
      const duration = 12 + Math.random() * 18;
      const direction = Math.random() > 0.5 ? 1 : -1;
      const scale1 = 0.9 + Math.random() * 0.3;
      const scale2 = 0.8 + Math.random() * 0.4;
      const scale3 = 0.7 + Math.random() * 0.5;
      const rot1 = direction * (10 + Math.round(Math.random() * 30));
      const rot2 = direction * (30 + Math.round(Math.random() * 60));
      const rot3 = direction * (60 + Math.round(Math.random() * 120));
      return { img, size, top, left, opacity, duration, direction, idx: i, scale1, scale2, scale3, rot1, rot2, rot3 };
    });
    setObjects(arr);
  }, []);
  if (objects.length === 0) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {objects.map(({ img, size, top, left, opacity, duration, idx }) => (
        <Image
          key={idx}
          src={img}
          alt="glass shard"
          width={size}
          height={size}
          style={{
            position: 'absolute',
            top: `${top}%`,
            left: `${left}%`,
            opacity,
            filter: 'drop-shadow(0 4px 16px #0008)',
            animation: `flyShard${idx} ${duration}s linear infinite`,
            zIndex: 1,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      ))}
      <style>{`
        ${objects.map(({ idx, direction, scale1, scale2, scale3, rot1, rot2, rot3 }) =>
          `@keyframes flyShard${idx} {
            0% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); }
            30% { transform: translateY(-12vh) translateX(${direction * 10}vw) scale(${scale1}) rotate(${rot1}deg); }
            60% { transform: translateY(-28vh) translateX(${direction * 22}vw) scale(${scale2}) rotate(${rot2}deg); }
            100% { transform: translateY(-60vh) translateX(${direction * 32}vw) scale(${scale3}) rotate(${rot3}deg); }
          }`
        ).join('\n')}
      `}</style>
    </div>
  );
}

export default function ThankYouPage() {
  const { t, locale } = useI18n();
  const lang = (locale === 'en' ? 'en' : 'pl');
  const texts = THANK_YOU_TEXTS[lang];

  return (
    <div className="min-h-screen flex flex-col thankyou-bg-modern" style={{position: 'relative', background: '#18171c'}}>
      <style>{`
        .thankyou-bg-modern::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: linear-gradient(120deg, #18171c 60%, #23222a 100%), url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png') repeat;
          opacity: 0.22;
          filter: brightness(2.2) grayscale(1);
        }
        .thankyou-anim {
          animation: thankyou-fadein 0.8s cubic-bezier(.4,1.4,.6,1) 0.1s both;
        }
        @keyframes thankyou-fadein {
          0% { opacity: 0; transform: translateY(40px) scale(0.98); }
          100% { opacity: 1; transform: none; }
        }
        .thankyou-illustration {
          width: 72px; height: 72px; margin: 0 auto 18px auto; display: flex; align-items: center; justify-content: center;
        }
        @media (max-width: 600px) {
          .thankyou-illustration { width: 54px; height: 54px; }
        }
      `}</style>
      <Header />
      <FlyingObjects />
      <main
        className="flex-1 flex items-center justify-center px-2"
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: 'calc(100vh - 120px)', // 120px — примерная высота header+footer
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
        <div className="thankyou-anim" style={{
          background: 'rgba(35,34,42,0.98)',
          borderRadius: 28,
          boxShadow: '0 8px 48px 0 #0007',
          padding: '44px 48px 38px 48px',
          maxWidth: 800,
          minWidth: 340,
          width: '100%',
          textAlign: 'center',
          border: '2.5px solid #f36e21',
          position: 'relative',
        }}>
          <div className="thankyou-illustration">
            {/* SVG: галочка в круге */}
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none"><circle cx="36" cy="36" r="34" fill="#23222a" stroke="#f36e21" strokeWidth="4"/><path d="M24 38.5L33.5 48L50 28" stroke="#f36e21" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 style={{fontSize: '2.1rem', fontWeight: 100, color: '#f36e21', marginBottom: 12, letterSpacing: 1}}>
            {t('thankYou.title') !== 'thankYou.title' ? t('thankYou.title') : texts.title}
          </h1>
          <p style={{fontSize: '1.15rem', color: '#fff', opacity: 0.93, marginBottom: 28, fontWeight: 500}}>
            {t('thankYou.subtitle') !== 'thankYou.subtitle' ? t('thankYou.subtitle') : texts.subtitle}
          </p>
          <Link href="/" className="inline-block bg-[#f36e21] hover:bg-[#ff9f58] text-white font-extrabold py-3 px-8 rounded-xl text-lg transition-all shadow-lg" style={{fontSize: '1.13rem', boxShadow: '0 2px 16px #f36e2180'}}>
            {t('thankYou.homeBtn') !== 'thankYou.homeBtn' ? t('thankYou.homeBtn') : texts.homeBtn}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
} 