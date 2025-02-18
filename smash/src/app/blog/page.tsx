import { Metadata } from 'next';
import { blogPosts } from '@/data/blogPosts';
import BlogListClient from './BlogListClient';

// Schema.org markup
const schemaData = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Blog Smash&Fun",
  "description": "Blog o radzeniu sobie ze stresem i emocjami w pracy i życiu codziennym",
  "url": "https://smashandfun.pl/blog",
  "publisher": {
    "@type": "Organization",
    "name": "Smash&Fun",
    "logo": {
      "@type": "ImageObject",
      "url": "https://smashandfun.pl/images/logo.png"
    }
  },
  "blogPost": blogPosts.map(post => ({
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
    }
  }))
};

export const metadata: Metadata = {
  title: 'Blog o stresie i emocjach | Smash&Fun',
  description: 'Dowiedz się, jak radzić sobie ze stresem w pracy i życiu codziennym. Praktyczne porady i skuteczne metody redukcji stresu.',
  openGraph: {
    title: 'Blog o stresie i emocjach | Smash&Fun',
    description: 'Dowiedz się, jak radzić sobie ze stresem w pracy i życiu codziennym. Praktyczne porady i skuteczne metody redukcji stresu.',
    type: 'website',
    url: 'https://smashandfun.pl/blog',
    images: [{
      url: 'https://smashandfun.pl/blog/post-1.jpg',
    }],
  },
  scripts: [
    {
      dangerouslySetInnerHTML: {
        __html: JSON.stringify(schemaData),
      },
      type: 'application/ld+json',
    },
  ],
};

export default async function BlogPage() {
  return <BlogListClient posts={blogPosts} />;
}
