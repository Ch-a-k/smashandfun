"use client";

import React from "react";
import { useI18n } from '@/i18n/I18nContext';

const reviews = [
  {
    text: "Wspaniałe miejsce! Przytulna atmosfera, pyszne napoje i pomocny personel. Świetnie spędziliśmy czas z przyjaciółmi grając w gry planszowe. Szczególnie spodobała nam się duża kolekcja gier i to, jak personel pomaga zrozumieć zasady. Na pewno wrócimy!",
    author: "Marta K."
  },
  {
    text: "Idealne miejsce na spotkania ze znajomymi! Duży wybór gier planszowych, pyszna kawa i przyjemna muzyka. Personel bardzo przyjazny i zawsze gotowy pomóc w wyborze gry. Ucieszyły nas też wygodne kanapy i przytłumione światła, tworzące wyjątkowy klimat.",
    author: "Piotr W."
  },
  {
    text: "Doskonałe miejsce dla miłośników gier planszowych! Ogromny wybór gier na każdy gust, od klasyków po nowości. Bardzo spodobała nam się możliwość zamówienia jedzenia i napojów podczas gry. Personel zawsze służy pomocą w wyjaśnieniu zasad i doborze gry.",
    author: "Anna M."
  },
  {
    text: "Fantastyczne miejsce do relaksu! Byliśmy z rodziną, dzieci są zachwycone różnorodnością gier. Szczególnie spodobała nam się możliwość zagrania w rzadkie gry planszowe, które trudno znaleźć w sklepach. Personel bardzo uważny i troskliwy.",
    author: "Tomasz B."
  },
  {
    text: "Świetna atmosfera i profesjonalna obsługa! Spędziliśmy tu kilka godzin na grach planszowych z przyjaciółmi. Szeroki wybór gier, smaczne przekąski i napoje. Miejsce idealne zarówno na wieczór z przyjaciółmi, jak i na rodzinne popołudnie.",
    author: "Karolina S."
  },
  {
    text: "Rewelacyjne miejsce na integrację! Byliśmy tu z zespołem z pracy i wszyscy byli zachwyceni. Duży wybór gier dla różnych grup wiekowych, świetna obsługa i pyszne jedzenie. Klimatyczne wnętrze sprzyja dobrej zabawie.",
    author: "Michał R."
  },
  {
    text: "Najlepsze miejsce w mieście na spędzenie wieczoru! Byliśmy tu już kilka razy i za każdym razem jest super. Obsługa zawsze doradzi odpowiednią grę, a wybór jest ogromny. Do tego świetna kawa i pyszne przekąski.",
    author: "Agnieszka W."
  },
  {
    text: "Miejsce z charakterem! Świetny wystrój, przyjemna muzyka w tle i profesjonalna obsługa. Doceniamy szczególnie to, że personel zna zasady wszystkich gier i potrafi je świetnie wytłumaczyć. Polecamy każdemu, kto szuka miejsca na kreatywne spędzenie czasu.",
    author: "Krzysztof P."
  }
];

function ReviewsSlider() {
  return (
    <div className="relative py-12">
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .scroll-container {
          display: flex;
          width: fit-content;
          animation: scroll 40s linear infinite;
          gap: 2rem;
          padding-left: 2rem;
        }
        .scroll-container:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="w-full">
        <div className="relative">
          <div className="scroll-container">
            {[...reviews, ...reviews].map((review, index) => (
              <div
                key={index}
                className="flex-shrink-0 group cursor-pointer"
              >
                <div className="relative rounded-xl backdrop-blur-sm px-8 py-6 border border-white/[0.08] w-[600px] h-[280px] flex flex-col justify-between group-hover:bg-white/[0.02] group-hover:scale-[1.02] transition-all duration-300">
                  <div className="flex flex-col h-full">
                    <p className="text-white/80 text-lg leading-relaxed mb-4 flex-grow overflow-y-auto">
                      {review.text}
                    </p>
                    <p className="text-white/60 text-sm mt-auto">
                      {review.author}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Градиентные края для плавного перехода */}
          <div className="absolute left-0 top-0 w-96 h-full bg-gradient-to-r from-[#231f20] to-transparent z-10"></div>
          <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-[#231f20] to-transparent z-10"></div>
        </div>
      </div>
    </div>
  );
}

export function ReviewsSection() {
  const { t } = useI18n();
  
  return (
    <section className="w-full bg-black/20 py-24 relative">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">
          {t('home.reviews.title')}
        </h2>
        <p className="text-lg text-white/70 text-center mb-12">
          {t('home.reviews.description')}
        </p>
      </div>
      <div className="w-full">
        <ReviewsSlider />
      </div>
    </section>
  );
}
