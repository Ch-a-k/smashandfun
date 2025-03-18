"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { BlogPost } from '@/types/blog';
import Image from 'next/image';
import { Clock, Calendar, X } from 'lucide-react';
import { useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';

interface BlogPostPopupProps {
  post: BlogPost | null;
  onClose: () => void;
}

export default function BlogPostPopup({ post, onClose }: BlogPostPopupProps) {
  const { t } = useI18n();

  // Блокируем скролл основной страницы когда попап открыт
  useEffect(() => {
    if (post) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
    return undefined;
  }, [post]);

  if (!post) return null;

  // Форматируем дату
  const formattedDate = new Date(post.date).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-start justify-center overflow-y-auto pt-16 pb-16"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#231f20] rounded-2xl w-full max-w-4xl mx-4 relative border border-white/10 overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Декоративные элементы */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f36e21] to-transparent"></div>
          <div className="absolute -top-40 -right-40 w-[300px] h-[300px] bg-[#f36e21]/5 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-40 -left-40 w-[300px] h-[300px] bg-[#f36e21]/5 rounded-full blur-[100px]"></div>
          
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-2 transition-all duration-200 z-10"
            aria-label={t('common.close')}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Обложка статьи */}
          <div className="relative w-full h-60 sm:h-72 md:h-96">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#231f20] via-[#231f20]/60 to-transparent"></div>
            
            {/* Заголовок на обложке */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"
              >
                {post.title}
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/70 text-sm sm:text-base"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#f36e21]" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#f36e21]" />
                  <span>{post.readTime} {t('blog.readTime')}</span>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Контент статьи */}
          <div className="p-5 sm:p-6 md:p-8 relative">
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-30 pointer-events-none"></div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-white/80 prose-strong:text-white prose-headings:text-white">
                {post.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              
              {/* Кнопка призыва к действию */}
              <div className="mt-8 sm:mt-10 pt-6 border-t border-white/10">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 rounded-xl pointer-events-none"></div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                    {t('blog.ctaSection.title')}
                  </h3>
                  <p className="text-white/70 mb-4 text-sm sm:text-base">
                    {t('blog.ctaSection.subtitle')}
                  </p>
                  <a
                    href="https://smashandfun.simplybook.it/v2/#book/count/1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2 sm:px-6 sm:py-3 bg-[#f36e21] text-white font-bold rounded-lg
                      transform transition-all duration-200 hover:scale-105 hover:bg-[#ff7b2e]
                      focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:ring-opacity-50"
                  >
                    {t('blog.ctaSection.cta')}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
