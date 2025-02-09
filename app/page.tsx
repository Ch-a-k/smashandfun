'use client';

import { useLanguage } from './i18n/LanguageProvider';
import { motion } from 'framer-motion';
import { Hammer, Shield, Clock, Star, Users, Camera } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ReviewsSection from './components/ReviewsSection';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: { en: string; pl: string };
  date: string;
  avatar: string;
}

const initialReviews: Review[] = [
  {
    id: '1',
    author: 'Anna Kowalska',
    rating: 5,
    text: {
      en: 'Amazing experience! Great way to release stress. The staff was very professional and helpful.',
      pl: 'Niesamowite doświadczenie! Świetny sposób na odstresowanie. Personel był bardzo profesjonalny i pomocny.'
    },
    date: '2024-02-10',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: '2',
    author: 'Piotr Nowak',
    rating: 5,
    text: {
      en: 'Perfect place for team building. We had so much fun destroying things together!',
      pl: 'Idealne miejsce na team building. Świetnie się bawiliśmy niszcząc rzeczy razem!'
    },
    date: '2024-02-08',
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: '3',
    author: 'Maria Wiśniewska',
    rating: 5,
    text: {
      en: 'Best stress relief ever! Will definitely come back again.',
      pl: 'Najlepsze odstresowanie! Na pewno wrócę ponownie.'
    },
    date: '2024-02-05',
    avatar: 'https://i.pravatar.cc/150?img=3'
  },
  {
    id: '4',
    author: 'Tomasz Kaczmarek',
    rating: 5,
    text: {
      en: 'Incredible way to spend an evening! The adrenaline rush is amazing.',
      pl: 'Niesamowity sposób na spędzenie wieczoru! Zastrzyk adrenaliny jest niesamowity.'
    },
    date: '2024-02-03',
    avatar: 'https://i.pravatar.cc/150?img=4'
  },
  {
    id: '5',
    author: 'Karolina Lewandowska',
    rating: 5,
    text: {
      en: 'Had my birthday party here. Everyone loved it! Unique experience.',
      pl: 'Miałam tu urodziny. Wszyscy byli zachwyceni! Wyjątkowe doświadczenie.'
    },
    date: '2024-02-01',
    avatar: 'https://i.pravatar.cc/150?img=5'
  },
  {
    id: '6',
    author: 'Michał Wójcik',
    rating: 5,
    text: {
      en: 'Great service and safety measures. Felt secure while having tons of fun!',
      pl: 'Świetna obsługa i środki bezpieczeństwa. Czułem się bezpiecznie, świetnie się bawiąc!'
    },
    date: '2024-01-30',
    avatar: 'https://i.pravatar.cc/150?img=6'
  },
  {
    id: '7',
    author: 'Agnieszka Dąbrowska',
    rating: 5,
    text: {
      en: 'Perfect after a stressful week at work. Therapeutic and fun!',
      pl: 'Idealne po stresującym tygodniu w pracy. Terapeutyczne i zabawne!'
    },
    date: '2024-01-28',
    avatar: 'https://i.pravatar.cc/150?img=7'
  },
  {
    id: '8',
    author: 'Krzysztof Zieliński',
    rating: 5,
    text: {
      en: 'Brought my team here for team building. Best decision ever!',
      pl: 'Przyprowadziłem tu swój zespół na team building. Najlepsza decyzja!'
    },
    date: '2024-01-25',
    avatar: 'https://i.pravatar.cc/150?img=8'
  },
  {
    id: '9',
    author: 'Magdalena Szymańska',
    rating: 5,
    text: {
      en: 'Such a unique concept! Love the variety of items to destroy.',
      pl: 'Taki unikalny koncept! Uwielbiam różnorodność rzeczy do zniszczenia.'
    },
    date: '2024-01-23',
    avatar: 'https://i.pravatar.cc/150?img=9'
  },
  {
    id: '10',
    author: 'Bartosz Jankowski',
    rating: 5,
    text: {
      en: 'Professional staff, great atmosphere. Will recommend to friends!',
      pl: 'Profesjonalna obsługa, świetna atmosfera. Polecę znajomym!'
    },
    date: '2024-01-20',
    avatar: 'https://i.pravatar.cc/150?img=10'
  },
  {
    id: '11',
    author: 'Aleksandra Kamińska',
    rating: 5,
    text: {
      en: 'Perfect date night activity! Something different and exciting.',
      pl: 'Idealna aktywność na randkę! Coś innego i ekscytującego.'
    },
    date: '2024-01-18',
    avatar: 'https://i.pravatar.cc/150?img=11'
  },
  {
    id: '12',
    author: 'Marcin Pawlak',
    rating: 5,
    text: {
      en: 'Great place to let off steam. The music selection was perfect!',
      pl: 'Świetne miejsce na wyładowanie emocji. Wybór muzyki był idealny!'
    },
    date: '2024-01-15',
    avatar: 'https://i.pravatar.cc/150?img=12'
  }
];

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showHappyHours, setShowHappyHours] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  return (
    <div className="overflow-hidden">
      {/* Happy Hours Popup */}
      {showHappyHours && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 p-8 rounded-2xl border-2 border-[#ff5a00] max-w-md mx-4 relative"
          >
            <button
              onClick={() => setShowHappyHours(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'pl' : 'en')}
                className="px-3 py-1 rounded border border-[#ff5a00] text-[#ff5a00] hover:bg-[#ff5a00] hover:text-white transition"
              >
                {language === 'en' ? 'PL' : 'EN'}
              </button>
            </div>
            
            <h3 className="text-3xl font-bold text-[#ff5a00] mb-4">{t('happyHours.title')}</h3>
            <p className="text-xl text-white mb-6">{t('happyHours.schedule')}</p>
            <ul className="space-y-4 mb-6">
              {t('happyHours.discounts').map((discount: string, index: number) => (
                <li key={index} className="flex items-center text-gray-300">
                  <span className="text-[#ff5a00] mr-2">•</span> {discount}
                </li>
              ))}
            </ul>
            <p className="text-lg text-[#ff5a00] font-semibold mb-6">{t('happyHours.cta')}</p>
            
            <div className="flex space-x-4">
             
              <Link
                href="/services"
                className="flex-1 px-6 py-3 bg-[#ff5a00] text-white rounded-full hover:bg-[#ff7a30] transition-all text-center"
                onClick={() => setShowHappyHours(false)}
              >
                {t('common.viewServices')}
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1 }}
            className="mb-8 transform scale-150"
          >
            <Hammer className="w-96 h-96 text-[#ff5a00] mx-auto mb-6" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold mb-6 text-white"
          >
            <span className="text-[#ff5a00]">{t('hero.title')}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-3xl mb-12 text-gray-300"
          >
            {t('hero.subtitle')}
          </motion.p>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-x-6"
          >
            <Link 
              href="/services"
              className="bg-[#ff5a00] text-white px-8 py-4 rounded-full text-xl hover:bg-[#ff7a30] transition-all transform hover:scale-110 inline-flex items-center space-x-2"
            >
              <Hammer className="w-6 h-6" />
              <span>{t('hero.cta')}</span>
            </Link>
            
            <Link 
              href="/contact"
              className="border-2 border-[#ff5a00] text-[#ff5a00] px-8 py-4 rounded-full text-xl hover:bg-[#ff5a00] hover:text-white transition-all transform hover:scale-110 inline-flex items-center space-x-2"
            >
              <Users className="w-6 h-6" />
              <span>{t('nav.contact')}</span>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-8 h-12 border-2 border-[#ff5a00] rounded-full flex justify-center">
            <div className="w-2 h-2 bg-[#ff5a00] rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Section with Hover Effects */}
      <section className="py-20 bg-zinc-900 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#ff5a00]"
          >
            {t('features.title')}
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Shield,
                title: { en: "Safe Environment", pl: "Bezpieczne Środowisko" },
                description: { 
                  en: "Professional safety equipment and trained staff",
                  pl: "Profesjonalny sprzęt ochronny i przeszkolony personel"
                }
              },
              {
                icon: Clock,
                title: { en: "Flexible Sessions", pl: "Elastyczne Sesje" },
                description: {
                  en: "30 minutes to 2 hours of pure destruction",
                  pl: "30 minut do 2 godzin czystej destrukcji"
                }
              },
              {
                icon: Camera,
                title: { en: "Photo Sessions", pl: "Sesje Zdjęciowe" },
                description: {
                  en: "Capture your epic moments of demolition",
                  pl: "Uwiecznij swoje epickie momenty destrukcji"
                }
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-8 border border-[#ff5a00]/20 hover:border-[#ff5a00] transition-all duration-300">
                  <div className="w-16 h-16 mb-6 bg-[#ff5a00] rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-all duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[#ff5a00] transition-colors">
                    {feature.title[language]}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {feature.description[language]}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection />

      {/* Partners Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#ff5a00]"
          >
            {t('partners.title')}
          </motion.h2>
          <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="aspect-[3/2] bg-zinc-900 rounded-lg overflow-hidden"
            >
              <img
                src="/images/partner1.png"
                alt="Partner 1"
                className="w-full h-full object-contain p-4 transform hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="aspect-[3/2] bg-zinc-900 rounded-lg overflow-hidden"
            >
              <img
                src="/images/partner2.png"
                alt="Partner 2"
                className="w-full h-full object-contain p-4 transform hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-black relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { 
                number: "5000+",
                label: { en: "Happy Customers", pl: "Zadowolonych Klientów" }
              },
              { 
                number: "4",
                label: { en: "Unique Rooms", pl: "Unikalne Pokoje" }
              },
              { 
                number: "99%",
                label: { en: "Satisfaction Rate", pl: "Wskaźnik Zadowolenia" }
              },
              { 
                number: "24/7",
                label: { en: "Support", pl: "Wsparcie" }
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-4xl md:text-5xl font-bold text-[#ff5a00] mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-400">{stat.label[language]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#ff5a00]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-white/90 mb-12">
              {t('cta.subtitle')}
            </p>
            <Link
              href="/services"
              className="bg-black text-white px-12 py-4 rounded-full text-xl hover:bg-zinc-800 transition-all transform hover:scale-110 inline-flex items-center space-x-2"
            >
              <Star className="w-6 h-6" />
              <span>{t('cta.button')}</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Social Media Links */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 space-y-4 z-20">
        <h3 className="text-[#ff5a00] text-sm font-semibold text-center mb-2">{t('social.followUs')}</h3>
        <a
          href="https://www.facebook.com/p/smashandfun-100090772427682/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-[#ff5a00] rounded-full flex items-center justify-center hover:bg-[#ff7a30] transition-all transform hover:scale-110"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
          </svg>
        </a>
        <a
          href="https://www.instagram.com/smashandfun/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-[#ff5a00] rounded-full flex items-center justify-center hover:bg-[#ff7a30] transition-all transform hover:scale-110"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266-.058-1.644-.07-4.85-.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
        <a
          href="https://www.tiktok.com/@smashandfun"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-[#ff5a00] rounded-full flex items-center justify-center hover:bg-[#ff7a30] transition-all transform hover:scale-110"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}