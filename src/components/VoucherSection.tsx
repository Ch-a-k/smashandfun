"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { ResponsiveImage } from './ui/ResponsiveImage';
import { useRouter } from "next/navigation";
import { Gift, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';

export function VoucherSection() {
  const { t } = useI18n();
  const router = useRouter();
  
  // Функция для перехода к форме контактов с фокусом на первое поле
  const goToContactForm = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Перенаправляем на страницу контактов
    router.push('/kontakt#contact-form');
    
    // Скрипт для фокуса будет выполнен после загрузки страницы
    // Используем setTimeout, чтобы дать время для рендеринга страницы
    setTimeout(() => {
      // Скроллим к форме
      const formElement = document.getElementById('contact-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
        
        // Фокусируемся на первом поле формы (name)
        const nameInput = document.getElementById('name');
        if (nameInput) {
          nameInput.focus();
        }
      }
    }, 500);
  }, [router]);

  return (
    <section className="relative w-full bg-[#0f0f12] py-32 ">
      {/* Background effects */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f36e21]/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] bg-[#231f20]/90 rounded-full blur-[150px]" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 space-y-8">
              {/* Section label */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-block"
              >
                <span className="text-xs font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#f36e21] to-[#ff9f58] mb-3 block">
                  {t('home.voucher.title')}
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  {t('home.voucher.subtitle')}
                </h2>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg text-white/70"
              >
                {t('home.voucher.description')}
              </motion.p>

              {/* Benefits list */}
              <div className="space-y-4">
                {t('home.voucher.benefits', { returnObjects: true }).map((benefit: string, index: number) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#f36e21]/10 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#f36e21]" />
                    </div>
                    <span className="text-white/70">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.a
                href="/kontakt#contact-form"
                onClick={goToContactForm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-2 bg-[#f36e21] text-white px-8 py-4 rounded-xl overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Gift className="w-5 h-5" />
                <span className="font-semibold">{t('home.voucher.cta')}</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>
          </motion.div>

          {/* Right column with voucher preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden 
                          bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-sm 
                          border border-white/[0.08]">
              {/* Voucher image */}
              <ResponsiveImage
                src="/images/voucher.png"
                alt="Smash&Fun Voucher"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain p-8 transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Hover effects */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
                            bg-gradient-to-r from-[#f36e21]/0 via-[#f36e21]/5 to-[#f36e21]/0 
                            transition-opacity duration-700" />
            </div>

            {/* Decorative elements */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#f36e21]/20 via-[#f36e21]/10 to-[#f36e21]/20 
                          rounded-3xl blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Floating elements */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-[#f36e21] to-[#ff9f58] 
                        rounded-full blur-2xl opacity-40"
            />
            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-[#551fb7] to-[#f36e21] 
                        rounded-full blur-2xl opacity-30"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
