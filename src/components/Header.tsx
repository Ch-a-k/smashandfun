"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';
import { Clock } from 'lucide-react';
import HappyHoursModal from './HappyHoursModal';

// Функция для установки куки
const setCookie = (name: string, value: string, days: number) => {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
};

// Функция для получения значения куки
const getCookie = (name: string) => {
  const cookieName = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let c = cookieArray[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(cookieName) === 0) {
      return c.substring(cookieName.length, c.length);
    }
  }
  return "";
};

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHappyHoursOpen, setIsHappyHoursOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useI18n();

  // Автоматическое открытие Happy Hours при загрузке страницы
  useEffect(() => {
    // Проверяем, когда модальное окно было закрыто последний раз (из куки)
    const lastClosedTime = getCookie('happyHoursLastClosed');
    const shouldShowModal = !lastClosedTime || (Date.now() - parseInt(lastClosedTime)) > 24 * 60 * 60 * 1000;
    
    // Если прошло более 24 часов или пользователь еще не закрывал модальное окно
    if (shouldShowModal) {
      // Задержка для обеспечения корректной загрузки страницы
      const timer = setTimeout(() => {
        setIsHappyHoursOpen(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Добавляем диагностику для отслеживания состояния модального окна
  useEffect(() => {
    // Эффект для отслеживания изменений состояния модального окна
  }, [isHappyHoursOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } 
      // Hide header when scrolling down and not at top
      else if (currentScrollY > 50 && currentScrollY > lastScrollY) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Control body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/organizacja-imprez', label: t('nav.organizeParty') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/faq', label: t('nav.faq') },
    { href: '/kontakt', label: t('nav.contact') },
  ];

  const scrollToServices = () => {
    window.open('https://smashandfun.simplybook.it/v2/#book/count/1/', '_blank');
    setIsMobileMenuOpen(false);
  };

  const openHappyHours = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHappyHoursOpen(prev => {
      return !prev;
    });
    setIsMobileMenuOpen(false);
  };

  // Функция закрытия модального окна с сохранением времени в куки
  const closeHappyHours = () => {
    try {
      // Сохраняем текущее время закрытия в куки (срок действия 30 дней, но проверка через 24 часа)
      const timestamp = Date.now().toString();
      setCookie('happyHoursLastClosed', timestamp, 30);
      setIsHappyHoursOpen(false);
    } catch {
      setIsHappyHoursOpen(false);
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-[110] transition-all duration-300 ${
          !isVisible ? 'translate-y-[-100%]' : 'translate-y-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-10">
            <Image
              src="/images/logo.png"
              alt="Smash&Fun Logo"
              width={50}
              height={40}
              className="h-10 w-auto"
              style={{ height: "auto" }}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={` text-lg font-impact uppercase tracking-wide transition-colors ${
                  pathname === link.href
                    ? 'text-[#f36e21]'
                    : 'text-white hover:text-[#f36e21]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            
            
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {/* Happy Hours Button */}
            <button
              onClick={openHappyHours}
              className="p-2 rounded-lg bg-[#f36e21]/10 text-[#f36e21] hover:bg-[#f36e21]/20 transition-colors"
              aria-label="Happy Hours"
            >
              <Clock className="w-5 h-5" />
            </button>
            <button
              onClick={scrollToServices}
              className="hidden md:block bg-[#f36e21] text-white px-4 py-2 rounded-lg font-impact uppercase tracking-wide hover:bg-[#f36e21]/90 transition-colors"
            >
              {t('common.bookNow')}
            </button>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative z-10 md:hidden p-2"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span
                  className={`w-full h-0.5 bg-current transform transition-all duration-200 origin-left ${
                    isMobileMenuOpen ? 'rotate-45 translate-x-px' : ''
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-current transition-all duration-200 ${
                    isMobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-current transform transition-all duration-200 origin-left ${
                    isMobileMenuOpen ? '-rotate-45 translate-x-px' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu - Outside of header */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-[90]"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto"
            >
              <nav className="w-full min-h-screen px-6 py-36">
                <div className="flex flex-col items-center space-y-5">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-lg font-impact uppercase tracking-wide transition-colors ${
                          pathname === link.href
                            ? 'text-[#f36e21]'
                            : 'text-white hover:text-[#f36e21]'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="pt-4"
                  >
                    <button
                      onClick={scrollToServices}
                      className="bg-[#f36e21] text-white px-6 py-2.5 rounded-lg font-impact uppercase tracking-wide hover:bg-[#f36e21]/90 transition-colors text-lg"
                    >
                      {t('common.bookNow')}
                    </button>
                  </motion.div>

                  {/* Happy Hours Button */}
                  <button
                    onClick={openHappyHours}
                    className="p-3 rounded-full bg-[#f36e21]/10 text-[#f36e21]"
                    aria-label="Happy Hours"
                  >
                    <Clock className="w-6 h-6" />
                  </button>

                  <LanguageSwitcher />
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Happy Hours Modal */}
      <HappyHoursModal
        isOpen={isHappyHoursOpen}
        onClose={closeHappyHours}
      />
    </>
  );
}
