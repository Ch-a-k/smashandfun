'use client';

import { useLanguage } from '../../i18n/LanguageProvider';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '../../components/PageHeader';

export default function StressAtWork() {
  const { t } = useLanguage();

  return (
    <main>
      <PageHeader 
        title={t('blog.stressAtWork.title')} 
        subtitle={t('blog.stressAtWork.subtitle')} 
      />

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black"></div>
          <motion.div
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/images/hero-bg.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.3)'
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <Link
            href="/blog"
            className="inline-flex items-center text-[#ff5a00] hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>{t('blog.backToBlog')}</span>
          </Link>

          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-bold mb-8 text-[#ff5a00]"
          >
            {t('blog.stressAtWork.title')}
          </motion.h1>

          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>2024-02-09</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>5 min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-20 bg-zinc-900/50">
        <article className="prose prose-invert prose-orange max-w-3xl mx-auto px-4">
          <div className="aspect-video relative overflow-hidden rounded-xl mb-12">
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
              alt="Stressed person at work"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6 text-gray-300">
            {t('blog.stressAtWork.content').split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-[#ff5a00]/20">
            <Link
              href="/services"
              className="inline-block bg-[#ff5a00] text-white px-8 py-4 rounded-full text-xl hover:bg-[#ff7a30] transition-all transform hover:scale-110"
            >
              {t('hero.cta')}
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
