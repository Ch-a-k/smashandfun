"use client";

import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Scale,
  FileText,
  XCircle,
  Calendar,
  Shield,
  ScrollText,
  CreditCard,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useI18n } from '@/i18n/I18nContext';
import { refundPolicyContent, type RefundPolicySectionKey } from '@/content/refundPolicy';

const SECTION_ICONS: Record<RefundPolicySectionKey, ComponentType<{ className?: string }>> = {
  overview: BookOpen,
  legalBasis: Scale,
  reservationNature: FileText,
  clientCancellation: XCircle,
  rescheduling: Calendar,
  providerCancellation: Shield,
  complaints: ScrollText,
  final: CreditCard,
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function RefundPolicyPage() {
  const { locale, t } = useI18n();
  const content = refundPolicyContent[locale];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-[#1a1718] to-[#231f20]">
        <section className="relative w-full py-24">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30" />

          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {content.title}
              </h1>
              <div className="text-white/60 space-y-2">
                <p>{t('terms.companyInfo.name')}</p>
                <p>{t('terms.companyInfo.address')}</p>
                <p>{t('terms.companyInfo.city')}</p>
                <p>{t('terms.companyInfo.nip')}</p>
                <p>{t('terms.companyInfo.regon')}</p>
                <p>{t('terms.companyInfo.krs')}</p>
                <p className="mt-4">{content.lastUpdatedLabel} 14.04.2026</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative w-full pb-12">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#f36e21]/10 backdrop-blur-sm rounded-2xl p-8 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-10 rounded-2xl pointer-events-none" />
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-4">{content.summaryTitle}</h2>
                <p className="text-white/80 leading-relaxed">{content.summaryText}</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative w-full pb-24">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="space-y-12"
            >
              {content.sections.map((section) => {
                const Icon = SECTION_ICONS[section.key];

                return (
                  <motion.div
                    key={section.key}
                    variants={fadeInUp}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 rounded-2xl pointer-events-none" />

                    <div className="relative">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-[#f36e21]/10 text-[#f36e21] group-hover:bg-[#f36e21]/20 transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                      </div>

                      <div className="space-y-4">
                        {section.content.map((paragraph, index) => (
                          <p key={index} className="text-white/75 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section className="relative w-full pb-24">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-[#f36e21]/10 backdrop-blur-sm rounded-2xl p-8 text-center relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-10 rounded-2xl pointer-events-none" />

              <div className="relative">
                <div className="text-white/70 space-y-2">
                  <p>{t('terms.companyInfo.name')}</p>
                  <p>{t('terms.companyInfo.address')}</p>
                  <p>{t('terms.companyInfo.city')}</p>
                  <p>{t('terms.companyInfo.nip')}</p>
                  <p>{t('terms.companyInfo.regon')}</p>
                  <p>{t('terms.companyInfo.krs')}</p>
                  <p className="mt-4 text-sm">{t('terms.footer')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
