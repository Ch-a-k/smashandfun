"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { blogPosts } from '@/data/blogPosts';
import type { BlogPost } from '@/types/blog';
import BlogPostPopup from '@/components/BlogPostPopup';
import { BlogHeroSection } from './components/HeroSection';
import { BlogPostCard } from './components/BlogPostCard';
import { CTASection } from './components/CTASection';

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post);
  };

  const handleClosePopup = () => {
    setSelectedPost(null);
  };

  return (
    <>
      <Header />
      <main>
        <BlogHeroSection />

        <section className="relative w-full bg-[#231f20] py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="space-y-24">
              {blogPosts.map((post, index) => (
                <BlogPostCard
                  key={post.slug}
                  post={post}
                  index={index}
                  onPostClick={handlePostClick}
                />
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />

      {selectedPost && (
        <BlogPostPopup
          post={selectedPost}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
}
