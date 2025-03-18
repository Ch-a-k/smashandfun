"use client";

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';
import { 
  Tv, 
  Keyboard, 
  Mouse, 
  Printer, 
  Phone, 
  Camera, 
  Wine, 
  Sofa 
} from 'lucide-react';
import { ReactElement } from 'react';

// Типы иконок для предметов
type ItemKey = 'glass' | 'keyboard' | 'tvMonitor' | 'furniture' | 'printer' | 'mouse' | 'phone' | 'goProRecording';

// Иконки для каждого типа предмета
const ITEM_ICONS: Record<ItemKey, ReactElement> = {
  'glass': <Wine className="w-4 h-4" />,
  'keyboard': <Keyboard className="w-4 h-4" />,
  'tvMonitor': <Tv className="w-4 h-4" />,
  'furniture': <Sofa className="w-4 h-4" />,
  'printer': <Printer className="w-4 h-4" />,
  'mouse': <Mouse className="w-4 h-4" />,
  'phone': <Phone className="w-4 h-4" />,
  'goProRecording': <Camera className="w-4 h-4" />
};

// Анимации
const sectionAnimation = {
  initial: { opacity: 0, y: -20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const itemAnimation = (index: number) => ({
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: index * 0.05 }
});

// Компонент заголовка секции
function SectionTitle({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <motion.div {...sectionAnimation} className="inline-block">
        <h3 className="text-2xl font-bold text-white mb-2">
          {title}
        </h3>
        <p className="text-white/70 text-sm max-w-2xl mx-auto">
          {subtitle}
        </p>
      </motion.div>
    </div>
  );
}

// Компонент элемента списка
function ExtraItem({ icon, text, index }: { icon: ReactElement, text: string, index: number }) {
  return (
    <motion.div
      {...itemAnimation(index)}
      className="flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors"
    >
      <div className="p-2 rounded-lg bg-[#f36e21]/10 text-[#f36e21]">
        {icon}
      </div>
      <span className="text-sm text-white/80">{text}</span>
    </motion.div>
  );
}

export function ExtraItemsSection() {
  const { t } = useI18n();
  
  // Получаем список предметов из локализации
  const itemKeys: ItemKey[] = [
    'glass',
    'keyboard',
    'tvMonitor',
    'furniture',
    'printer',
    'mouse',
    'phone',
    'goProRecording'
  ];

  return (
    <section className="w-full bg-[#231f20] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle 
          title={t('home.pricing.extraItems.title')} 
          subtitle={t('home.pricing.extraItems.subtitle')}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {itemKeys.map((key, index) => (
            <ExtraItem
              key={key}
              icon={ITEM_ICONS[key]}
              text={t(`home.pricing.extraItems.items.${key}`)}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 