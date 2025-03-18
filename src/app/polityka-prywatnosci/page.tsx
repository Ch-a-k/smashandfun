"use client";

import { useI18n } from '@/i18n/I18nContext';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, Cookie, UserCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SECTION_ICONS = {
  general: Shield,
  dataCollection: FileText,
  dataUsage: Lock,
  cookies: Cookie,
  rights: UserCheck,
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function PrivacyPolicyPage() {
  const { t } = useI18n();

  const sections = [
    'general',
    'dataCollection',
    'dataUsage',
    'cookies',
    'rights'
  ].map(section => ({
    key: section,
    title: t(`privacyPolicy.sections.${section}.title`),
    content: t(`privacyPolicy.sections.${section}.content`, { returnObjects: true }) as string[],
    Icon: SECTION_ICONS[section as keyof typeof SECTION_ICONS]
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-[#1a1718] to-[#231f20]">
        {/* Hero Section */}
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
                {t('privacyPolicy.title')}
              </h1>
              <p className="text-white/60">
                {t('privacyPolicy.lastUpdated')} 01.03.2024
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="relative w-full pb-24">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="space-y-12"
            >
              {sections.map(({ key, title, content, Icon }) => (
                <motion.div
                  key={key}
                  variants={fadeInUp}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 relative group"
                >
                  {/* Glass effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 rounded-2xl pointer-events-none" />
                  
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 rounded-xl bg-[#f36e21]/10 text-[#f36e21] group-hover:bg-[#f36e21]/20 transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        {title}
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      {content.map((paragraph, index) => (
                        <p 
                          key={index} 
                          className={`text-white/70 leading-relaxed ${
                            paragraph.startsWith('•') ? 'pl-4' : ''
                          }`}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
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
                <h3 className="text-xl font-bold text-white mb-4">
                  {t('contact.info.title')}
                </h3>
                <div className="space-y-2 text-white/70">
                  <p>{t('contact.info.address.line1')}</p>
                  <p>{t('contact.info.address.line2')}</p>
                  <p>{t('contact.info.email.address')}</p>
                  <p>{t('contact.info.phone.number')}</p>
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
