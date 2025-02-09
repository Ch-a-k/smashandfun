'use client';

import { useLanguage } from '../i18n/LanguageProvider';
import Link from 'next/link';
import { Hammer } from 'lucide-react';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="fixed w-full bg-black/90 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Hammer className="h-8 w-8 text-[#ff5a00]" />
            <span className="text-white font-bold text-xl">Smash & Fun</span>
          </Link>
          
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-[#ff5a00] transition">
              {t('nav.home')}
            </Link>
            <Link href="/services" className="text-white hover:text-[#ff5a00] transition">
              {t('nav.services')}
            </Link>
            <Link href="/blog" className="text-white hover:text-[#ff5a00] transition">
              {t('nav.blog')}
            </Link>
            <Link href="/faq" className="text-white hover:text-[#ff5a00] transition">
              {t('nav.faq')}
            </Link>
            <Link href="/contact" className="text-white hover:text-[#ff5a00] transition">
              {t('nav.contact')}
            </Link>
            <button
              onClick={() => setLanguage(language === 'en' ? 'pl' : 'en')}
              className="px-3 py-1 rounded border border-[#ff5a00] text-[#ff5a00] hover:bg-[#ff5a00] hover:text-white transition"
            >
              {language.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}