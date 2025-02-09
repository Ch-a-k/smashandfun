'use client';

import { useLanguage } from '../i18n/LanguageProvider';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function FAQ() {
  const { t } = useLanguage();
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  return (
    <main>
      <PageHeader 
        title={t('faq.title')} 
        subtitle={t('faq.subtitle')} 
      />
      {/* FAQ Questions */}
      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="space-y-6">
            {t('faq.questions').map((question: { q: string; a: string }, index: number) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/80 backdrop-blur-sm border-2 border-[#ff5a00] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left"
                >
                  <h3 className="text-xl font-semibold text-[#ff5a00]">{question.q}</h3>
                  <ChevronDown
                    className={`w-6 h-6 text-[#ff5a00] transform transition-transform duration-300 ${
                      openQuestion === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`px-8 transition-all duration-300 ease-in-out ${
                    openQuestion === index ? 'py-6 border-t border-[#ff5a00]/20' : 'max-h-0 overflow-hidden'
                  }`}
                >
                  <p className="text-gray-300">{question.a}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
