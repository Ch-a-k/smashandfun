import type { Metadata } from 'next';
import { blogPosts } from '@/data/blogPosts';
import BlogPostClient from './BlogPostClient';

type BlogParams = {
  slug: string;
};

type BlogProps = {
  params: BlogParams;
};

export async function generateMetadata({ params }: BlogProps): Promise<Metadata> {
  const post = blogPosts.find(p => p.slug === params.slug);
  
  if (!post) {
    return {
      title: 'Post nie znaleziony | Blog Smash&Fun',
    };
  }

  return {
    title: `${post.title} | Blog Smash&Fun`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | Blog Smash&Fun`,
      description: post.excerpt,
      type: 'article',
      url: `https://smashandfun.pl/blog/${post.slug}`,
      images: [{
        url: `https://smashandfun.pl${post.image}`,
      }],
    },
  };
}

type Post = {
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  content: string;
};

export default function BlogPost({ params }: BlogProps) {
  const post = blogPosts.find(p => p.slug === params.slug) as Post | undefined;

  if (!post) {
    return null;
  }

  return <BlogPostClient post={post} />;
}
