import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Pattern, getRandomPattern, getPatternStyle } from '../styles/patterns';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  const [pattern, setPattern] = useState<Pattern>(getRandomPattern());

  useEffect(() => {
    const interval = setInterval(() => {
      setPattern(getRandomPattern());
    }, 500); // Меняем паттерн каждые 2.5 секунды вместо 5

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[40vh] min-h-[400px] w-full flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }} // Уменьшили duration с 20 до 5
        className="absolute inset-0"
        style={getPatternStyle(pattern)}
      />
      <div className="relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-protest uppercase text-white mb-4 tracking-wider">{title}</h1>
        {subtitle && (
          <p className="text-xl md:text-3xl text-gray-200 font-hammersmith">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
