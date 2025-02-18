'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const PolishFlag = () => (
  <svg width="24" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="24" rx="2" fill="white"/>
    <path d="M0 12H32V22C32 23.1046 31.1046 24 30 24H2C0.895431 24 0 23.1046 0 22V12Z" fill="#DC143C"/>
  </svg>
)

const EnglishFlag = () => (
  <svg width="24" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="24" rx="2" fill="#012169"/>
    <path d="M32 0H0V24H32V0Z" fill="#012169"/>
    <path d="M32 0V3L20 12L32 21V24H28L16 15L4 24H0V21L12 12L0 3V0H4L16 9L28 0H32Z" fill="white"/>
    <path d="M11.4286 8L0 0V2.4L9.14286 9H11.4286V8ZM20.5714 16L32 24V21.6L22.8571 15H20.5714V16Z" fill="#C8102E"/>
    <path d="M32 8.57143L19.4286 8.57143V0H12.5714V8.57143L0 8.57143V15.4286L12.5714 15.4286V24H19.4286V15.4286L32 15.4286V8.57143Z" fill="white"/>
    <path d="M32 9.71429L18.2857 9.71429V0H13.7143V9.71429L0 9.71429V14.2857L13.7143 14.2857V24H18.2857V14.2857L32 14.2857V9.71429Z" fill="#C8102E"/>
  </svg>
)

const Header = () => {
  const [language, setLanguage] = useState('pl')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY
      
      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true)
      } 
      // Hide header when scrolling down and not at the top
      else if (currentScrollY > 50 && currentScrollY > lastScrollY) {
        setIsVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', controlHeader)
    return () => window.removeEventListener('scroll', controlHeader)
  }, [lastScrollY])

  const navigation = [
    { name: language === 'pl' ? 'ZORGANIZUJ IMPREZĘ' : 'ORGANIZE AN EVENT', href: '/organizacja-imprez' },
    { name: 'BLOG', href: '/blog' },
    { name: language === 'pl' ? 'FAQ' : 'FAQ', href: '/faq' },
    { name: language === 'pl' ? 'KONTAKT' : 'CONTACT', href: '/kontakt' },
  ];

  return (
    <AnimatePresence>
      <motion.header
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : -100,
        }}
        transition={{ duration: 0.3 }}
        className="fixed w-full z-50"
      >
        {/* Background with subtle blur - only on scroll */}
        <motion.div 
          className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-b from-black/20 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: lastScrollY > 50 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo - with home link */}
            <div className="flex-1 md:flex-none">
              <Link href="/" className="inline-block">
                <Image
                  src="/images/logo.png"
                  alt="Smash&Fun Logo"
                  width={150}
                  height={40}
                  className="h-8 w-auto mx-auto md:mx-0 transition-transform hover:scale-105"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((link) => (
                link.href !== '/' && (
                  <Link 
                    key={link.name}
                    href={link.href}
                    className="text-white/90 hover:text-[#f36e21] transition-colors font-impact text-lg"
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </nav>

            {/* Language Switcher - moved to mobile menu on small screens */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setLanguage('pl')}
                className={`flex items-center space-x-2 ${language === 'pl' ? 'opacity-100' : 'opacity-50'} hover:opacity-100 transition-all duration-200`}
              >
                <PolishFlag />
                <span className="text-white/90 text-sm font-impact">PL</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center space-x-2 ${language === 'en' ? 'opacity-100' : 'opacity-50'} hover:opacity-100 transition-all duration-200`}
              >
                <EnglishFlag />
                <span className="text-white/90 text-sm font-impact">EN</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex-1 flex justify-end text-white/90 hover:text-[#f36e21] transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu - full screen with app-like animation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 md:hidden"
                style={{ top: '64px' }}
              >
                <nav className="flex flex-col items-center space-y-6 pt-8">
                  {navigation.map((link) => (
                    link.href !== '/' && (
                      <Link 
                        key={link.name}
                        href={link.href}
                        className="text-white/90 hover:text-[#f36e21] transition-colors font-impact text-xl"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    )
                  ))}
                  
                  {/* Language Switcher in mobile menu */}
                  <div className="flex items-center space-x-6 mt-8">
                    <button
                      onClick={() => setLanguage('pl')}
                      className={`flex items-center space-x-2 ${language === 'pl' ? 'opacity-100' : 'opacity-50'} hover:opacity-100 transition-all duration-200`}
                    >
                      <PolishFlag />
                      <span className="text-white/90 text-lg font-impact">PL</span>
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`flex items-center space-x-2 ${language === 'en' ? 'opacity-100' : 'opacity-50'} hover:opacity-100 transition-all duration-200`}
                    >
                      <EnglishFlag />
                      <span className="text-white/90 text-lg font-impact">EN</span>
                    </button>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </AnimatePresence>
  )
}

export default Header
