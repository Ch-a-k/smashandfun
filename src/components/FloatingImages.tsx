"use client";

import { useEffect, useRef, useCallback, useMemo } from 'react';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const particlesRef = useRef<any[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const imagesLoadedRef = useRef<boolean>(false);

  // Определяем класс частицы внутри useMemo
  const Particle = useMemo(() => {
    return class Particle {
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
        // Выбираем случайную группу размеров на основе вероятностей
        let sizeGroup: 'small' | 'medium' | 'large';
        const totalParticles = 
          CONFIG.particleCounts.small + 
          CONFIG.particleCounts.medium + 
          CONFIG.particleCounts.large;
        
        const smallProb = CONFIG.particleCounts.small / totalParticles;
        const mediumProb = CONFIG.particleCounts.medium / totalParticles;
        
        const rand = Math.random();
        if (rand < smallProb) {
          sizeGroup = 'small';
        } else if (rand < smallProb + mediumProb) {
          sizeGroup = 'medium';
        } else {
          sizeGroup = 'large';
        }
        
        // Используем размер из конфигурации
        this.size = CONFIG.sizes[sizeGroup];
        
        // Расставляем частицы равномерно по всему холсту
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        
        // Скорость зависит от размера (меньше размер - выше скорость)
        const minSize = CONFIG.sizes.small;
        const maxSize = CONFIG.sizes.large;
        const speedMultiplier = 1.5 - (this.size - minSize) / (maxSize - minSize);
        this.speedX = (Math.random() - 0.5) * (CONFIG.speed.max - CONFIG.speed.min) * speedMultiplier;
        this.speedY = (Math.random() - 0.5) * (CONFIG.speed.max - CONFIG.speed.min) * speedMultiplier;
        
        // Вращение
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        
        // Прозрачность
        this.opacity = CONFIG.opacity.min + Math.random() * (CONFIG.opacity.max - CONFIG.opacity.min);
        this.opacityStep = (Math.random() - 0.5) * 0.005;
        
        // Случайное изображение
        this.imageIndex = Math.floor(Math.random() * IMAGES.length);
        
        // Z-Index для порядка отрисовки (больше = ближе к зрителю)
        this.zIndex = CONFIG.effects.zIndex[Math.floor(Math.random() * CONFIG.effects.zIndex.length)];
      }

      update(canvasWidth: number, canvasHeight: number) {
        // Движение
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Вращение
        this.rotation += this.rotationSpeed;
        
        // Изменение прозрачности
        this.opacity += this.opacityStep;
        
        // Инвертируем направление изменения прозрачности при достижении границ
        if (this.opacity >= CONFIG.opacity.max || this.opacity <= CONFIG.opacity.min) {
          this.opacityStep = -this.opacityStep;
        }
        
        // Границы холста - перемещение на противоположную сторону
        const buffer = this.size;
        if (this.x < -buffer) this.x = canvasWidth + buffer;
        if (this.x > canvasWidth + buffer) this.x = -buffer;
        if (this.y < -buffer) this.y = canvasHeight + buffer;
        if (this.y > canvasHeight + buffer) this.y = -buffer;
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
    };
  }, []);

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Инициализация анимации с использованием useCallback
  const initAnimation = useCallback(() => {
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
  }, [Particle]);

  // Используем useEffect с нашим memoized колбэком
  useEffect(() => {
    initAnimation();
  }, [initAnimation]);

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