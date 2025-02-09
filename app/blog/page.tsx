'use client';

import { useLanguage } from '../i18n/LanguageProvider';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function Blog() {
  const { t } = useLanguage();

  return (
    <main>
      <PageHeader 
        title={t('blog.title')} 
        subtitle={t('blog.subtitle')} 
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

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-7xl font-bold text-center mb-8 text-[#ff5a00]"
          >
            {t('blog.title')}
          </motion.h1>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Stress at Work Article */}
            <motion.article
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-black/80 backdrop-blur-sm border-2 border-[#ff5a00] rounded-xl overflow-hidden"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                  alt="Stressed person at work"
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>2024-02-09</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>5 min read</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-[#ff5a00]">
                  {t('blog.stressAtWork.title')}
                </h2>
                <p className="text-gray-300 mb-6">
                  {t('blog.stressAtWork.excerpt')}
                </p>
                <Link
                  href="/blog/stress-at-work"
                  className="inline-flex items-center text-[#ff5a00] hover:text-white transition-colors"
                >
                  <span className="mr-2">{t('blog.readMore')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.article>

            {/* More blog posts will be added here */}
          </div>
        </div>
      </section>
    </main>
  );
}
