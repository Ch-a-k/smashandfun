"use client";

import { motion } from 'framer-motion';
import { ResponsiveImage } from './ui/ResponsiveImage';
import { BlogPost } from '@/types/blog';
import { useI18n } from '@/i18n/I18nContext';

interface BlogCardProps {
  post: BlogPost;
  onClick: () => void;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function BlogCard({ post, onClick }: BlogCardProps) {
  const { t } = useI18n();

  return (
    <motion.article 
      variants={item}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 pointer-events-none" />
      
      <div className="relative h-64 overflow-hidden">
        <ResponsiveImage
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          quality={90}
          priority={post.slug === 'stres-w-pracy-jak-sie-go-pozbyc'}
          className="object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1718] to-transparent opacity-60" />
      </div>
      
      <div className="p-6 relative">
        <div className="flex items-center text-white/50 text-sm mb-3 space-x-4">
          <time dateTime={post.date} className="font-medium">
            {new Date(post.date).toLocaleDateString('pl-PL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <span>•</span>
          <span>{post.readTime} {t('blog.readTime')}</span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-[#f36e21] transition-colors">
          {post.title}
        </h2>
        
        <p className="text-white/70 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="mt-4 inline-flex items-center text-[#f36e21] font-medium">
          {t('common.readMore')}
          <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </motion.article>
  );
}

export default BlogCard;
