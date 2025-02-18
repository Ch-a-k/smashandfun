"use client";

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

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
  post: BlogPost;
};

export default function BlogPostClient({ post }: Props) {
  // Schema.org markup for the article
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": `https://smashandfun.pl${post.image}`,
    "datePublished": post.date,
    "author": {
      "@type": "Organization",
      "name": "Smash&Fun"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Smash&Fun",
      "logo": {
        "@type": "ImageObject",
        "url": "https://smashandfun.pl/images/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://smashandfun.pl/blog/${post.slug}`
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <article className="relative w-full bg-gradient-to-b from-[#1a1718] to-[#231f20] py-32">
          {/* Decorative line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
          
          <div className="max-w-4xl mx-auto px-4">
            {/* Article Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center text-white/50 text-sm mb-6 space-x-4">
                <Link href="/blog" className="hover:text-[#f36e21] transition-colors">
                  ← Wróć do bloga
                </Link>
                <span>•</span>
                <time dateTime={post.date} className="font-medium">
                  {new Date(post.date).toLocaleDateString('pl-PL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
                <span>•</span>
                <span>{post.readTime} min czytania</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {post.title}
              </h1>
            </motion.div>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-[400px] rounded-2xl overflow-hidden mb-12"
            >
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 800px, 1200px"
                quality={95}
                priority
                className="object-cover"
              />
            </motion.div>

            {/* Article Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="prose prose-invert prose-lg max-w-none"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 relative">
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 rounded-2xl pointer-events-none" />
                
                <div className="relative text-white/70 space-y-6">
                  {post.content.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-12 text-center"
            >
              <Link
                href="/#services"
                className="inline-block px-8 py-4 bg-[#f36e21] text-white font-bold rounded-lg transform transition-all duration-200 hover:scale-105 hover:bg-[#ff7b2e]"
              >
                Zarezerwuj wizytę
              </Link>
            </motion.div>
          </div>
        </article>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </div>
  );
}
