"use client";

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';
import {
  MousePointerClick,
  MapPin,
  ShieldCheck,
  Hammer,
  Sofa,
  type LucideIcon,
} from 'lucide-react';

const ICONS: LucideIcon[] = [MousePointerClick, MapPin, ShieldCheck, Hammer, Sofa];

type Step = { title: string; description: string };

export function QuestRoomProcess() {
  const { t } = useI18n();
  const steps = (t('questRoom.process.steps', { returnObjects: true }) as Step[]) || [];

  if (!steps.length) return null;

  return (
    <section className="relative w-full bg-[#1a1718] pt-24 pb-40 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(243,110,33,0.08), transparent 65%)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="text-[#f36e21] font-impact tracking-widest uppercase text-sm mb-3">
            {t('questRoom.process.eyebrow')}
          </p>
          <h2 className="text-3xl md:text-5xl font-impact text-white leading-tight">
            {t('questRoom.process.title')}
          </h2>
        </motion.div>

        <div className="relative">
          {/* Horizontal connecting line on desktop, vertical on mobile */}
          <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#f36e21]/40 to-transparent" />
          <div className="lg:hidden absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-[#f36e21]/0 via-[#f36e21]/40 to-[#f36e21]/0" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-4">
            {steps.map((s, i) => {
              const Icon = ICONS[i] ?? Hammer;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative pl-20 lg:pl-0"
                >
                  {/* Step number — sits on the timeline */}
                  <div className="absolute left-0 top-0 lg:relative lg:mx-auto lg:mb-5 z-10 flex items-center justify-center w-16 h-16 rounded-full bg-[#1a1718] border-2 border-[#f36e21] font-impact text-[#f36e21] text-xl shadow-[0_0_30px_rgba(243,110,33,0.45)]">
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 h-full hover:border-[#f36e21]/50 hover:bg-white/[0.06] hover:-translate-y-1 transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-[#f36e21]/15 text-[#f36e21] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg md:text-xl font-impact text-white tracking-tight mb-2 leading-tight uppercase">
                      {s.title}
                    </h3>
                    <p className="text-white/65 text-sm leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
