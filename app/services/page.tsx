'use client';

import { useLanguage } from '../i18n/LanguageProvider';
import { motion } from 'framer-motion';
import { Clock, Hammer, DollarSign } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const services = [
  {
    id: 'hard',
    name: { pl: 'BUŁKA Z MASŁEM', en: 'PIECE OF CAKE' },
    duration: '30 min.',
    price: '199.00 zł',
    link: 'https://smashandfun.simplybook.it/v2/#book/service/2/count/1/',
    difficulty: 1
  },
  {
    id: 'easy',
    name: { pl: 'ŁATWY', en: 'EASY' },
    duration: '1 godzin',
    price: '299.00 zł',
    link: 'https://smashandfun.simplybook.it/v2/#book/service/3/count/1/',
    difficulty: 2
  },
  {
    id: 'medium',
    name: { pl: 'ŚREDNI', en: 'MEDIUM' },
    duration: '2 godzin',
    price: '499.00 zł',
    link: 'https://smashandfun.simplybook.it/v2/#book/service/4/count/1/',
    difficulty: 3,
    isBestseller: true
  },
  {
    id: 'hard',
    name: { pl: 'TRUDNY', en: 'HARD' },
    duration: '2 godzin',
    price: '999.00 zł',
    link: 'https://smashandfun.simplybook.it/v2/#book/service/5/count/1/',
    difficulty: 4
  },
  {
    id: 'groupon-hard',
    name: { pl: 'GROUPON - BUŁKA Z MASŁEM', en: 'GROUPON - PIECE OF CAKE' },
    duration: '30 min.',
    price: '0.00 zł',
    link: 'https://smashandfun.simplybook.it/v2/#book/service/6/count/1/',
    isPromo: true
  },
  {
    id: 'groupon-easy',
    name: { pl: 'GROUPON - ŁATWY', en: 'GROUPON - EASY' },
    duration: '1 godzin',
    price: '0.00 zł',
    link: 'https://smashandfun.simplybook.it/v2/#book/service/8/count/1/',
    isPromo: true
  },
  {
    id: 'groupon-medium',
    name: { pl: 'GROUPON - ŚREDNI', en: 'GROUPON - MEDIUM' },
    duration: '2 godzin',
    price: '0.00 zł',
    link: 'https://smashandfun.simplybook.it/v2/#book/service/7/count/1/',
    isPromo: true
  },
  {
    id: 'groupon-hard',
    name: { pl: 'GROUPON - TRUDNY', en: 'GROUPON - HARD' },
    duration: '2 godzin',
    price: '0.00 zł',
    link: 'https://smashandfun.simplybook.it/v2/#book/count/1/',
    isPromo: true
  },
  {
    id: 'gift-1',
    name: { pl: 'Super Prezenty - "Dawka śmiechu i demolki"', en: 'Super Gifts - "Dose of fun and demolition"' },
    duration: '30 min.',
    price: '0.00 zł',
    link: 'https://smashandfun.simplybook.it/v2/#book/service/9/count/1/',
    isGift: true
  },
  {
    id: 'gift-2',
    name: { pl: 'Super Prezenty - "Totalna rozwałka!"', en: 'Super Gifts - "Total destruction!"' },
    duration: '1 godzin',
    price: '0.00 zł',
    link: 'https://smashandfun.simplybook.it/v2/#book/service/10/count/1/',
    isGift: true
  },
  {
    id: 'gift-3',
    name: { pl: 'Wyjątkowy Prezent - "Śmiech i destrukcja"', en: 'Special Gift - "Laughter and destruction"' },
    duration: '30 min.',
    price: '0.00 zł',
    link: 'https://smashandfun.simplybook.it/v2/#book/service/11/count/1/',
    isGift: true
  },
  {
    id: 'gift-4',
    name: { pl: 'Wyjątkowy Prezent - "Totalna rozwałka"', en: 'Special Gift - "Total demolition"' },
    duration: '1 godzin',
    price: '0.00 zł',
    link: 'https://smashandfun.simplybook.it/v2/#book/service/12/count/1/',
    isGift: true
  }
];

