"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';
import { Clock, ChevronDown, Phone } from 'lucide-react';
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    {
      label: t('nav.organizeParty'),
      dropdown: [
        { href: '/organizacja-imprez', label: t('nav.b2c') },
        { href: '/organizacja-imprez-b2b', label: t('nav.b2b') },
        { href: '/vouchery', label: t('nav.vouchers') },
      ]
    },
    { href: '/blog', label: t('nav.blog') },
    { href: '/faq', label: t('nav.faq') },
    { href: '/kontakt', label: t('nav.contact') },
  ];

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
            {navLinks.map((link, index) => (
              <div
                key={link.href || index}
                className="relative"
                onMouseEnter={() => {
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current);
                  }
                  if (link.dropdown) {
                    setActiveDropdown(index.toString());
                  }
                }}
                onMouseLeave={() => {
                  if (link.dropdown) {
                    closeTimeoutRef.current = setTimeout(() => {
                      setActiveDropdown(null);
                    }, 150);
                  }
                }}
              >
                {link.href ? (
                  <Link
                    href={link.href}
                    className={`text-lg font-impact uppercase tracking-wide transition-colors ${
                      pathname === link.href
                        ? 'text-[#f36e21]'
                        : 'text-white hover:text-[#f36e21]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    className={`text-lg font-impact uppercase tracking-wide transition-colors text-white hover:text-[#f36e21] cursor-pointer flex items-center gap-1`}
                  >
                    {link.label}
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === index.toString() ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}
                
                {/* Dropdown Menu */}
                {link.dropdown && activeDropdown === index.toString() && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-64 bg-[#1a1718] rounded-lg shadow-lg overflow-hidden border border-white/10"
                    onMouseEnter={() => {
                      if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                      }
                    }}
                    onMouseLeave={() => {
                      closeTimeoutRef.current = setTimeout(() => {
                        setActiveDropdown(null);
                      }, 150);
                    }}
                  >
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-3 text-white hover:bg-[#f36e21]/10 hover:text-[#f36e21] transition-colors text-lg font-impact uppercase tracking-wide"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Телефон */}
            <a
              href="tel:+48881281313"
              className="flex items-center gap-2 text-white hover:text-[#f36e21] transition-colors"
              aria-label="Позвонить по номеру +48 881 281 313"
            >
              <Phone className="w-5 h-5 text-[#f36e21]" />
              <span className="hidden sm:inline font-impact tracking-wide">+48 881 281 313</span>
            </a>
            
            <LanguageSwitcher />
            {/* Happy Hours Button */}
            <button
              onClick={openHappyHours}
              className="p-2 rounded-lg bg-[#f36e21]/10 text-[#f36e21] hover:bg-[#f36e21]/20 transition-colors"
              aria-label="Happy Hours"
            >
              <Clock className="w-5 h-5" />
            </button>
            <Link
              href="/rezerwacja"
              className="hidden md:block bg-[#f36e21] text-white px-4 py-2 rounded-lg font-impact uppercase tracking-wide hover:bg-[#f36e21]/90 transition-colors"
            >
              {t('common.bookNow')}
            </Link>
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
                      key={link.href || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-full"
                    >
                      {link.dropdown ? (
                        <div className="space-y-3">
                          <div className="text-lg font-impact uppercase tracking-wide text-white/50 text-center">
                            {link.label}
                          </div>
                          <div className="space-y-2">
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block text-center text-lg font-impact uppercase tracking-wide transition-colors ${
                                  pathname === item.href
                                    ? 'text-[#f36e21]'
                                    : 'text-white hover:text-[#f36e21]'
                                }`}
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={link.href!}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block text-center text-lg font-impact uppercase tracking-wide transition-colors ${
                            pathname === link.href
                              ? 'text-[#f36e21]'
                              : 'text-white hover:text-[#f36e21]'
                          }`}
                        >
                          {link.label}
                        </Link>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* Телефон в мобильном меню */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <a
                      href="tel:+48881281313"
                      className="flex items-center justify-center gap-2 text-white hover:text-[#f36e21] transition-colors py-2"
                    >
                      <Phone className="w-5 h-5 text-[#f36e21]" />
                      <span className="font-impact tracking-wide">+48 881 281 313</span>
                    </a>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="pt-4"
                  >
                    <Link
                      href="/rezerwacja"
                      className="bg-[#f36e21] text-white px-6 py-2.5 rounded-lg font-impact uppercase tracking-wide hover:bg-[#f36e21]/90 transition-colors text-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('common.bookNow')}
                    </Link>
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
