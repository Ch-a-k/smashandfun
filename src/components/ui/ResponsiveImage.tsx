"use client";

import Image, { ImageProps } from 'next/image';

interface ResponsiveImageProps extends Omit<ImageProps, 'sizes'> {
  sizes?: string;
}

export function ResponsiveImage({ fill, sizes, ...props }: ResponsiveImageProps) {
  // Если используется fill, но не указан sizes, добавляем дефолтное значение
  const defaultSizes = fill && !sizes ? '100vw' : sizes;

  return (
    <Image
      {...props}
      fill={fill}
      sizes={defaultSizes}
    />
  );
} 