const mainServices = services.filter(s => !s.isPromo && !s.isGift);
const promoServices = services.filter(s => s.isPromo);
const giftServices = services.filter(s => s.isGift);

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
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          {/* Main Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group h-full"
              >
                {service.isBestseller && (
                  <div className="absolute -top-2 -right-2 bg-[#ff5a00] text-white px-3 py-1 rounded-full text-sm z-20 shadow-lg">
                    Bestseller!
                  </div>
                )}
                
                <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-[#ff5a00]/20 hover:border-[#ff5a00] transition-all duration-300 overflow-hidden group-hover:shadow-lg group-hover:shadow-[#ff5a00]/10 h-full flex flex-col">
                  {/* Card Content */}
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#ff5a00] transition-colors">
                      {service.name[language]}
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Clock className="w-4 h-4 text-[#ff5a00]" />
                        <span>{service.duration}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-400">
                        <DollarSign className="w-4 h-4 text-[#ff5a00]" />
                        <span>{service.price === '0.00 zł' ? t('services.free') : service.price}</span>
                      </div>
                      
                      {service.difficulty && (
                        <div className="flex items-center space-x-1">
                          {renderDifficulty(service.difficulty)}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <h4 className="text-sm font-medium text-[#ff5a00] mb-2">{t('services.packages.' + service.id + '.items.title')}</h4>
                      <ul className="text-gray-400 text-sm space-y-1">
                        {Array.isArray(t('services.packages.' + service.id + '.items.list')) && 
                          t('services.packages.' + service.id + '.items.list').map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-[#ff5a00]">•</span>
                              <span>{item}</span>
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  </div>

                  {/* Book Button */}
                  <div className="p-4 bg-black/40 mt-auto">
                    <a
                      href={service.link}
                      className="block w-full text-center py-2.5 px-4 rounded-lg transition-all bg-[#ff5a00] hover:bg-[#ff7a30] text-white font-medium text-sm"
                    >
                      {t('services.book')}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Promo Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {promoServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group h-full"
              >
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm z-20 shadow-lg">
                  {t('services.promo')}
                </div>
                
                <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-blue-500/20 hover:border-blue-500 transition-all duration-300 overflow-hidden group-hover:shadow-lg group-hover:shadow-blue-500/10 h-full flex flex-col">
                  {/* Card Content */}
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-500 transition-colors">
                      {service.name[language]}
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{service.duration}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-400">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        <span>{t('services.free')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Book Button */}
                  <div className="p-4 bg-black/40 mt-auto">
                    <a
                      href={service.link}
                      className="block w-full text-center py-2.5 px-4 rounded-lg transition-all bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm"
                    >
                      {t('services.book')}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Gift Cards Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl" />
            <div className="relative pt-8 pb-4">
              <h2 className="text-2xl font-bold text-center mb-8 text-white">
                <span className="text-purple-500">🎁</span> {t('services.gift')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {giftServices.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group h-full"
                  >
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm z-20 shadow-lg">
                      {t('services.gift')}
                    </div>
                    
                    <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-purple-500/20 hover:border-purple-500 transition-all duration-300 overflow-hidden group-hover:shadow-lg group-hover:shadow-purple-500/10 h-full flex flex-col">
                      {/* Card Content */}
                      <div className="p-6 flex-1">
                        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-500 transition-colors">
                          {service.name[language]}
                        </h3>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Clock className="w-4 h-4 text-purple-500" />
                            <span>{service.duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Book Button */}
                      <div className="p-4 bg-black/40 mt-auto">
                        <a
                          href={service.link}
                          className="block w-full text-center py-2.5 px-4 rounded-lg transition-all bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium text-sm"
                        >
                          {t('services.book')}
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
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
              {Array.isArray(t('services.additionalItems.items')) && 
                t('services.additionalItems.items').map((item: string, index: number) => (
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