'use client';

import { useLanguage } from '../i18n/LanguageProvider';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ } from '../i18n/types';

export default function FAQPage() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const questions = t('faq.questions') as FAQ[];

  return (
    <div className="min-h-screen py-32">
      <div className="max-w-4xl mx-auto px-4 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-protest text-[#ff5a00] mb-4">
          {t('faq.title')}
        </h1>
        <p className="text-xl text-gray-300">{t('faq.subtitle')}</p>
      </div>
      
      <div className="max-w-3xl mx-auto px-4">
        <div className="space-y-6">
          {questions.map((question: FAQ, index: number) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900/50 backdrop-blur-sm rounded-lg overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-lg font-medium">{question.q}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? 'auto' : 0,
                  opacity: openIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 text-gray-300">
                  {question.a}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
