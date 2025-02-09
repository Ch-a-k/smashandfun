'use client';

import { useLanguage } from '../i18n/LanguageProvider';
import { motion } from 'framer-motion';
import { Clock, Hammer, Star } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const services = [
  {
    id: 'hard',
    name: { pl: 'BUŁKA Z MASŁEM', en: 'PIECE OF CAKE' },
    duration: '30 min.',
    price: '199.00 zł',
    link: '#',
    difficulty: 1
  },
  {
    id: 'easy',
    name: { pl: 'ŁATWY', en: 'EASY' },
    duration: '1 godzin',
    price: '299.00 zł',
    link: '#',
    difficulty: 2
  },
  {
    id: 'medium',
    name: { pl: 'ŚREDNI', en: 'MEDIUM' },
    duration: '2 godzin',
    price: '499.00 zł',
    link: '#',
    difficulty: 3,
    isBestseller: true
  },
  {
    id: 'hard',
    name: { pl: 'TRUDNY', en: 'HARD' },
    duration: '2 godzin',
    price: '999.00 zł',
    link: '#',
    difficulty: 4
  },
  {
    id: 'groupon-hard',
    name: { pl: 'GROUPON - BUŁKA Z MASŁEM', en: 'GROUPON - PIECE OF CAKE' },
    duration: '30 min.',
    price: '0.00 zł',
    link: '#',
    isPromo: true
  },
  {
    id: 'groupon-easy',
    name: { pl: 'GROUPON - ŁATWY', en: 'GROUPON - EASY' },
    duration: '1 godzin',
    price: '0.00 zł',
    link: '#',
    isPromo: true
  },
  {
    id: 'groupon-medium',
    name: { pl: 'GROUPON - ŚREDNI', en: 'GROUPON - MEDIUM' },
    duration: '2 godzin',
    price: '0.00 zł',
    link: '#',
    isPromo: true
  },
  {
    id: 'groupon-hard',
    name: { pl: 'GROUPON - TRUDNY', en: 'GROUPON - HARD' },
    duration: '2 godzin',
    price: '0.00 zł',
    link: '#',
    isPromo: true
  },
  {
    id: 'gift-1',
    name: { pl: 'Super Prezenty - "Dawka śmiechu i demolki"', en: 'Super Gifts - "Dose of fun and demolition"' },
    duration: '30 min.',
    price: '0.00 zł',
    link: '#',
    isGift: true
  },
  {
    id: 'gift-2',
    name: { pl: 'Super Prezenty - "Totalna rozwałka!"', en: 'Super Gifts - "Total destruction!"' },
    duration: '1 godzin',
    price: '0.00 zł',
    link: '#',
    isGift: true
  },
  {
    id: 'gift-3',
    name: { pl: 'Wyjątkowy Prezent - "Śmiech i destrukcja"', en: 'Special Gift - "Laughter and destruction"' },
    duration: '30 min.',
    price: '0.00 zł',
    link: '#',
    isGift: true
  },
  {
    id: 'gift-4',
    name: { pl: 'Wyjątkowy Prezent - "Totalna rozwałka"', en: 'Special Gift - "Total demolition"' },
    duration: '1 godzin',
    price: '0.00 zł',
    link: '#',
    isGift: true
  }
];

