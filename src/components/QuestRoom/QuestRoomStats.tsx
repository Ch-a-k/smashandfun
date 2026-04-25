"use client";

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';
import {
  Phone,
  Sparkles,
  HeartCrack,
  Briefcase,
  Cake,
  Lock,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  phone: Phone,
  sparkles: Sparkles,
  'heart-crack': HeartCrack,
  briefcase: Briefcase,
  cake: Cake,
  lock: Lock,
};

type Scenario = { icon: string; title: string; description: string };

export function QuestRoomStats() {
  const { t } = useI18n();
  const items = (t('questRoom.stats.items', { returnObjects: true }) as Scenario[]) || [];
  const subtitle = t('questRoom.stats.subtitle') as string;

  if (!items.length) return null;

  return (
    <section className="relative w-full bg-[#1a1718] py-24 border-y border-white/5 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, rgba(243,110,33,0.08), transparent 65%)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <p className="text-[#f36e21] font-impact tracking-widest uppercase text-sm mb-3">
            {t('questRoom.stats.eyebrow')}
          </p>
          <h2 className="text-3xl md:text-5xl font-impact text-white leading-tight mb-4">
            {t('questRoom.stats.title')}
          </h2>
          {subtitle && (
            <p className="text-white/65 text-lg">{subtitle}</p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => {
            const Icon = ICON_MAP[item.icon] ?? Phone;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="group relative bg-white/[0.04] border border-white/10 rounded-2xl p-6 md:p-7 hover:border-[#f36e21]/50 hover:bg-white/[0.06] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f36e21]/15 text-[#f36e21] flex items-center justify-center mb-4 group-hover:bg-[#f36e21]/25 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-impact text-white tracking-tight mb-2 leading-tight uppercase">
                  {item.title}
                </h3>
                <p className="text-white/65 leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
