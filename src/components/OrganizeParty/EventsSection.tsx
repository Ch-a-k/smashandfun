"use client";

import { motion } from 'framer-motion';
import { ResponsiveImage } from '../ui/ResponsiveImage';
import { useI18n } from '@/i18n/I18nContext';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const events = ['party', 'kids'] as const;

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export function EventsSection() {
  const { t } = useI18n();
  const router = useRouter();

  const navigateToContactForm = () => {
    router.push('/kontakt#contact-form');
  };

  return (
    <section className="w-full bg-[#231f20] py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="space-y-24">
          {events.map((eventKey, index) => (
            <motion.div
              key={eventKey}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={{
                initial: { opacity: 0 },
                animate: { opacity: 1 }
              }}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
            >
              <div className="w-full md:w-1/2">
                <div className="relative aspect-video rounded-2xl overflow-hidden">
                  <ResponsiveImage
                    src={`/images/${eventKey}.png`}
                    alt={t(`organizeParty.events.${eventKey}.title`)}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1718] to-transparent opacity-60" />
                </div>
              </div>
              <div className="w-full md:w-1/2 space-y-6">
                <motion.h3 
                  variants={fadeInUp}
                  className="text-3xl font-bold text-white"
                >
                  {t(`organizeParty.events.${eventKey}.title`)}
                </motion.h3>
                <motion.p 
                  variants={fadeInUp}
                  className="text-white/70"
                >
                  {t(`organizeParty.events.${eventKey}.description`)}
                </motion.p>
                <motion.div
                  variants={fadeInUp}
                >
                  <button
                    onClick={navigateToContactForm}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#f36e21] text-white font-semibold rounded-lg
                      transform transition-all duration-200 hover:bg-[#ff7b2e] hover:scale-105
                      focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:ring-opacity-50"
                  >
                    {t('common.learnMore')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 
 