"use client";

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';
import { Star, ShieldCheck, MapPin, CalendarClock, FileCheck2, Users } from 'lucide-react';

const ITEMS = [
  { key: 'rating', icon: <Star className="w-6 h-6" /> },
  { key: 'safety', icon: <ShieldCheck className="w-6 h-6" /> },
  { key: 'location', icon: <MapPin className="w-6 h-6" /> },
  { key: 'instant', icon: <CalendarClock className="w-6 h-6" /> },
  { key: 'company', icon: <FileCheck2 className="w-6 h-6" /> },
  { key: 'groups', icon: <Users className="w-6 h-6" /> },
] as const;

export function QuestRoomTrust() {
  const { t } = useI18n();

  return (
    <section className="relative w-full bg-[#231f20] py-24">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <p className="text-[#f36e21] font-impact tracking-widest uppercase text-sm mb-3">
            {t('questRoom.trust.eyebrow')}
          </p>
          <h2 className="text-3xl md:text-5xl font-impact text-white leading-tight">
            {t('questRoom.trust.title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 hover:border-[#f36e21]/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#f36e21]/15 text-[#f36e21] flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-impact text-white tracking-wide mb-2">
                {t(`questRoom.trust.items.${item.key}.title`)}
              </h3>
              <p className="text-white/70 leading-relaxed">
                {t(`questRoom.trust.items.${item.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
