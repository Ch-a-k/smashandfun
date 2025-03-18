"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nContext';

export function CTASection() {
  const { t } = useI18n();

  return (
    <section className="relative w-full bg-[#f36e21] py-24">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#231f20] backdrop-blur-sm rounded-2xl p-12 relative"
        >
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 rounded-2xl pointer-events-none" />
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('organizeParty.cta.title')}
          </h2>
          <p className="text-white/70 mb-8">
            {t('organizeParty.cta.description')}
          </p>
          <Link
            href="/kontakt#contact-form"
            className="inline-block px-12 py-6 bg-[#f36e21] text-white font-bold rounded-lg
              transform transition-all duration-200 hover:scale-105 hover:bg-[#ff7b2e]
              focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:ring-opacity-50
              text-lg"
          >
            {t('common.bookNow')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 