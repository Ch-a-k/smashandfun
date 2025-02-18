"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const footerLinks = [
  {
    title: 'Nawigacja',
    links: [
      { name: 'ZORGANIZUJ IMPREZĘ', href: '/organizacja-imprez' },
      { name: 'BLOG', href: '/blog' },
      { name: 'FAQ', href: '/faq' },
      { name: 'KONTAKT', href: '/kontakt' },
    ]
  },
  {
    title: 'Kontakt',
    links: [
      { name: 'Tel: +48 881 281 313', href: 'tel:+48881281313' },
      { name: 'Email: info@smashandfun.pl', href: 'mailto:info@smashandfun.pl' },
      { name: 'Adres: Postępu 19/4, 02-676 Warszawa', href: 'https://maps.app.goo.gl/9cZfgssYz5ZofRPb8' },
    ]
  },
  {
    title: 'Social Media',
    links: [
      { name: 'Facebook', href: 'https://facebook.com/smashandfun' },
      { name: 'Instagram', href: 'https://instagram.com/smashandfun' },
      { name: 'TikTok', href: 'https://tiktok.com/@smashandfun' },
    ]
  }
];

const fadeInUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#1a1718] to-[#231f20]">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and description */}
          <motion.div 
            className="space-y-6"
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
              />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">
              Wyjątkowe miejsce na mapie Warszawy, gdzie możesz uwolnić swoje emocje i świetnie się bawić!
            </p>
            <div className="pt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/kontakt"
                  className="inline-block px-6 py-3 bg-[#f36e21] text-white font-bold rounded-lg 
                    transform transition-all duration-200 hover:bg-[#ff7b2e] 
                    focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:ring-opacity-50
                    shadow-lg shadow-[#f36e21]/20 hover:shadow-xl hover:shadow-[#f36e21]/30"
                >
                  REZERWACJA
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Navigation Links */}
          {footerLinks.map((section, index) => (
            <motion.div 
              key={section.title} 
              className="space-y-6"
              initial={fadeInUpAnimation.initial}
              animate={fadeInUpAnimation.animate}
              transition={{ ...fadeInUpAnimation.transition, delay: 0.2 + index * 0.1 }}
            >
              <h3 className="text-white font-bold text-lg relative inline-block">
                {section.title}
                <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-[#f36e21] to-transparent"></div>
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-[#f36e21] transition-all duration-200 
                        relative group inline-block"
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
          className="mt-16 pt-8 border-t border-white/10"
          initial={fadeInUpAnimation.initial}
          animate={fadeInUpAnimation.animate}
          transition={{ ...fadeInUpAnimation.transition, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/50 text-sm">
              {new Date().getFullYear()} Smash&Fun. Wszystkie prawa zastrzeżone.
            </p>
            <div className="flex space-x-6">
              <Link 
                href="/polityka-prywatnosci" 
                className="text-white/50 hover:text-[#f36e21] text-sm transition-all duration-200 
                  relative group inline-block"
              >
                <span className="relative z-10">Polityka Prywatności</span>
                <div className="absolute bottom-0 left-0 w-0 h-px bg-[#f36e21] 
                  transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100">
                </div>
              </Link>
              <Link 
                href="/regulamin" 
                className="text-white/50 hover:text-[#f36e21] text-sm transition-all duration-200 
                  relative group inline-block"
              >
                <span className="relative z-10">Regulamin</span>
                <div className="absolute bottom-0 left-0 w-0 h-px bg-[#f36e21] 
                  transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100">
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
