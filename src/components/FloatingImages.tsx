"use client";

import { useEffect, useRef } from 'react';

// Настраиваемые параметры
const CONFIG = {
  // Количество частиц каждого типа
  particleCounts: {
    small: 12,   // Маленькие частицы
    medium: 6,  // Средние частицы
    large: 3   // Большие частицы
  },
  // Скорость движения
  speed: {
    min: 0.9,   // Минимальная скорость
    max: 1.8    // Максимальная скорость
  },
  // Размеры частиц
  sizes: {
    small: 30,  // Размер маленьких частиц
    medium: 65, // Размер средних частиц
    large: 120   // Размер больших частиц
  },
  // Прозрачность
  opacity: {
    min: 0.05,  // Минимальная прозрачность
    max: 0.15   // Максимальная прозрачность
  },
  // Эффекты
  effects: {
    blur: '0.5px',                // Размытие
    blendMode: 'plus-lighter',    // Режим смешивания
    zIndex: [-1, 0, 1]            // Слои для глубины
  }
};

// Изображения для частиц
const IMAGES = [
  '/images/turn-left.png',
  '/images/6o.png',
  '/images/1.png',
  '/images/down.png',
  '/images/turn-right.png',
  '/images/3o.png',
  '/images/2o.png',
  '/images/4o.png',
  '/images/5o.png'
];

export function FloatingImages() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const imagesLoadedRef = useRef<boolean>(false);

  // Класс для частиц
  class Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    opacityStep: number;
    imageIndex: number;
    zIndex: number;

    constructor(canvasWidth: number, canvasHeight: number) {
      // Выбираем случайный размер
      const sizeCategory = Math.random() < 0.5 
        ? (Math.random() < 0.5 ? 'small' : 'medium') 
        : 'large';
      this.size = CONFIG.sizes[sizeCategory as keyof typeof CONFIG.sizes];
      
      // Позиция (полностью случайная по всей секции)
      this.x = Math.random() * canvasWidth;
      this.y = Math.random() * canvasHeight;
      
      // Скорость (случайное направление и величина)
      const speed = CONFIG.speed.min + Math.random() * (CONFIG.speed.max - CONFIG.speed.min);
      const angle = Math.random() * Math.PI * 2;
      this.speedX = Math.cos(angle) * speed;
      this.speedY = Math.sin(angle) * speed;
      
      // Вращение
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 2;
      
      // Прозрачность с плавным изменением
      this.opacity = CONFIG.opacity.min + Math.random() * (CONFIG.opacity.max - CONFIG.opacity.min);
      this.opacityStep = (Math.random() - 0.5) * 0.005;
      
      // Случайное изображение
      this.imageIndex = Math.floor(Math.random() * IMAGES.length);
      
      // Слой для эффекта глубины
      this.zIndex = CONFIG.effects.zIndex[Math.floor(Math.random() * CONFIG.effects.zIndex.length)];
    }

    update(canvasWidth: number, canvasHeight: number) {
      // Обновляем позицию
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Проверяем границы и меняем направление при необходимости
      if (this.x < -this.size) {
        this.x = canvasWidth + this.size;
      } else if (this.x > canvasWidth + this.size) {
        this.x = -this.size;
      }
      
      if (this.y < -this.size) {
        this.y = canvasHeight + this.size;
      } else if (this.y > canvasHeight + this.size) {
        this.y = -this.size;
      }
      
      // Обновляем вращение
      this.rotation += this.rotationSpeed;
      if (this.rotation > 360) this.rotation -= 360;
      if (this.rotation < 0) this.rotation += 360;
      
      // Обновляем прозрачность с плавным изменением
      this.opacity += this.opacityStep;
      if (this.opacity > CONFIG.opacity.max || this.opacity < CONFIG.opacity.min) {
        this.opacityStep = -this.opacityStep;
      }
    }

    draw(ctx: CanvasRenderingContext2D, images: HTMLImageElement[]) {
      if (!images[this.imageIndex]) return;
      
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      
      // Рисуем изображение с центром в точке (0,0)
      ctx.drawImage(
        images[this.imageIndex],
        -this.size / 2,
        -this.size / 2,
        this.size,
        this.size
      );
      
      ctx.restore();
    }
  }

  // Загрузка изображений
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = IMAGES.map((src) => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new window.Image();
          img.src = src;
          img.onload = () => resolve(img);
          return img;
        });
      });

      imagesRef.current = await Promise.all(imagePromises);
      imagesLoadedRef.current = true;
      
      // Инициализируем анимацию после загрузки изображений
      initAnimation();
    };

    loadImages();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Инициализация анимации
  const initAnimation = () => {
    if (!canvasRef.current || !containerRef.current) return;
    
    // Устанавливаем размер canvas равным размеру контейнера
    const updateCanvasSize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
      
      // Если частицы еще не созданы, создаем их
      if (particlesRef.current.length === 0) {
        const totalParticles = 
          CONFIG.particleCounts.small + 
          CONFIG.particleCounts.medium + 
          CONFIG.particleCounts.large;
          
        particlesRef.current = Array(totalParticles)
          .fill(null)
          .map(() => new Particle(rect.width, rect.height));
      }
    };
    
    updateCanvasSize();
    
    // Обработчик изменения размера
    window.addEventListener('resize', updateCanvasSize);
    
    // Функция анимации
    const animate = () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Очищаем canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Обновляем и рисуем частицы
      particlesRef.current.forEach((particle) => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx, imagesRef.current);
      });
      
      // Продолжаем анимацию
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Запускаем анимацию
    animate();
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  };

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
        style={{ 
          mixBlendMode: CONFIG.effects.blendMode as React.CSSProperties['mixBlendMode'],
          filter: `blur(${CONFIG.effects.blur})`
        }}
      />
    </div>
  );
}