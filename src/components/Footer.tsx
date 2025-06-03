"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';
import InFomoFooterButton from './InFomoFooterButton';

const fadeInUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Footer() {
  const { t } = useI18n();

  const footerLinks = [
    {
      title: t('footer.navigation.title'),
      links: [
        { name: t('footer.navigation.links.organizeParty'), href: '/organizacja-imprez' },
        { name: t('footer.navigation.links.blog'), href: '/blog' },
        { name: t('footer.navigation.links.faq'), href: '/faq' },
        { name: t('footer.navigation.links.contact'), href: '/kontakt' },
      ]
    },
    {
      title: t('footer.contact.title'),
      links: [
        { name: t('footer.contact.phone'), href: 'tel:+48881281313' },
        { name: t('footer.contact.email'), href: 'mailto:hello@smashandfun.pl' },
        { name: t('footer.contact.address'), href: 'https://maps.app.goo.gl/9cZfgssYz5ZofRPb8' },
      ]
    },
    {
      title: t('footer.social.title'),
      links: [
        { name: t('footer.social.facebook'), href: 'https://facebook.com/smashandfun' },
        { name: t('footer.social.instagram'), href: 'https://instagram.com/smashandfun' },
        { name: t('footer.social.tiktok'), href: 'https://tiktok.com/@smashandfun' },
      ]
    }
  ];

  return (
    <footer className="relative bg-gradient-to-b from-[#1a1718] to-[#231f20]">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo and description */}
          <motion.div 
            className="space-y-6 col-span-1 sm:col-span-2 md:col-span-1 flex flex-col items-center sm:items-start text-center sm:text-left"
            initial={fadeInUpAnimation.initial}
            animate={fadeInUpAnimation.animate}
            transition={{ ...fadeInUpAnimation.transition, delay: 0.1 }}
          >
            <Link href="/" className="inline-block group">
              <Image
                src="/images/logo.png"
                alt="Smash&Fun Logo"
                width={150}
                height={40}
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                style={{ height: "auto" }}
              />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="pt-2 md:pt-4 w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Link 
                  href="https://smashandfun.simplybook.it/v2/#book/count/1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-[#f36e21] text-white font-bold rounded-lg 
                    transform transition-all duration-200 hover:bg-[#ff7b2e] 
                    focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:ring-opacity-50
                    shadow-lg shadow-[#f36e21]/20 hover:shadow-xl hover:shadow-[#f36e21]/30
                    text-sm md:text-base w-full sm:w-auto text-center"
                >
                  {t('footer.booking')}
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Navigation Links */}
          {footerLinks.map((section, index) => (
            <motion.div 
              key={section.title} 
              className="space-y-4 md:space-y-6 flex flex-col items-center sm:items-start text-center sm:text-left"
              initial={fadeInUpAnimation.initial}
              animate={fadeInUpAnimation.animate}
              transition={{ ...fadeInUpAnimation.transition, delay: 0.2 + index * 0.1 }}
            >
              <h3 className="text-white font-bold text-base md:text-lg relative inline-block">
                {section.title}
                <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-[#f36e21] to-transparent"></div>
              </h3>
              <ul className="space-y-2 md:space-y-4 flex flex-col items-center sm:items-start">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-[#f36e21] transition-all duration-200 
                        relative group inline-block text-sm md:text-base"
                    >
                      <span className="relative z-10">{link.name}</span>
                      <div className="absolute bottom-0 left-0 w-0 h-px bg-[#f36e21] 
                        transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100">
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom section */}
        <motion.div 
          className="mt-12 pt-8 border-t border-white/10"
          initial={fadeInUpAnimation.initial}
          animate={fadeInUpAnimation.animate}
          transition={{ ...fadeInUpAnimation.transition, delay: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-center sm:text-left">
            <p className="text-white/50 text-xs md:text-sm w-full sm:w-auto">
              {new Date().getFullYear()} {t('footer.legal.rights')}
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 items-center w-full sm:w-auto">
              <Link 
                href="/polityka-prywatnosci" 
                className="text-white/50 hover:text-[#f36e21] text-xs md:text-sm transition-all duration-200 
                  relative group inline-block"
              >
                <span className="relative z-10">{t('footer.legal.privacyPolicy')}</span>
                <div className="absolute bottom-0 left-0 w-0 h-px bg-[#f36e21] 
                  transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100">
                </div>
              </Link>
              <Link 
                href="/regulamin" 
                className="text-white/50 hover:text-[#f36e21] text-xs md:text-sm transition-all duration-200 
                  relative group inline-block"
              >
                <span className="relative z-10">{t('footer.legal.terms')}</span>
                <div className="absolute bottom-0 left-0 w-0 h-px bg-[#f36e21] 
                  transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100">
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
        {/* IN-FOMO button */}
        <InFomoFooterButton />
      </div>
    </footer>
  );
}
