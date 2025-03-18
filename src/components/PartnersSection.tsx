"use client";

import { motion } from 'framer-motion'
import { ResponsiveImage } from './ui/ResponsiveImage'
import { useI18n } from '@/i18n/I18nContext'

interface Partner {
  key: 'wyjatkowy-prezent' | 'super-prezenty';
  logo: string;
}

const PARTNERS: Partner[] = [
  {
    key: 'wyjatkowy-prezent',
    logo: '/images/partner1.png'
  },
  {
    key: 'super-prezenty',
    logo: '/images/partner2.png'
  }
];

function PartnerCard({ partner }: { partner: Partner }) {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden p-8"
    >
      {/* Logo */}
      <div className="w-full h-32 relative">
        <ResponsiveImage
          src={partner.logo}
          alt={t(`home.partners.${partner.key}.name`)}
          className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
          fill
          sizes="(max-width: 768px) 100vw, 200px"
        />
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f36e21]/0 via-[#f36e21]/0 to-[#f36e21]/0 
        group-hover:from-[#f36e21]/10 group-hover:via-[#f36e21]/5 group-hover:to-transparent transition-all duration-500" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent 
        opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-r from-[#f36e21] via-[#f36e21] to-transparent 
        opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    </motion.div>
  );
}

export function PartnersSection() {
  const { t } = useI18n();

  return (
    <section className="relative py-16 bg-[#231f20]">
      {/* Background effects */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f36e21]/5 rounded-full blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#231f20]/90 rounded-full blur-[150px]" />
      
      <div className="max-w-5xl mx-auto px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-[#f36e21] text-sm font-medium tracking-wider uppercase block mb-2">
            {t('home.partners.subtitle')}
          </span>
          <h2 className="text-4xl font-bold text-white">
            {t('home.partners.title')}
          </h2>
        </motion.div>

        {/* Partners grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {PARTNERS.map((partner) => (
            <PartnerCard
              key={partner.key}
              partner={partner}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
