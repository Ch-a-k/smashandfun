"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';
import { withQuestRoomUtm } from '@/lib/questRoomUtm';

const BOOKING_URL = withQuestRoomUtm('/rezerwacja');

export function QuestRoomCTA() {
  const { t } = useI18n();

  return (
    <section className="relative w-full bg-[#f36e21] py-24">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#231f20] rounded-2xl p-10 md:p-14 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <h2 className="relative text-3xl md:text-5xl font-impact text-white tracking-tight leading-tight mb-5">
            {t('questRoom.cta.title')}
          </h2>
          <p className="relative text-white/75 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            {t('questRoom.cta.description')}
          </p>
          <Link
            href={BOOKING_URL}
            className="relative inline-flex items-center justify-center px-10 py-4 bg-[#f36e21] text-white font-impact tracking-wide uppercase rounded-lg text-lg shadow-lg shadow-[#f36e21]/30 hover:bg-[#ff7b2e] hover:scale-[1.02] transition-all"
          >
            {t('questRoom.cta.button')}
          </Link>
          <p className="relative text-white/55 text-sm mt-6">
            {t('questRoom.cta.phoneHint')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
