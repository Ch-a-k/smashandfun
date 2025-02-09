'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const { language } = useLanguage();
  const [currentReview, setCurrentReview] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentReview((prev) => (prev + newDirection + reviews.length) % reviews.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-zinc-900 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926')] opacity-5"></div>
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#ff5a00]"
        >
          {language === 'en' ? 'What Our Clients Say' : 'Co Mówią Nasi Klienci'}
        </motion.h2>

        <div className="relative max-w-4xl mx-auto">
          <div className="relative h-[300px] overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentReview}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);

                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                className="absolute w-full"
              >
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-8 border border-[#ff5a00]/20">
                  <div className="flex items-start gap-4">
                    <img
                      src={reviews[currentReview].image}
                      alt={reviews[currentReview].author}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{reviews[currentReview].author}</h3>
                      <div className="flex mb-4">
                        {[...Array(reviews[currentReview].rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-[#ff5a00]" fill="#ff5a00" />
                        ))}
                      </div>
                      <p className="text-gray-300">{reviews[currentReview].text[language]}</p>
                      <p className="text-gray-500 mt-4">{reviews[currentReview].date}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center mt-0 gap-4">
            <button
              onClick={() => paginate(-1)}
              className="p-2 rounded-full border border-[#ff5a00] text-[#ff5a00] hover:bg-[#ff5a00] hover:text-white transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-2 items-center">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentReview ? 1 : -1);
                    setCurrentReview(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentReview ? 'bg-[#ff5a00] w-4' : 'bg-gray-500'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => paginate(1)}
              className="p-2 rounded-full border border-[#ff5a00] text-[#ff5a00] hover:bg-[#ff5a00] hover:text-white transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
