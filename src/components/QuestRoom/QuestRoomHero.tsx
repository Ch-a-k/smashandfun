"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';
import { Hammer, ArrowDown } from 'lucide-react';
import { withQuestRoomUtm } from '@/lib/questRoomUtm';

const BOOKING_URL = withQuestRoomUtm('/rezerwacja');

export function QuestRoomHero() {
  const { t } = useI18n();
  const alternatives =
    (t('questRoom.hero.alternativeKeywords', { returnObjects: true }) as string[]) || [];

  return (
    <section className="relative w-full bg-[#231f20] pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-40" />
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-[#f36e21]/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#f36e21]/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#f36e21_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f36e21]/15 text-[#f36e21] text-sm font-impact tracking-wider uppercase border border-[#f36e21]/30">
            <Hammer className="w-4 h-4" />
            {t('questRoom.hero.eyebrow')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-4xl md:text-6xl lg:text-7xl font-impact tracking-tight text-white text-center leading-[1.05]"
        >
          <span className="block">
            {t('questRoom.hero.titlePre')}{' '}
            <span className="text-[#f36e21]">{t('questRoom.hero.mainKeyword')}</span>
          </span>
          <span className="block mt-1">{t('questRoom.hero.titlePost')}</span>
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-impact text-center mt-6 tracking-wide"
        >
          {alternatives.length > 0 && (
            <span className="block text-white/65 text-sm md:text-base lg:text-lg tracking-widest uppercase">
              {alternatives.join(' • ')}
            </span>
          )}
          <span className="block text-[#f36e21] text-2xl md:text-3xl lg:text-4xl mt-3 uppercase">
            {t('questRoom.hero.titleAccent')}
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-lg md:text-xl text-white/75 text-center max-w-3xl mx-auto mt-8 leading-relaxed"
        >
          {t('questRoom.hero.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <Link
            href={BOOKING_URL}
            className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[#f36e21] text-white font-impact tracking-wide uppercase rounded-lg text-lg shadow-[0_10px_30px_-10px_rgba(243,110,33,0.6)] hover:bg-[#ff7b2e] hover:scale-[1.02] active:scale-[0.99] transition-all"
          >
            {t('questRoom.hero.primaryCta')}
          </Link>
          <a
            href="#comparison"
            className="inline-flex items-center justify-center gap-2 px-9 py-4 border border-white/20 text-white font-impact tracking-wide uppercase rounded-lg text-lg hover:border-[#f36e21] hover:text-[#f36e21] transition-colors"
          >
            {t('questRoom.hero.secondaryCta')}
            <ArrowDown className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
