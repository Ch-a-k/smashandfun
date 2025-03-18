"use client";

import { useI18n } from '@/i18n/I18nContext';
import { motion } from 'framer-motion';

const PolishFlag = () => (
  <svg width="24" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="24" rx="2" fill="white"/>
    <path d="M0 12H32V22C32 23.1046 31.1046 24 30 24H2C0.895431 24 0 23.1046 0 22V12Z" fill="#DC143C"/>
  </svg>
);

const EnglishFlag = () => (
  <svg width="24" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="24" rx="2" fill="#012169"/>
    <path d="M32 0H0V24H32V0Z" fill="#012169"/>
    <path d="M32 0V3L20 12L32 21V24H28L16 15L4 24H0V21L12 12L0 3V0H4L16 9L28 0H32Z" fill="white"/>
    <path d="M11.4286 8L0 0V2.4L9.14286 9H11.4286V8ZM20.5714 16L32 24V21.6L22.8571 15H20.5714V16Z" fill="#C8102E"/>
    <path d="M32 8.57143L19.4286 8.57143V0H12.5714V8.57143L0 8.57143V15.4286L12.5714 15.4286V24H19.4286V15.4286L32 15.4286V8.57143Z" fill="white"/>
    <path d="M32 9.71429L18.2857 9.71429V0H13.7143V9.71429L0 9.71429V14.2857L13.7143 14.2857V24H18.2857V14.2857L32 14.2857V9.71429Z" fill="#C8102E"/>
  </svg>
);

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <motion.div 
      className="flex items-center space-x-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <button
        onClick={() => setLocale('pl')}
        className={`flex items-center space-x-2 transition-all duration-200 ${
          locale === 'pl' 
            ? 'opacity-100 scale-105' 
            : 'opacity-50 hover:opacity-75'
        }`}
        aria-label="Switch to Polish"
      >
        <PolishFlag />
        <span className="text-white text-sm font-bold">PL</span>
      </button>
      <span className="text-white/30">|</span>
      <button
        onClick={() => setLocale('en')}
        className={`flex items-center space-x-2 transition-all duration-200 ${
          locale === 'en' 
            ? 'opacity-100 scale-105' 
            : 'opacity-50 hover:opacity-75'
        }`}
        aria-label="Switch to English"
      >
        <EnglishFlag />
        <span className="text-white text-sm font-bold">EN</span>
      </button>
    </motion.div>
  );
}