export default function Services() {
  const { language, t } = useLanguage();

  const renderDifficulty = (level: number) => {
    return Array(4).fill(0).map((_, index) => (
      <Hammer 
        key={index}
        className={`w-4 h-4 ${index < level ? 'text-[#ff5a00]' : 'text-gray-600'}`}
      />
    ));
  };

  return (
    <main>
      <PageHeader 
        title={t('services.title')} 
        subtitle={t('services.subtitle')} 
      />
      {/* Services Grid */}
      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative group"
              >
                {(service.isPromo || service.isGift || service.isBestseller) && (
                  <div className={`absolute top-4 right-4 ${
                    service.isPromo ? 'bg-blue-500' : 
                    service.isGift ? 'bg-purple-500' :
                    'bg-[#ff5a00]'
                  } text-white px-3 py-1 rounded-full text-sm z-20`}>
                    {service.isPromo ? t('services.promo') : 
                     service.isGift ? t('services.gift') :
                     'Bestseller!'}
                  </div>
                )}
                
                <div className={`relative overflow-hidden rounded-xl border-2 min-h-[400px] ${
                  service.isPromo ? 'border-blue-500' :
                  service.isGift ? 'border-purple-500' :
                  'border-[#ff5a00]'
                }`}>
                  {/* Main Content */}
                  <div className="bg-black/80 backdrop-blur-sm p-8 relative z-10 h-full flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-4 text-[#ff5a00] group-hover:text-white transition-colors">
                        {service.name[language]}
                      </h3>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Clock className="w-5 h-5" />
                          <span>{t('services.duration')}: {service.duration}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Star className="w-5 h-5" />
                          <span>{t('services.price')}: {service.price === '0.00 zł' ? t('services.free') : service.price}</span>
                        </div>
                        
                        {service.difficulty && (
                          <div className="flex items-center space-x-2">
                            {renderDifficulty(service.difficulty)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <a
                      href={service.link}
                      className={`inline-block w-full text-center py-3 px-6 rounded-lg transition-all transform hover:scale-105 ${
                        service.isPromo ? 'bg-blue-500 hover:bg-blue-600' :
                        service.isGift ? 'bg-purple-500 hover:bg-purple-600' :
                        'bg-[#ff5a00] hover:bg-[#ff7a30]'
                      } text-white font-semibold`}
                    >
                      {t('services.book')}
                    </a>
                  </div>

                  {/* Hover Details - только для основных пакетов */}
                  {!service.isPromo && !service.isGift && (
                    <div className="absolute inset-0 bg-black/95 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 flex flex-col">
                      <div className="flex-1 overflow-y-auto p-8">
                        <h4 className="text-lg font-semibold text-[#ff5a00] mb-4">{t('services.packages.' + service.id + '.items.title')}</h4>
                        <ul className="space-y-2 mb-6">
                          {t('services.packages.' + service.id + '.items.list').map((item: string, idx: number) => (
                            <li key={idx} className="text-gray-300 flex items-center">
                              <span className="text-[#ff5a00] mr-2">•</span> {item}
                            </li>
                          ))}
                        </ul>

                        <h4 className="text-lg font-semibold text-[#ff5a00] mb-4">{t('services.packages.' + service.id + '.tools.title')}</h4>
                        <ul className="space-y-2">
                          {t('services.packages.' + service.id + '.tools.list').map((item: string, idx: number) => (
                            <li key={idx} className="text-gray-300 flex items-center">
                              <span className="text-[#ff5a00] mr-2">•</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-8 pt-0">
                        <a
                          href={service.link}
                          className={`inline-block w-full text-center py-3 px-6 rounded-lg transition-all transform hover:scale-105 ${
                            service.isPromo ? 'bg-blue-500 hover:bg-blue-600' :
                            service.isGift ? 'bg-purple-500 hover:bg-purple-600' :
                            'bg-[#ff5a00] hover:bg-[#ff7a30]'
                          } text-white font-semibold`}
                        >
                          {t('services.book')}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Items */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-zinc-800/50 rounded-xl p-8 border border-[#ff5a00]/20"
          >
            <h3 className="text-2xl font-bold text-[#ff5a00] mb-6">
              {t('services.additionalItems.title')}
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t('services.additionalItems.items').map((item: string, index: number) => (
                <li
                  key={index}
                  className="flex items-center space-x-2 text-gray-300"
                >
                  <span className="text-[#ff5a00]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-black">
        <div className="max-w-3xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#ff5a00]"
          >
            {t('faq.title')}
          </motion.h2>
          
          <div className="space-y-6">
            {[
              {
                q: { en: "What should I wear?", pl: "Co powinienem ubrać?" },
                a: { 
                  en: "Comfortable clothes and closed-toe shoes. We'll provide all necessary protective equipment.",
                  pl: "Wygodne ubranie i buty z zakrytymi palcami. Zapewniamy cały niezbędny sprzęt ochronny."
                }
              },
              {
                q: { en: "Is it safe?", pl: "Czy to jest bezpieczne?" },
                a: {
                  en: "Absolutely! Our trained staff will guide you through safety procedures and provide proper equipment.",
                  pl: "Absolutnie! Nasz przeszkolony personel przeprowadzi Cię przez procedury bezpieczeństwa i zapewni odpowiedni sprzęt."
                }
              },
              {
                q: { en: "Can I bring my own items to break?", pl: "Czy mogę przynieść własne rzeczy do zniszczenia?" },
                a: {
                  en: "For safety reasons, we provide all items for destruction. Outside items are not permitted.",
                  pl: "Ze względów bezpieczeństwa zapewniamy wszystkie przedmioty do zniszczenia. Własne przedmioty nie są dozwolone."
                }
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900/50 rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold mb-2 text-white">{faq.q[language]}</h3>
                <p className="text-gray-400">{faq.a[language]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}