"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { BlogPost } from '@/types/blog';
import { useI18n } from '@/i18n/I18nContext';

interface BlogPostCardProps {
  post: BlogPost;
  index: number;
  onPostClick: (post: BlogPost) => void;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export function BlogPostCard({ post, index, onPostClick }: BlogPostCardProps) {
  const { t } = useI18n();

  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={{
        initial: { opacity: 0 },
        animate: { opacity: 1 }
      }}
      className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
    >
      <div className="w-full md:w-1/2">
        <div 
          className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer" 
          onClick={() => onPostClick(post)}
        >
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transform hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1718] to-transparent opacity-60" />
          <div className="absolute bottom-4 left-4 text-white/70 text-sm">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            <span className="mx-2">•</span>
            <span>{post.readTime} {t('blog.readTime')}</span>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 space-y-6">
        <motion.h3 
          variants={fadeInUp}
          className="text-3xl font-bold text-white"
        >
          {post.title}
        </motion.h3>
        <motion.p 
          variants={fadeInUp}
          className="text-white/70"
        >
          {post.excerpt}
        </motion.p>
        <motion.div 
          variants={fadeInUp}
          onClick={() => onPostClick(post)}
          className="inline-flex items-center text-[#f36e21] font-medium cursor-pointer group"
        >
          {t('common.readMore')}
          <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
} 