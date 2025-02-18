"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';

type BlogCardProps = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  readTime: string;
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function BlogCard({ slug, title, excerpt, image, date, readTime }: BlogCardProps) {
  return (
    <motion.article 
      variants={item}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden"
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 pointer-events-none" />
      
      <Link href={`/blog/${slug}`} className="block">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            quality={90}
            priority={slug === 'stres-w-pracy-jak-sie-go-pozbyc'}
            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1718] to-transparent opacity-60" />
        </div>
        
        <div className="p-6 relative">
          <div className="flex items-center text-white/50 text-sm mb-3 space-x-4">
            <time dateTime={date} className="font-medium">
              {new Date(date).toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            <span>•</span>
            <span>{readTime} min czytania</span>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-[#f36e21] transition-colors">
            {title}
          </h2>
          
          <p className="text-white/70 line-clamp-3">
            {excerpt}
          </p>
          
          <div className="mt-4 inline-flex items-center text-[#f36e21] font-medium">
            Czytaj więcej
            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default memo(BlogCard);
