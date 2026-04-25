"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';
import { ChevronDown } from 'lucide-react';

type Item = { q: string; a: string };

export function QuestRoomFAQ() {
  const { t } = useI18n();
  const items = (t('questRoom.faq.items', { returnObjects: true }) as Item[]) || [];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="relative w-full bg-[#1a1718] py-24">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[#f36e21] font-impact tracking-widest uppercase text-sm mb-3">
            {t('questRoom.faq.eyebrow')}
          </p>
          <h2 className="text-3xl md:text-5xl font-impact text-white leading-tight">
            {t('questRoom.faq.title')}
          </h2>
        </motion.div>

        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.06] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-white font-impact tracking-wide text-lg">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#f36e21] flex-shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-white/75 leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
