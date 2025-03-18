"use client";

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';

export function CTASection() {
  const { t } = useI18n();

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[#1a1718] to-[#231f20]">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/images/texture.png')] bg-repeat opacity-20"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            {t('blog.ctaSection.title')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/70 mb-10"
          >
            {t('blog.ctaSection.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.a
              href="https://smashandfun.simplybook.it/v2/#book/count/1/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-[#f36e21] text-white font-bold rounded-lg 
                transform transition-all duration-200 hover:bg-[#ff7b2e] 
                focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:ring-opacity-50
                shadow-lg shadow-[#f36e21]/20 hover:shadow-xl hover:shadow-[#f36e21]/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('blog.ctaSection.cta')}
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 