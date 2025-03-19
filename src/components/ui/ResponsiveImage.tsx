"use client";

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface ResponsiveImageProps extends Omit<ImageProps, 'sizes' | 'alt'> {
  sizes?: string;
  alt: string;
}

export function ResponsiveImage({ fill, sizes, alt, ...props }: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Определяем наиболее общий случай использования размеров для изображений
  const defaultSizes = fill && !sizes 
    ? '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw' 
    : sizes;

  return (
    <Image
      {...props}
      alt={alt}
      fill={fill}
      sizes={defaultSizes}
      className={`${props.className || ''} transition-all duration-200 ${
        isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      onLoad={() => setIsLoading(false)}
    />
  );
} 