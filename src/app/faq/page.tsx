"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useI18n } from '@/i18n/I18nContext';

export default function FAQ() {
  const { t } = useI18n();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Массив вопросов и ответов
  const faqItems = [
    {
      question: t('faq.items.general.questions.0'),
      answer: t('faq.items.general.answers.0')
    },
    {
      question: t('faq.items.general.questions.1'),
      answer: t('faq.items.general.answers.1')
    },
    {
      question: t('faq.items.booking.questions.0'),
      answer: t('faq.items.booking.answers.0')
    },
    {
      question: t('faq.items.booking.questions.1'),
      answer: t('faq.items.booking.answers.1')
    },
    {
      question: t('faq.items.safety.questions.0'),
      answer: t('faq.items.safety.answers.0')
    },
    {
      question: t('faq.items.safety.questions.1'),
      answer: t('faq.items.safety.answers.1')
    },
    {
      question: t('faq.items.payment.questions.0'),
      answer: t('faq.items.payment.answers.0')
    },
    {
      question: t('faq.items.payment.questions.1'),
      answer: t('faq.items.payment.answers.1')
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative w-full bg-[#231f20] py-32">
          {/* Decorative line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
          
          <div className="max-w-7xl mx-auto px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold text-white text-center mb-8"
            >
              {t('faq.hero.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-white/70 text-center max-w-2xl mx-auto"
            >
              {t('faq.hero.subtitle')}
            </motion.p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full bg-[#231f20] pb-32">
          <div className="max-w-3xl mx-auto px-4">
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl relative"
                >
                  {/* Glass effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 rounded-2xl pointer-events-none" />
                  
                  <div
                    className="p-6 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpand(index)}
                  >
                    <h3 className="text-lg md:text-xl font-semibold text-white pr-10">{item.question}</h3>
                    <div className={`text-[#f36e21] transform transition-transform duration-300 ${expandedIndex === index ? 'rotate-180' : ''}`}>
                      <ChevronDown size={24} />
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-white/70">
                          <div className="border-t border-white/10 pt-4">
                            {item.answer}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
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
                {t('faq.cta.title')}
              </h2>
              <p className="text-white/70 mb-8">
                {t('faq.cta.description')}
              </p>
              <a
                href="/kontakt#contact-form"
                className="inline-block px-8 py-4 bg-[#f36e21] text-white font-bold rounded-lg
                  transform transition-all duration-200 hover:scale-105 hover:bg-[#ff7b2e]
                  focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:ring-opacity-50"
              >
                {t('faq.cta.button')}
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
