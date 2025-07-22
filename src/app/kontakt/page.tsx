"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useI18n } from '@/i18n/I18nContext';

export default function Kontakt() {
  const { t } = useI18n();
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Схема валидации формы с использованием переводов
  const formSchema = z.object({
    name: z.string().min(2, { message: t('contact.form.validation.name') }),
    email: z.string().email({ message: t('contact.form.validation.email') }),
    phone: z.string().min(9, { message: t('contact.form.validation.phone') }),
    message: z.string().min(10, { message: t('contact.form.validation.message') })
  });

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Wystąpił błąd podczas wysyłania wiadomości');
      }

      setIsSuccess(true);
      reset();
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Błąd podczas wysyłania formularza:', error);
      // Здесь можно добавить обработку ошибок, например, показать сообщение пользователю
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
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
              {t('contact.hero.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-white/70 text-center max-w-2xl mx-auto"
            >
              {t('contact.hero.subtitle')}
            </motion.p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="w-full bg-[#231f20] pb-32">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 h-full"
              >
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 rounded-2xl pointer-events-none" />
                
                <h2 className="text-2xl font-bold text-white mb-6">
                  {t('contact.info.title')}
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-lg font-semibold text-[#f36e21] mb-2">
                      {t('contact.info.address.title')}
                    </p>
                    <p className="text-white/70">
                      {t('contact.info.address.line1')}<br />
                      {t('contact.info.address.line2')}
                    </p>
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-[#f36e21] mb-2">
                      {t('contact.info.phone.title')}
                    </p>
                    <p className="text-white/70">
                      <a href="tel:+48881281313" className="hover:text-white transition-colors">
                        {t('contact.info.phone.number')}
                      </a>
                    </p>
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-[#f36e21] mb-2">
                      {t('contact.info.email.title')}
                    </p>
                    <p className="text-white/70">
                      <a href="mailto:hello@smashandfun.pl" className="hover:text-white transition-colors">
                        {t('contact.info.email.address')}
                      </a>
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold text-[#f36e21] mb-2">
                      {t('contact.info.openingHours.title')}
                    </p>
                    <p className="text-white/70">
                      {t('contact.info.openingHours.weekdays')}<br />
                      {t('contact.info.openingHours.weekend')}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:col-span-2 bg-white/5 backdrop-blur-sm rounded-2xl p-8 relative"
                id="contact-form"
              >
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 rounded-2xl pointer-events-none" />
                
                <h2 className="text-2xl font-bold text-white mb-6">
                  {t('contact.form.title')}
                </h2>
                
                {isSuccess && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-400">
                      {t('contact.form.success')}
                    </p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-white/80 mb-2">
                        {t('contact.form.name.label')}
                      </label>
                      <input
                        {...register('name')}
                        id="name"
                        type="text"
                        placeholder={t('contact.form.name.placeholder')}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white
                          focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:border-transparent"
                      />
                      {errors.name && (
                        <p className="mt-1 text-red-400 text-sm">{errors.name.message}</p>
                      )}
                    </div>
                    
                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-white/80 mb-2">
                        {t('contact.form.email.label')}
                      </label>
                      <input
                        {...register('email')}
                        id="email"
                        type="email"
                        placeholder={t('contact.form.email.placeholder')}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white
                          focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:border-transparent"
                      />
                      {errors.email && (
                        <p className="mt-1 text-red-400 text-sm">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Phone Field */}
                  <div>
                    <label htmlFor="phone" className="block text-white/80 mb-2">
                      {t('contact.form.phone.label')}
                    </label>
                    <input
                      {...register('phone')}
                      id="phone"
                      type="tel"
                      placeholder={t('contact.form.phone.placeholder')}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white
                        focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:border-transparent"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-red-400 text-sm">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  {/* Message Field */}
                  <div>
                    <label htmlFor="message" className="block text-white/80 mb-2">
                      {t('contact.form.message.label')}
                    </label>
                    <textarea
                      {...register('message')}
                      id="message"
                      rows={5}
                      placeholder={t('contact.form.message.placeholder')}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white
                        focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:border-transparent"
                    ></textarea>
                    {errors.message && (
                      <p className="mt-1 text-red-400 text-sm">{errors.message.message}</p>
                    )}
                  </div>
                  
                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      className="px-8 py-4 bg-[#f36e21] text-white font-bold rounded-lg
                        transform transition-all duration-200 hover:scale-105 hover:bg-[#ff7b2e]
                        focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:ring-opacity-50"
                    >
                      {t('contact.form.submit')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Map Section */}
        <section className="w-full bg-[#231f20] pb-32">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 relative"
            >
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 rounded-2xl pointer-events-none" />
              
              <h2 className="text-2xl font-bold text-white mb-6">
                {t('contact.map.title')}
              </h2>
              
              <div className="aspect-[16/9] w-full rounded-lg overflow-hidden">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2293.4735820417523!2d20.996727099999998!3d52.1821125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471933267d0087ff%3A0x93741029e0bcf2d2!2sPost%C4%99pu%2019%2F4%2C%2003-676%20Warszawa!5e1!3m2!1sru!2spl!4v1741728675660!5m2!1sru!2spl" 
              width="100%" 
              height="100%" 
              style= {{border:0}} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              ></iframe>

              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
