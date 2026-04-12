"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useI18n } from '@/i18n/I18nContext';
import { Calendar, Users, CheckCircle, ArrowRight, Briefcase, Award, Layers, FileText, Shield } from 'lucide-react';
import { sendGTMEvent } from '@next/third-parties/google';
import { getUtmParams } from '@/lib/bookingUtm';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { pl } from 'date-fns/locale/pl';

registerLocale('pl', pl);

interface ExtraItem {
  id: string;
  name: string;
  price: number;
  description?: string;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function OrganizacjaImprezB2B() {
  const { t } = useI18n();
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [availableExtraItems, setAvailableExtraItems] = useState<ExtraItem[]>([]);
  const [selectedExtraItems, setSelectedExtraItems] = useState<{id: string; count: number}[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [extrasOpen, setExtrasOpen] = useState(false);

  // Refs for scroll animations
  const descriptionRef = useRef(null);
  const formRef = useRef(null);
  const isDescriptionInView = useInView(descriptionRef, { once: true, amount: 0.3 });
  const isFormInView = useInView(formRef, { once: true, amount: 0.3 });

  // Fetch extra items on mount
  useEffect(() => {
    fetch('/api/booking/extra-items')
      .then(res => res.json())
      .then((items: ExtraItem[]) => setAvailableExtraItems(items))
      .catch(() => {});
  }, []);

  function adjustExtraItem(id: string, newCount: number) {
    setSelectedExtraItems(prev => {
      if (newCount <= 0) return prev.filter(e => e.id !== id);
      const exists = prev.find(e => e.id === id);
      if (exists) return prev.map(e => e.id === id ? { ...e, count: newCount } : e);
      return [...prev, { id, count: newCount }];
    });
  }

  // Form validation schema using translations
  const formSchema = z.object({
    name: z.string().min(2, { message: t('b2b.form.validation.name') }),
    email: z.string().email({ message: t('b2b.form.validation.email') }),
    phone: z.string().min(9, { message: t('b2b.form.validation.phone') }),
    people: z.coerce.number().min(1, { message: t('b2b.form.validation.people') }),
    dateFrom: z.string().min(1, { message: t('b2b.form.validation.dateFrom') }),
    dateTo: z.string().optional(),
    message: z.string().optional()
  });

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setIsError(false);
      const response = await fetch('/api/b2b-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          service: 'corporate_events',
          extraItems: selectedExtraItems.filter(e => e.count > 0),
          ...getUtmParams(),
          referrer: getUtmParams().referrer || document.referrer || null,
          landing_page: getUtmParams().landing_page || window.location.pathname,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'An error occurred');
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      sendGTMEvent({
        event: 'b2b_form_submit',
        form_type: 'b2b',
        people: data.people,
        date: data.dateFrom,
      });
      reset();
      setSelectedExtraItems([]);
      setDateRange([null, null]);
    } catch (error) {
      setIsSubmitting(false);
      setIsError(true);
      console.error('Error submitting form:', error);
    }
  };

