"use client";

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';
import { PartyPopper, Gift, Building } from 'lucide-react';

const services = [
  {
    icon: <PartyPopper className="w-8 h-8" />,
    key: 'events'
  },
  {
    icon: <Gift className="w-8 h-8" />,
    key: 'voucher'
  },
  {
    icon: <Building className="w-8 h-8" />,
    key: 'space'
  }
] as const;

export function IntroSection() {
  const { t } = useI18n();

  return (
    <section className="w-full bg-[#231f20] pt-2 pb-2">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-[#f36e21] text-center mb-2"
        >
          {t('organizeParty.intro.subtitle')}
        </motion.h2>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
        >
          {t('organizeParty.intro.title')}
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 relative group 
                hover:bg-white/10 transition-all duration-300"
            >
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent 
                opacity-10 rounded-2xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="text-[#f36e21] mb-6 transform group-hover:scale-110 
                  transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {t(`organizeParty.intro.services.${service.key}.title`)}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {t(`organizeParty.intro.services.${service.key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 