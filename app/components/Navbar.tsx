'use client';

import { useLanguage } from '../i18n/LanguageProvider';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FlagIcon from './FlagIcon';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 200],
    ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.6)']
  );
  const backdropBlur = useTransform(
    scrollY,
    [0, 200],
    ['blur(0px)', 'blur(8px)']
  );
  const navHeight = useTransform(
    scrollY,
    [0, 200],
    ['8rem', '5rem']
  );
  const logoHeight = useTransform(
    scrollY,
    [0, 200],
    ['3.5rem', '2rem']
  );
  const fontSize = useTransform(
    scrollY,
    [0, 200],
    ['1.25rem', '1rem']
  );

  return (
    <motion.nav
      className="fixed w-full z-50"
      style={{
        backgroundColor,
        backdropFilter: backdropBlur,
        height: navHeight
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <motion.div className="flex items-center justify-between h-full">
          <Link href="/" className="flex items-center">
            <motion.div style={{ height: logoHeight }}>
              <Image
                src="/images/logo.png"
                alt="Smash & Fun Logo"
                width={420}
                height={120}
                className="h-full w-auto"
                priority
              />
            </motion.div>
          </Link>
          
          <motion.div className="flex items-center space-x-8" style={{ fontSize }}>
            <Link href="/" className="text-white hover:text-[#ff5a00] transition font-protest uppercase">
              {t('nav.home')}
            </Link>
            <Link href="/services" className="text-white hover:text-[#ff5a00] transition font-protest uppercase">
              {t('nav.services')}
            </Link>
            <Link href="/blog" className="text-white hover:text-[#ff5a00] transition font-protest uppercase">
              {t('nav.blog')}
            </Link>
            <Link href="/faq" className="text-white hover:text-[#ff5a00] transition font-protest uppercase">
              {t('nav.faq')}
            </Link>
            <Link href="/contact" className="text-white hover:text-[#ff5a00] transition font-protest uppercase">
              {t('nav.contact')}
            </Link>
            <button
              onClick={() => setLanguage(language === 'en' ? 'pl' : 'en')}
              className="px-3 py-1 rounded border border-[#ff5a00] text-[#ff5a00] hover:bg-[#ff5a00] hover:text-white transition font-protest uppercase flex items-center gap-2"
            >
              <FlagIcon country={language === 'en' ? 'us' : 'pl'} />
              {language.toUpperCase()}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.nav>
  );
}