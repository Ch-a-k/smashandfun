"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import BlogPostPopup from '@/components/BlogPostPopup';
import { BlogPost } from '@/types/blog';

type Props = {
  posts: BlogPost[];
};

export default function BlogListClient({ posts }: Props) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <BlogCard
                post={post}
                onClick={() => setSelectedPost(post)}
              />
            </motion.div>
          ))}
        </div>
      </main>

      <BlogPostPopup
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />

      <Footer />
    </div>
  );
}
