"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useI18n } from '@/i18n/I18nContext';

const decorativeImages = [
  { src: '/images/turn-left.png', className: 'top-[5%] left-[15%] w-20 h-20' },
  { src: '/images/6o.png', className: 'top-[40%] left-[8%] w-16 h-16' },
  { src: '/images/1.png', className: 'top-[65%] right-[20%] w-24 h-24' },
  { src: '/images/down.png', className: 'top-[75%] left-[50%] w-20 h-20 -translate-x-1/2' },
  { src: '/images/turn-right.png', className: 'top-[25%] right-[12%] w-12 h-12' }
];

export function BlogHeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative w-full bg-[#231f20] py-32">
      {/* Decorative line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30" />
      
      {/* Decorative background images */}
      {decorativeImages.map((image, index) => (
        <div key={index} className={`absolute opacity-90 pointer-events-none ${image.className}`}>
          <Image
            src={image.src}
            alt=""
            fill
            className="object-contain"
          />
        </div>
      ))}
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero content */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold text-white text-center mb-8 relative z-10"
        >
          {t('blog.hero.title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl text-white/70 text-center max-w-3xl mx-auto mb-8"
        >
          {t('blog.hero.subtitle')}
        </motion.p>
      </div>
    </section>
  );
} 