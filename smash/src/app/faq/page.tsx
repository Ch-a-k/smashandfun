"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Image from 'next/image';

type FaqItem = {
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    question: "Czym jest Rage Room?",
    answer: "Rage Room to miejsce, gdzie możesz nie tylko wyładować stres, ale także doświadczyć nowych emocji i rozrywki, niszcząc przedmioty w kontrolowanym środowisku. Od mebli po elektronikę – wszystko jest do Twojej dyspozycji, aby zapewnić Ci pełną satysfakcję z demolki!"
  },
  {
    question: "Jakie przedmioty mogę niszczyć?",
    answer: "Oferujemy szeroki wybór przedmiotów do zniszczenia, w tym meble, szkło, elektronikę, a nawet specjalnie przygotowane rekwizyty. Z każdym pakietem dostajesz różnorodne obiekty, a jeśli masz specjalne życzenia, chętnie je omówimy!"
  },
  {
    question: "Czy muszę mieć wcześniejsze doświadczenie?",
    answer: "Nie, demolka nie wymaga żadnych umiejętności! Każdy może wziąć udział, niezależnie od poziomu doświadczenia. Przed sesją zapewniamy pełen instruktaż oraz niezbędny sprzęt ochronny."
  },
  {
    question: "Jak długo trwa sesja?",
    answer: "Czas trwania sesji zależy od wybranego pakietu i może wynosić od 30 minut do 2 godzin. Możecie wykorzystać pełny dostępny czas lub zakończyć wcześniej, jeśli uznacie, że osiągnęliście swoje cele."
  },
  {
    question: "Czy to bezpieczne?",
    answer: "Tak! Bezpieczeństwo naszych klientów jest naszym priorytetem. Zapewniamy pełny sprzęt ochronny, w tym przyłbice ochronne, kombinezony lub kurtki oraz rękawice. Nasz personel czuwa nad przebiegiem sesji, aby zapewnić Wam bezpieczną i ekscytującą zabawę."
  },
  {
    question: "Czy mogę zorganizować prywatne wydarzenie, takie jak urodziny czy impreza firmowa?",
    answer: "Oczywiście! Organizujemy prywatne eventy dla grup, w tym urodziny, imprezy integracyjne i inne wydarzenia specjalne. Skontaktuj się z nami, aby zarezerwować termin i dostosować szczegóły do Twoich potrzeb."
  },
  {
    question: "Czy mogę przyjść sam/a, czy potrzebuję grupy?",
    answer: "Zapraszamy zarówno osoby indywidualne, jak i grupy. Nasze pakiety są elastyczne i dopasowane do różnych liczebności uczestników."
  },
  {
    question: "Czy mogę przynieść własne przedmioty do zniszczenia?",
    answer: "Tak, możesz przynieść własne przedmioty, jednak muszą one spełniać nasze standardy bezpieczeństwa. Skontaktuj się z nami wcześniej, aby upewnić się, że Twoje przedmioty są odpowiednie do zniszczenia."
  },
  {
    question: "Jak mogę zarezerwować sesję?",
    answer: "Rezerwacji można dokonać wyłącznie online za pośrednictwem naszej strony internetowej. Polecamy wcześniejszą rezerwację, aby zagwarantować dostępność w wybranym terminie."
  },
  {
    question: "Jaka jest cena sesji?",
    answer: "Ceny zależą od wybranego pakietu oraz liczby uczestników. Szczegółowy cennik znajdziesz w zakładce \"Oferta\" na naszej stronie internetowej. Oferujemy także zniżki na większe grupy i specjalne okazje."
  }
];

const FaqItem = ({ question, answer }: FaqItem) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-b border-[#f36e21]/10"
    >
      <button
        className="flex justify-between items-center w-full py-6 text-left group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xl font-medium text-white group-hover:text-[#f36e21] transition-colors">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-[#f36e21]"
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-lg text-white/70 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative w-full bg-gradient-to-b from-[#1a1718] to-[#231f20] py-32 overflow-hidden">
          {/* Decorative line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>

          {/* Decorative background images */}
          <div className="absolute top-[5%] left-[10%] w-32 h-32 opacity-90 pointer-events-none">
            <Image
              src="/images/smile.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute top-[45%] right-[15%] w-40 h-40 opacity-50 pointer-events-none">
            <Image
              src="/images/heart.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute bottom-[20%] left-[25%] w-36 h-36 opacity-40 pointer-events-none">
            <Image
              src="/images/round.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
          
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl md:text-6xl font-bold text-white mb-6"
              >
                FAQ
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl text-white/70"
              >
                Odpowiedzi na najczęściej zadawane pytania
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {faqItems.map((item, index) => (
                <FaqItem key={index} {...item} />
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
