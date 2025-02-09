'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';

interface Review {
  id: number;
  author: string;
  rating: number;
  text: {
    en: string;
    pl: string;
  };
  date: string;
  image: string;
}

const reviews: Review[] = [
  {
    id: 1,
    author: "Karolina Lewandowska",
    rating: 5,
    text: {
      en: "Just had my bachelorette party here - what an incredible experience! Everyone was talking about it for days. The themed room was perfect!",
      pl: "Właśnie miałam tu wieczór panieński - co za niesamowite doświadczenie! Wszyscy mówili o tym przez wiele dni. Tematyczny pokój był idealny!"
    },
    date: "2025-02-08",
    image: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: 2,
    author: "Michał Zieliński",
    rating: 5,
    text: {
      en: "Second time here and it's even better! The new themed rooms are amazing. Great way to deal with work stress.",
      pl: "Drugi raz tutaj i jest jeszcze lepiej! Nowe pokoje tematyczne są niesamowite. Świetny sposób na radzenie sobie ze stresem w pracy."
    },
    date: "2025-02-01",
    image: "https://i.pravatar.cc/150?img=6"
  },
  {
    id: 3,
    author: "Aleksandra Dąbrowska",
    rating: 5,
    text: {
      en: "The VR experience combined with actual smashing is genius! Really helps to immerse yourself. The staff is super friendly too.",
      pl: "Doświadczenie VR połączone z prawdziwym niszczeniem jest genialne! Naprawdę pomaga się zanurzyć. Personel jest również super przyjazny."
    },
    date: "2025-01-25",
    image: "https://i.pravatar.cc/150?img=7"
  },
  {
    id: 4,
    author: "Krzysztof Wojciechowski",
    rating: 5,
    text: {
      en: "Celebrated my divorce here - best decision ever! The 'Office Space' themed room was exactly what I needed. Therapeutic and fun!",
      pl: "Świętowałem tu swój rozwód - najlepsza decyzja! Pokój w stylu 'Office Space' był dokładnie tym, czego potrzebowałem. Terapeutyczne i zabawne!"
    },
    date: "2025-01-15",
    image: "https://i.pravatar.cc/150?img=8"
  },
  {
    id: 5,
    author: "Magdalena Szymańska",
    rating: 5,
    text: {
      en: "The new year special package was amazing! Love the photo session included. The pictures turned out incredible!",
      pl: "Specjalny pakiet noworoczny był niesamowity! Uwielbiam dołączoną sesję zdjęciową. Zdjęcia wyszły niesamowicie!"
    },
    date: "2025-01-02",
    image: "https://i.pravatar.cc/150?img=9"
  },
  {
    id: 6,
    author: "Jan Kowalczyk",
    rating: 5,
    text: {
      en: "Had our company's end-of-year event here. 30 people, all thrilled! The group packages are well thought out.",
      pl: "Mieliśmy tu imprezę firmową na koniec roku. 30 osób, wszyscy zachwyceni! Pakiety grupowe są dobrze przemyślane."
    },
    date: "2024-12-20",
    image: "https://i.pravatar.cc/150?img=10"
  },
  {
    id: 7,
    author: "Natalia Witkowska",
    rating: 5,
    text: {
      en: "The Christmas-themed destruction room was so creative! Loved smashing those ugly Christmas decorations. Very stress-relieving!",
      pl: "Świąteczny pokój destrukcji był tak kreatywny! Uwielbiałam rozbijać te brzydkie świąteczne dekoracje. Bardzo odstresowujące!"
    },
    date: "2024-12-10",
    image: "https://i.pravatar.cc/150?img=11"
  },
  {
    id: 8,
    author: "Adam Wójcik",
    rating: 5,
    text: {
      en: "The Black Friday deal was incredible! Got to try the premium room with all the extras. Worth every penny!",
      pl: "Oferta Black Friday była niesamowita! Wypróbowałem pokój premium ze wszystkimi dodatkami. Warte każdej złotówki!"
    },
    date: "2024-11-25",
    image: "https://i.pravatar.cc/150?img=12"
  },
  {
    id: 9,
    author: "Weronika Jabłońska",
    rating: 5,
    text: {
      en: "Perfect rainy day activity! The indoor location is spacious and well-ventilated. They even have a cool waiting area with games!",
      pl: "Idealna aktywność na deszczowy dzień! Lokalizacja jest przestronna i dobrze wentylowana. Mają nawet fajną poczekalnię z grami!"
    },
    date: "2024-11-15",
    image: "https://i.pravatar.cc/150?img=13"
  },
  {
    id: 10,
    author: "Marcin Kaczmarczyk",
    rating: 5,
    text: {
      en: "The Halloween special event was epic! The themed rooms and special effects made it unforgettable. Can't wait for next year!",
      pl: "Specjalne wydarzenie na Halloween było epickie! Tematyczne pokoje i efekty specjalne uczyniły je niezapomnianym. Nie mogę się doczekać przyszłego roku!"
    },
    date: "2024-10-31",
    image: "https://i.pravatar.cc/150?img=14"
  },
  {
    id: 11,
    author: "Zofia Malinowska",
    rating: 5,
    text: {
      en: "Came here for stress relief after exams. The student discount is great, and the experience was exactly what I needed!",
      pl: "Przyszłam tu na odstresowanie po egzaminach. Zniżka studencka jest świetna, a doświadczenie było dokładnie tym, czego potrzebowałam!"
    },
    date: "2024-10-15",
    image: "https://i.pravatar.cc/150?img=15"
  },
  {
    id: 12,
    author: "Kamil Zawadzki",
    rating: 5,
    text: {
      en: "The new 'Rage Room Plus' package is fantastic! The added VR experience and the slow-motion video of your best smashes are worth the upgrade.",
      pl: "Nowy pakiet 'Rage Room Plus' jest fantastyczny! Dodane doświadczenie VR i zwolnione tempo wideo twoich najlepszych zniszczeń są warte dopłaty."
    },
    date: "2024-10-05",
    image: "https://i.pravatar.cc/150?img=16"
  },
  {
    id: 13,
    author: "Anna Kowalska",
    rating: 5,
    text: {
      en: "Amazing experience! Perfect way to release stress. The staff was very professional and helpful. I'll definitely come back!",
      pl: "Niesamowite doświadczenie! Świetny sposób na odstresowanie. Personel był bardzo profesjonalny i pomocny. Na pewno wrócę!"
    },
    date: "2024-01-15",
    image: "https://i.pravatar.cc/150?img=1"
  },
  {
    id: 14,
    author: "Piotr Nowak",
    rating: 5,
    text: {
      en: "Had my birthday party here with friends. Everyone loved it! Such a unique and fun experience. Great safety measures too!",
      pl: "Miałem tu imprezę urodzinową ze znajomymi. Wszystkim się podobało! Wyjątkowe i zabawne doświadczenie. Świetne środki bezpieczeństwa!"
    },
    date: "2024-01-20",
    image: "https://i.pravatar.cc/150?img=2"
  },
  {
    id: 15,
    author: "Maria Wiśniewska",
    rating: 5,
    text: {
      en: "Perfect after a stressful week at work. The variety of items to break is impressive. Therapeutic and fun at the same time!",
      pl: "Idealne po stresującym tygodniu w pracy. Różnorodność rzeczy do zniszczenia robi wrażenie. Terapeutyczne i zabawne jednocześnie!"
    },
    date: "2024-01-25",
    image: "https://i.pravatar.cc/150?img=3"
  },
  {
    id: 16,
    author: "Tomasz Kaczmarek",
    rating: 5,
    text: {
      en: "Brought my team here for team building. Best decision ever! Everyone had a blast and it really helped with team bonding.",
      pl: "Przyprowadziłem tu swój zespół na team building. Najlepsza decyzja! Wszyscy świetnie się bawili i naprawdę pomogło to w integracji zespołu."
    },
    date: "2024-01-30",
    image: "https://i.pravatar.cc/150?img=4"
  }
];

export default function ReviewsSection() {
  const { t, language } = useLanguage();
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentReview = reviews[currentReviewIndex];

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5"></div>
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#ff5a00]"
        >
          {t('reviews.title')}
        </motion.h2>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentReviewIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-8 border border-[#ff5a00]/10"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="flex-shrink-0">
                  <img
                    src={currentReview.image}
                    alt={currentReview.author}
                    className="w-16 h-16 rounded-full border-2 border-[#ff5a00]/20"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <h3 className="text-xl font-protest text-white mb-2 md:mb-0">
                      {currentReview.author}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {Array.from({ length: currentReview.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 text-[#ff5a00] fill-[#ff5a00]"
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(currentReview.date).toLocaleDateString(
                          language === 'pl' ? 'pl-PL' : 'en-US',
                          { year: 'numeric', month: 'long', day: 'numeric' }
                        )}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {currentReview.text[language]}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center mt-8 space-x-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentReviewIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentReviewIndex
                    ? 'bg-[#ff5a00] w-6'
                    : 'bg-gray-600 hover:bg-[#ff5a00]/50'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
