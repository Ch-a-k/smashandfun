"use client";

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';
import { Zap, ShieldCheck, Users, Brain, Video } from 'lucide-react';

type Reason = { icon: string; title: string; description: string };

const ICONS: Record<string, React.ReactNode> = {
  zap: <Zap className="w-6 h-6" />,
  shield: <ShieldCheck className="w-6 h-6" />,
  users: <Users className="w-6 h-6" />,
  brain: <Brain className="w-6 h-6" />,
  video: <Video className="w-6 h-6" />,
};

export function QuestRoomReasons() {
  const { t } = useI18n();
  const items = (t('questRoom.reasons.items', { returnObjects: true }) as Reason[]) || [];

  return (
    <section className="relative w-full bg-[#1a1718] py-24">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <p className="text-[#f36e21] font-impact tracking-widest uppercase text-sm mb-3">
            {t('questRoom.reasons.eyebrow')}
          </p>
          <h2 className="text-3xl md:text-5xl font-impact text-white leading-tight">
            {t('questRoom.reasons.title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((it, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="group relative bg-white/[0.04] border border-white/10 rounded-2xl p-7 hover:border-[#f36e21]/60 transition-colors overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#f36e21]/0 group-hover:bg-[#f36e21]/10 blur-2xl transition-colors duration-500" />
              <div className="relative w-12 h-12 rounded-xl bg-[#f36e21]/15 text-[#f36e21] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {ICONS[it.icon] ?? <Zap className="w-6 h-6" />}
              </div>
              <h3 className="relative text-xl font-impact text-white tracking-wide mb-3">
                {it.title}
              </h3>
              <p className="relative text-white/70 leading-relaxed">{it.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
