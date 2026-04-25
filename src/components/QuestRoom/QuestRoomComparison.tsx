"use client";

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';
import { Lock, Hammer, Check, X, Trophy } from 'lucide-react';

export function QuestRoomComparison() {
  const { t } = useI18n();
  const questPoints =
    (t('questRoom.comparison.questRoom.points', { returnObjects: true }) as string[]) || [];
  const ragePoints =
    (t('questRoom.comparison.rageRoom.points', { returnObjects: true }) as string[]) || [];

  return (
    <section id="comparison" className="relative w-full bg-[#231f20] py-24">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[#f36e21] font-impact tracking-widest uppercase text-sm mb-3">
            {t('questRoom.comparison.eyebrow')}
          </p>
          <h2 className="text-3xl md:text-5xl font-impact text-white leading-tight mb-4">
            {t('questRoom.comparison.title')}
          </h2>
          <p className="text-white/65 text-lg max-w-2xl mx-auto">
            {t('questRoom.comparison.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">
          {/* Quest Room — cons, muted */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-white/[0.04] border border-white/10 rounded-3xl p-7 md:p-9 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-white/5 text-white/55 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-white/45 font-impact tracking-widest uppercase text-xs">
                {t('questRoom.comparison.tabs.questRoom')}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-impact text-white/85 tracking-tight mb-3">
              {t('questRoom.comparison.questRoom.title')}
            </h3>
            <p className="text-white/55 leading-relaxed mb-6">
              {t('questRoom.comparison.questRoom.intro')}
            </p>
            <ul className="space-y-2.5 flex-1">
              {questPoints.map((p, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.04 * i, duration: 0.25 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-white/5 text-white/55 flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </span>
                  <span className="text-white/65 leading-relaxed">{p}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Rage Room — pros, highlighted winner */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative bg-gradient-to-br from-[#f36e21]/15 to-[#f36e21]/0 border-2 border-[#f36e21] rounded-3xl p-7 md:p-9 flex flex-col shadow-[0_30px_80px_-30px_rgba(243,110,33,0.55)]"
          >
            <div className="absolute -top-3 right-6 bg-[#f36e21] text-white px-3 py-1 rounded-full text-[11px] font-impact tracking-widest flex items-center gap-1.5 shadow-[0_8px_24px_-8px_rgba(243,110,33,0.8)]">
              <Trophy className="w-3 h-3" />
              {t('questRoom.comparison.winnerBadge')}
            </div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[#f36e21]/20 text-[#f36e21] flex items-center justify-center">
                <Hammer className="w-6 h-6" />
              </div>
              <span className="text-[#f36e21] font-impact tracking-widest uppercase text-xs">
                {t('questRoom.comparison.tabs.rageRoom')}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-impact text-white tracking-tight mb-3">
              {t('questRoom.comparison.rageRoom.title')}
            </h3>
            <p className="text-white/85 leading-relaxed mb-6">
              {t('questRoom.comparison.rageRoom.intro')}
            </p>
            <ul className="space-y-2.5 flex-1">
              {ragePoints.map((p, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.04 * i, duration: 0.25 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-[#f36e21]/25 text-[#f36e21] flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </span>
                  <span className="text-white/95 leading-relaxed">{p}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-white/85 text-base md:text-lg italic mt-12 max-w-2xl mx-auto"
        >
          „{t('questRoom.comparison.verdict')}"
        </motion.p>
      </div>
    </section>
  );
}
