"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import BlogCardSkeleton from '@/components/BlogCardSkeleton';

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  readTime: string;
  content: string;
};

type Props = {
  posts: BlogPost[];
};

export default function BlogListClient({ posts }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [visiblePosts, setVisiblePosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setVisiblePosts(posts);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [posts]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative w-full bg-gradient-to-b from-[#1a1718] to-[#231f20] py-32">
          {/* Decorative line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
          
          <div className="max-w-7xl mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Blog
              </h1>
              <p className="text-xl text-white/70">
                Artykuły o radzeniu sobie ze stresem i emocjami
              </p>
            </motion.div>
            
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {isLoading ? (
                // Show skeletons while loading
                Array.from({ length: 4 }).map((_, index) => (
                  <BlogCardSkeleton key={index} />
                ))
              ) : (
                // Show actual posts
                visiblePosts.map((post) => (
                  <BlogCard
                    key={post.slug}
                    {...post}
                  />
                ))
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
