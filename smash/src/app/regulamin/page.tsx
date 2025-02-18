"use client";

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const sections = [
  {
    title: "§1. Postanowienia ogólne",
    content: [
      '1. Niniejszy Regulamin określa zasady korzystania z usług oferowanych przez Smash&Fun, zwaną dalej "Smash&Fun" lub "Usługodawcą".',
      '2. Smash&Fun świadczy usługi w zakresie organizacji rozrywki i rekreacji pod adresem ul. Postępu 19/4, 02-676 Warszawa.',
      '3. Korzystanie z usług Smash&Fun oznacza akceptację niniejszego Regulaminu.',
    ]
  },
  {
    title: "§2. Zasady bezpieczeństwa",
    content: [
      '1. Korzystanie z usług Smash&Fun dozwolone jest wyłącznie dla osób pełnoletnich lub osób powyżej 12 roku życia pod opieką osoby pełnoletniej.',
      '2. Przed rozpoczęciem aktywności, każdy uczestnik zobowiązany jest do:',
      '   - Zapoznania się z instrukcją bezpieczeństwa',
      '   - Podpisania oświadczenia o braku przeciwwskazań zdrowotnych',
      '   - Stosowania się do poleceń personelu',
      '3. Zabrania się korzystania z usług pod wpływem alkoholu lub innych środków odurzających.',
    ]
  },
  {
    title: "§3. Rezerwacje i płatności",
    content: [
      '1. Rezerwacji można dokonać:',
      '   - Poprzez stronę internetową',
      '   - Telefonicznie',
      '   - Osobiście w lokalu',
      '2. Płatności można dokonać:',
      '   - Gotówką',
      '   - Kartą płatniczą',
      '   - Przelewem (w przypadku rezerwacji grupowych)',
      '3. W przypadku rezygnacji z rezerwacji należy poinformować Smash&Fun minimum 24 godziny przed planowanym terminem.',
    ]
  },
  {
    title: "§4. Odpowiedzialność",
    content: [
      '1. Smash&Fun ponosi odpowiedzialność za szkody wyrządzone klientom tylko w przypadku zawinionego działania lub zaniechania.',
      '2. Klient ponosi odpowiedzialność materialną za szkody wyrządzone w wyposażeniu lokalu.',
      '3. Smash&Fun nie ponosi odpowiedzialności za rzeczy pozostawione w lokalu.',
    ]
  },
  {
    title: "§5. Reklamacje",
    content: [
      '1. Reklamacje można składać:',
      '   - Pisemnie na adres siedziby',
      '   - Drogą elektroniczną na adres: [EMAIL]',
      '2. Reklamacja zostanie rozpatrzona w terminie 14 dni od daty jej otrzymania.',
      '3. Odpowiedź na reklamację zostanie przesłana w formie pisemnej lub elektronicznej.',
    ]
  },
  {
    title: "§6. Postanowienia końcowe",
    content: [
      '1. Smash&Fun zastrzega sobie prawo do zmiany Regulaminu.',
      '2. O zmianach Regulaminu klienci będą informowani poprzez stronę internetową.',
      '3. W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego.',
      '4. Regulamin wchodzi w życie z dniem 01.01.2025.',
    ]
  },
];

export default function RegulaminPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative w-full bg-gradient-to-b from-[#1a1718] to-[#231f20] py-32">
          {/* Decorative line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
          
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-12 relative"
            >
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 rounded-2xl pointer-events-none" />
              
              {/* Document header */}
              <div className="text-center mb-12 relative">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  REGULAMIN
                </h1>
                <div className="text-white/70 space-y-2">
                  <p>Smashandfun</p>
                  <p>ul. Postępu 19/4</p>
                  <p>02-676 Warszawa</p>
                  <p className="mt-4">Obowiązuje od: 01.01.2025</p>
                </div>
              </div>

              {/* Document content */}
              <div className="space-y-8">
                {sections.map((section, index) => (
                  <div key={section.title} className="relative">
                    <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
                    <div className="space-y-3 pl-4">
                      {section.content.map((paragraph, i) => (
                        <p key={i} className="text-white/70 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {index < sections.length - 1 && (
                      <div className="mt-8 border-b border-white/10" />
                    )}
                  </div>
                ))}
              </div>

              {/* Document footer */}
              <div className="mt-12 pt-8 border-t border-white/10 text-center">
                <p className="text-white/50 text-sm">
                  Dokument wygenerowany elektronicznie i nie wymaga podpisu.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
