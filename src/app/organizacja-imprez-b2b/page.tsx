"use client";

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useI18n } from '@/i18n/I18nContext';
import { Calendar, Users, CheckCircle, ArrowRight, Briefcase, Award, Layers } from 'lucide-react';

export default function OrganizacjaImprezB2B() {
  const { t } = useI18n();
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Refs for scroll animations
  const descriptionRef = useRef(null);
  const formRef = useRef(null);
  const isDescriptionInView = useInView(descriptionRef, { once: true, amount: 0.3 });
  const isFormInView = useInView(formRef, { once: true, amount: 0.3 });
  
  // Form validation schema using translations
  const formSchema = z.object({
    name: z.string().min(2, { message: t('b2b.form.validation.name') }),
    email: z.string().email({ message: t('b2b.form.validation.email') }),
    phone: z.string().min(9, { message: t('b2b.form.validation.phone') }),
    service: z.string().min(2, { message: t('b2b.form.validation.service') }),
    people: z.string().min(1, { message: t('b2b.form.validation.people') }),
    date: z.string().min(1, { message: t('b2b.form.validation.date') }),
    message: z.string().optional()
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
      setIsSubmitting(true);
      // Используем data для отправки формы
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({...data, subject: 'B2B Request'}),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'An error occurred while sending the message');
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      reset();
    } catch (error) {
      setIsSubmitting(false);
      setIsError(true); // Используем переменную состояния
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
        <section className="relative w-full bg-[#231f20] py-32 overflow-hidden">
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
            
            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center mt-10"
            >
              <motion.a
                href="#contact-form"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden px-8 py-4 bg-[#f36e21] text-white font-bold rounded-lg
                  transform transition-all duration-200 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="text-lg">{t('b2b.hero.cta')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* Modernized Description Section */}
        <section className="w-full bg-[#231f20] py-20 relative overflow-hidden" ref={descriptionRef}>
          {/* Background effects */}
          <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
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
          <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
          
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

        {/* Modern Contact Form Section */}
        <section className="w-full bg-[#231f20] py-20 pb-32 relative" id="contact-form" ref={formRef}>
          {/* Background elements */}
          <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21]/30 to-transparent"></div>
          <div className="absolute -top-40 right-0 w-96 h-96 bg-[#f36e21]/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isFormInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('b2b.form.title')}
              </h2>
              <p className="text-white/70 max-w-xl mx-auto">
                {t('b2b.form.subtitle')}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isFormInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="grid justify-center bg-gradient-to-b from-[#1a1718] to-[#231f20] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(243,110,33,0.1)] border border-white/5 p-8 md:p-10 relative"
            >
              {/* Success message */}
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-r from-green-500/20 to-green-500/10 border-b border-green-500/30"
                >
                  <p className="text-green-400 text-center font-medium">
                    {t('b2b.form.success')}
                  </p>
                </motion.div>
              )}
              
              <div className="w-full max-w-[900px]">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-white/90 text-sm font-medium">
                        {t('b2b.form.name.label')} <span className="text-[#f36e21]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('name')}
                          id="name"
                          type="text"
                          placeholder={t('b2b.form.name.placeholder')}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                            focus:outline-none focus:ring-2 focus:ring-[#f36e21]/50 focus:border-[#f36e21]/50 transition-all"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-400 text-xs">{errors.name.message}</p>
                      )}
                    </div>
                    
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-white/90 text-sm font-medium">
                        {t('b2b.form.email.label')} <span className="text-[#f36e21]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('email')}
                          id="email"
                          type="email"
                          placeholder={t('b2b.form.email.placeholder')}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                            focus:outline-none focus:ring-2 focus:ring-[#f36e21]/50 focus:border-[#f36e21]/50 transition-all"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-400 text-xs">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-white/90 text-sm font-medium">
                      {t('b2b.form.phone.label')} <span className="text-[#f36e21]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        {...register('phone')}
                        id="phone"
                        type="tel"
                        placeholder={t('b2b.form.phone.placeholder')}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                          focus:outline-none focus:ring-2 focus:ring-[#f36e21]/50 focus:border-[#f36e21]/50 transition-all"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-400 text-xs">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Service Field */}
                  <div className="space-y-2">
                    <label htmlFor="service" className="block text-white/90 text-sm font-medium">
                      {t('b2b.form.service.label')} <span className="text-[#f36e21]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        {...register('service')}
                        id="service"
                        type="text"
                        placeholder={t('b2b.form.service.placeholder')}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                          focus:outline-none focus:ring-2 focus:ring-[#f36e21]/50 focus:border-[#f36e21]/50 transition-all"
                      />
                    </div>
                    {errors.service && (
                      <p className="text-red-400 text-xs">{errors.service.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Number of People Field */}
                    <div className="space-y-2">
                      <label htmlFor="people" className="block text-white/90 text-sm font-medium">
                        {t('b2b.form.people.label')} <span className="text-[#f36e21]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('people')}
                          id="people"
                          type="number"
                          min="1"
                          placeholder={t('b2b.form.people.placeholder')}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                            focus:outline-none focus:ring-2 focus:ring-[#f36e21]/50 focus:border-[#f36e21]/50 transition-all"
                        />
                      </div>
                      {errors.people && (
                        <p className="text-red-400 text-xs">{errors.people.message}</p>
                      )}
                    </div>
                    
                    {/* Date Field */}
                    <div className="space-y-2">
                      <label htmlFor="date" className="block text-white/90 text-sm font-medium">
                        {t('b2b.form.date.label')} <span className="text-[#f36e21]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('date')}
                          id="date"
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          pattern="\d{2}.\d{2}.\d{4}"
                          onBlur={(e) => {
                            const date = new Date(e.target.value);
                            if (date) {
                              e.target.value = date.toLocaleDateString('pl', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              });
                            }
                          }}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                            focus:outline-none focus:ring-2 focus:ring-[#f36e21]/50 focus:border-[#f36e21]/50 transition-all"
                        />
                      </div>
                      {errors.date && (
                        <p className="text-red-400 text-xs">{errors.date.message}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Message Field */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-white/90 text-sm font-medium">
                      {t('b2b.form.message.label')}
                    </label>
                    <div className="relative">
                      <textarea
                        {...register('message')}
                        id="message"
                        rows={4}
                        placeholder={t('b2b.form.message.placeholder')}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                          focus:outline-none focus:ring-2 focus:ring-[#f36e21]/50 focus:border-[#f36e21]/50 transition-all resize-none"
                      ></textarea>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-[#f36e21] hover:text-primary transition flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? t('b2b.form.submitting') : t('b2b.form.submit')}
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </form>
                
                {isError && (
                  <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
                    <p className="text-red-400">
                      {t('b2b.form.error')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 