  // Преимущества для корпоративных клиентов
  const benefits = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: t('b2b.benefits.benefit1.title'),
      description: t('b2b.benefits.benefit1.description'),
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t('b2b.benefits.benefit2.title'),
      description: t('b2b.benefits.benefit2.description'),
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: t('b2b.benefits.benefit3.title'),
      description: t('b2b.benefits.benefit3.description'),
    },
  ];

  // Типы услуг для вкладок
  const serviceTypes = [
    {
      title: t('b2b.serviceTypes.teamBuilding.title'),
      icon: <Users className="w-5 h-5" />,
      description: t('b2b.serviceTypes.teamBuilding.description'),
      features: t('b2b.serviceTypes.teamBuilding.features', { returnObjects: true }) as string[]
    },
    {
      title: t('b2b.serviceTypes.corporateEvents.title'),
      icon: <Award className="w-5 h-5" />,
      description: t('b2b.serviceTypes.corporateEvents.description'),
      features: t('b2b.serviceTypes.corporateEvents.features', { returnObjects: true }) as string[]
    },
    {
      title: t('b2b.serviceTypes.integration.title'),
      icon: <Layers className="w-5 h-5" />,
      description: t('b2b.serviceTypes.integration.description'),
      features: t('b2b.serviceTypes.integration.features', { returnObjects: true }) as string[]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-[#231f20]">
        {/* Hero Section - с анимированными изображениями */}
        <section className="relative w-full bg-[#231f20] py-16 overflow-hidden">
          {/* Decorative line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
          
          {/* Animated images */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Верхние плавающие изображения */}
            <motion.div 
              className="absolute -top-10 left-[10%] w-24 h-24 md:w-32 md:h-32"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="w-full h-full relative"
              >
                <Image 
                  src="/images/1.png" 
                  alt="Decoration" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="absolute top-20 right-[15%] w-20 h-20 md:w-28 md:h-28"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, -8, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="w-full h-full relative"
              >
                <Image 
                  src="/images/2o.png" 
                  alt="Decoration" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
            
            {/* Центральные плавающие изображения */}
            <motion.div 
              className="absolute left-[5%] top-1/2 -translate-y-1/2 w-16 h-16 md:w-24 md:h-24"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 0.8, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <motion.div
                animate={{ 
                  x: [0, 15, 0],
                  y: [0, 10, 0],
                  rotate: [0, 10, 0]
                }}
                transition={{ 
                  duration: 7, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="w-full h-full relative"
              >
                <Image 
                  src="/images/3o.png" 
                  alt="Decoration" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="absolute right-[5%] top-1/2 -translate-y-1/3 w-16 h-16 md:w-24 md:h-24"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 0.8, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <motion.div
                animate={{ 
                  x: [0, -15, 0],
                  y: [0, -10, 0],
                  rotate: [0, -10, 0]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="w-full h-full relative"
              >
                <Image 
                  src="/images/4o.png" 
                  alt="Decoration" 
                  fill 
                  onLoad={() => {}}
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
            
            {/* Нижние плавающие изображения */}
            <motion.div 
              className="absolute bottom-10 left-[20%] w-16 h-16 md:w-20 md:h-20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <motion.div
                animate={{ 
                  y: [0, 15, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="w-full h-full relative"
              >
                <Image 
                  src="/images/5o.png" 
                  alt="Decoration" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="absolute bottom-20 right-[25%] w-16 h-16 md:w-20 md:h-20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              <motion.div
                animate={{ 
                  y: [0, 12, 0],
                  rotate: [0, 8, 0]
                }}
                transition={{ 
                  duration: 7, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3
                }}
                className="w-full h-full relative"
              >
                <Image 
                  src="/images/6o.png" 
                  alt="Decoration" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
          </div>
          
          {/* Hero content overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#231f20] via-[#231f20]/80 to-[#231f20] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold text-white text-center mb-8"
            >
              {t('b2b.hero.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-white/70 text-center max-w-2xl mx-auto"
            >
              {t('b2b.hero.subtitle')}
            </motion.p>
          </div>
        </section>

        {/* ══════ Contact Form — right after hero ══════ */}
        <section className="w-full bg-[#231f20] pt-6 pb-16 relative" id="contact-form" ref={formRef}>
          <div className="absolute -top-40 right-0 w-96 h-96 bg-[#f36e21]/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-3xl mx-auto px-4 relative z-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {t('b2b.form.title')}
              </h2>
              <p className="text-white/50 max-w-xl mx-auto text-sm">
                {t('b2b.form.subtitle')}
              </p>
            </div>

            <div className="bg-gradient-to-b from-[#1a1718] to-[#231f20] rounded-2xl shadow-[0_0_30px_rgba(243,110,33,0.1)] border border-white/5 p-6 md:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="space-y-1">
                      <label htmlFor="name" className="block text-white/90 text-sm font-medium">
                        {t('b2b.form.name.label')} <span className="text-[#f36e21]">*</span>
                      </label>
                      <input {...register('name')} id="name" type="text" placeholder={t('b2b.form.name.placeholder')}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#f36e21]/50 focus:border-[#f36e21]/50 transition-all" />
                      {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                    </div>
                    {/* Email */}
                    <div className="space-y-1">
                      <label htmlFor="email" className="block text-white/90 text-sm font-medium">
                        {t('b2b.form.email.label')} <span className="text-[#f36e21]">*</span>
                      </label>
                      <input {...register('email')} id="email" type="email" placeholder={t('b2b.form.email.placeholder')}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#f36e21]/50 focus:border-[#f36e21]/50 transition-all" />
                      {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Phone */}
                    <div className="space-y-1">
                      <label htmlFor="phone" className="block text-white/90 text-sm font-medium">
                        {t('b2b.form.phone.label')} <span className="text-[#f36e21]">*</span>
                      </label>
                      <input {...register('phone')} id="phone" type="tel" placeholder={t('b2b.form.phone.placeholder')}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#f36e21]/50 focus:border-[#f36e21]/50 transition-all" />
                      {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
                    </div>
                    {/* People */}
                    <div className="space-y-1">
                      <label htmlFor="people" className="block text-white/90 text-sm font-medium">
                        {t('b2b.form.people.label')} <span className="text-[#f36e21]">*</span>
                      </label>
                      <input {...register('people', { valueAsNumber: true })} id="people" type="number" min="1" placeholder={t('b2b.form.people.placeholder')}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#f36e21]/50 focus:border-[#f36e21]/50 transition-all" />
                      {errors.people && <p className="text-red-400 text-xs">{errors.people.message}</p>}
                    </div>
                    {/* Date */}
                    <div className="space-y-1">
                      <label className="block text-white/90 text-sm font-medium">
                        {t('b2b.form.dateFrom.label')} <span className="text-[#f36e21]">*</span>
                      </label>
                      <input type="hidden" {...register('dateFrom')} />
                      <input type="hidden" {...register('dateTo')} />
                      <div className="b2b-dp">
                        <DatePicker
                          selectsRange startDate={dateRange[0]} endDate={dateRange[1]}
                          onChange={(update: [Date | null, Date | null]) => {
                            setDateRange(update);
                            setValue('dateFrom', update[0] ? formatDate(update[0]) : '', { shouldValidate: true });
                            setValue('dateTo', update[1] ? formatDate(update[1]) : '');
                          }}
                          minDate={new Date()} isClearable placeholderText={t('b2b.form.dateFrom.placeholder')}
                          dateFormat="dd.MM.yyyy" locale="pl"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#f36e21]/50 focus:border-[#f36e21]/50 transition-all"
                        />
                      </div>
                      {errors.dateFrom && <p className="text-red-400 text-xs">{errors.dateFrom.message}</p>}
                    </div>
                  </div>

                  {/* Extra Items — accordion */}
                  {availableExtraItems.length > 0 && (
                    <div>
                      <button type="button" onClick={() => setExtrasOpen(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/[0.08] transition-colors">
                        <span className="text-white/90 text-sm font-medium">{t('b2b.form.extraItems.label')}</span>
                        <motion.span animate={{ rotate: extrasOpen ? 180 : 0 }} transition={{ duration: 0.2 }}
                          className="text-[#f36e21] text-lg leading-none">&#9662;</motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {extrasOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <p className="text-white/50 text-xs mt-2 mb-2">{t('b2b.form.extraItems.subtitle')}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {availableExtraItems.map(item => {
                                const sel = selectedExtraItems.find(e => e.id === item.id)?.count ?? 0;
                                return (
                                  <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                                    <span className="text-white text-sm font-medium">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                      <button type="button" onClick={() => adjustExtraItem(item.id, sel - 1)} disabled={sel === 0}
                                        className="w-7 h-7 rounded-full bg-white/10 text-white disabled:opacity-30 flex items-center justify-center text-lg leading-none">-</button>
                                      <span className="text-white w-4 text-center text-sm">{sel}</span>
                                      <button type="button" onClick={() => adjustExtraItem(item.id, sel + 1)}
                                        className="w-7 h-7 rounded-full bg-[#f36e21]/80 text-white flex items-center justify-center text-lg leading-none">+</button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Message */}
                  <div className="space-y-1">
                    <label htmlFor="message" className="block text-white/90 text-sm font-medium">{t('b2b.form.message.label')}</label>
                    <textarea {...register('message')} id="message" rows={3} placeholder={t('b2b.form.message.placeholder')}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#f36e21]/50 focus:border-[#f36e21]/50 transition-all resize-none" />
                  </div>

                  {/* Trust items — compact inline row */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {(t('b2b.trust.items', { returnObjects: true }) as string[]).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-white/70 text-xs">
                        {i % 2 === 0 ? <FileText className="w-3.5 h-3.5 text-[#f36e21] flex-shrink-0" /> : <Shield className="w-3.5 h-3.5 text-[#f36e21] flex-shrink-0" />}
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={isSubmitting}
                    className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-[#f36e21] hover:text-primary transition flex items-center justify-center gap-2">
                    {isSubmitting ? t('b2b.form.submitting') : t('b2b.form.submit')}
                    <ArrowRight size={18} />
                  </button>
                </form>

                {isError && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
                    <p className="text-red-400 text-sm">{t('b2b.form.error')}</p>
                  </div>
                )}
                {isSuccess && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-center font-medium text-sm">{t('b2b.form.success')}</p>
                  </motion.div>
                )}
            </div>
          </div>
        </section>

        {/* Trusted Clients — right after form */}
        <section className="w-full bg-[#1a1718] py-12 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {t('b2b.clients.title')}
              </h2>
              <p className="text-white/50 text-xs">
                {t('b2b.clients.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
              {[
                { name: 'Microsoft', logo: '/trustedby/Microsoft.png' },
                { name: 'Ernst & Young', logo: '/trustedby/Ernst & Young.png' },
                { name: 'PLL LOT', logo: '/trustedby/PLL LOT.png' },
                { name: 'POLREGIO', logo: '/trustedby/POLREGIO.png' },
                { name: 'UNIQA', logo: '/trustedby/UNIQA.png' },
                { name: 'Bolt', logo: '/trustedby/Bolt.png' },
                { name: 'Uber', logo: '/trustedby/Uber_logo_2018.png' },
                { name: 'TVN', logo: '/trustedby/TVN.png' },
                { name: 'TVP', logo: '/trustedby/TVP.png' },
                { name: 'AstraZeneca', logo: '/trustedby/Astrazeneca.png' },
                { name: 'PwC', logo: '/trustedby/PwC.png' },
                { name: 'Lenovo', logo: '/trustedby/Lenovo.png' },
              ].map((client, i) => (
                <motion.div
                  key={client.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-center p-3 bg-white rounded-xl hover:shadow-lg hover:shadow-[#f36e21]/10 transition-all h-16"
                >
                  <Image src={client.logo} alt={client.name} width={120} height={48} className="object-contain w-full h-full p-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Modernized Description Section */}
        <section className="w-full bg-[#231f20] py-20 relative overflow-hidden" ref={descriptionRef}>
          {/* Background effects */}
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f36e21]/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#f36e21]/5 rounded-full blur-[150px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              {/* Left description column */}
              <motion.div 
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                animate={isDescriptionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <span className="text-xs font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#f36e21] to-[#ff9f58] mb-3 block">
                  {t('b2b.description.title')}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  {t('b2b.description.uniqueExperiences')} <br />
                  <span className="text-[#f36e21]">{t('b2b.description.forYourTeam')}</span>
                </h2>
                
                <div className="space-y-6 text-white/80">
                  <p className="text-lg">
                    {t('b2b.description.paragraph1')}
                  </p>
                  <p className="text-lg">
                    {t('b2b.description.paragraph2')}
                  </p>
                </div>
                
                {/* Benefits list */}
                <div className="mt-8 space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isDescriptionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-white/5 to-transparent rounded-lg backdrop-blur-sm border-l-2 border-[#f36e21]"
                    >
                      <div className="flex-shrink-0 p-2 bg-[#f36e21]/20 rounded-lg text-[#f36e21]">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{benefit.title}</h3>
                        <p className="text-white/70">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* Right image/service tabs column */}
              <motion.div 
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                animate={isDescriptionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              >
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#1a1718] to-[#231f20] shadow-[0_0_25px_rgba(243,110,33,0.1)] border border-white/5">
                  {/* Tabs header */}
                  <div className="flex border-b border-white/10">
                    {serviceTypes.map((service, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`flex-1 py-4 px-2 flex flex-col items-center justify-center gap-2 transition-all ${
                          activeTab === index 
                            ? 'bg-gradient-to-b from-[#f36e21]/20 to-transparent text-[#f36e21]' 
                            : 'text-white/50 hover:text-white'
                        }`}
                      >
                        <div className={`p-2 rounded-full ${activeTab === index ? 'bg-[#f36e21]/20' : 'bg-white/5'}`}>
                          {service.icon}
                        </div>
                        <span className="text-sm font-medium">{service.title}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Tab content */}
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-[#f36e21]/20 rounded-full text-[#f36e21] mr-3">
                        {serviceTypes[activeTab].icon}
                      </div>
                      <h3 className="text-xl font-bold text-white">{serviceTypes[activeTab].title}</h3>
                    </div>
                    <p className="text-white/70 mb-6">{serviceTypes[activeTab].description}</p>
                    
                    {/* Features list */}
                    <ul className="space-y-3">
                      {Array.isArray(serviceTypes[activeTab].features) && serviceTypes[activeTab].features.map((feature, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <CheckCircle className="text-[#f36e21] w-5 h-5 flex-shrink-0" />
                          <span className="text-white/80">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    
                    {/* Subtle image overlay */}
                    <div className="mt-8 relative h-48 rounded-lg overflow-hidden">
                      <Image 
                        src={activeTab === 0 ? "/images/corporate.png" : 
                             activeTab === 1 ? "/images/party.png" : 
                             "/images/alltools.jpg"}
                        alt={serviceTypes[activeTab].title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1718] via-transparent to-transparent"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section - новая секция */}
        <section className="w-full bg-[#1a1718] py-16 relative">
          
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { value: '100%', label: t('b2b.stats.satisfiedClients') },
                { value: '130+', label: t('b2b.stats.completedEvents') },
                { value: '3500+', label: t('b2b.stats.participants') },
                { value: '2,5', label: t('b2b.stats.yearsExperience') }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center justify-center p-6 bg-[#231f20] rounded-xl border border-white/5 text-center"
                >
                  <h3 className="text-3xl md:text-4xl font-bold text-[#f36e21] mb-2">{stat.value}</h3>
                  <p className="text-white/70 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* DatePicker dark theme + autofill overrides */}
        <style>{`
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active,
          textarea:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 1000px rgba(255,255,255,0.05) inset !important;
            -webkit-text-fill-color: #fff !important;
            caret-color: #fff !important;
            transition: background-color 5000s ease-in-out 0s;
          }
          .b2b-dp .react-datepicker-wrapper { width: 100%; }
          .b2b-dp .react-datepicker { background: #1a1718; border-color: #f36e21; color: #fff; font-family: inherit; }
          .b2b-dp .react-datepicker__header { background: #23222a; border-color: #3a3840; }
          .b2b-dp .react-datepicker__current-month,
          .b2b-dp .react-datepicker__day-name { color: #ff9f58; }
          .b2b-dp .react-datepicker__day { color: #fff; }
          .b2b-dp .react-datepicker__day:hover { background: #f36e21aa; color: #fff; }
          .b2b-dp .react-datepicker__day--selected,
          .b2b-dp .react-datepicker__day--in-selecting-range,
          .b2b-dp .react-datepicker__day--in-range { background: #f36e21 !important; color: #fff !important; }
          .b2b-dp .react-datepicker__day--keyboard-selected { background: #f36e21/50; }
          .b2b-dp .react-datepicker__day--disabled { color: #555 !important; }
          .b2b-dp .react-datepicker__navigation-icon::before { border-color: #ff9f58; }
          .b2b-dp .react-datepicker__close-icon::after { background-color: #f36e21; }
          .b2b-dp .react-datepicker__triangle { display: none; }
        `}</style>
      </main>
      <Footer />
    </div>
  );
} 