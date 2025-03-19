"use client";

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface ResponsiveImageProps extends Omit<ImageProps, 'sizes'> {
  sizes?: string;
  alt: string;
  className?: string;
}

export function ResponsiveImage({ 
  fill, 
  sizes, 
  alt, 
  className = '', 
  ...props 
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Если используется fill, но не указан sizes, добавляем дефолтное значение
  const defaultSizes = fill && !sizes ? '100vw' : sizes;

  return (
    <Image
      {...props}
      fill={fill}
      sizes={defaultSizes}
      alt={alt}
      className={`${className} transition-all duration-200 ${
        isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      onLoadingComplete={() => setIsLoading(false)}
    />
  );
} 