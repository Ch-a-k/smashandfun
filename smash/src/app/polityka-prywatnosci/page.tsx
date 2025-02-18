"use client";

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const sections = [
  {
    title: "1. Informacje ogólne",
    content: [
      '1.1. Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych Użytkowników korzystających z usług Smash&Fun.',
      '1.2. Administratorem danych osobowych jest Smashandfun z siedzibą w ul. Postępu 19/4, 02-676 Warszawa, wpisana do rejestru przedsiębiorców pod numerem KRS [NUMER], NIP [NUMER], REGON [NUMER].',
      '1.3. Administrator wyznaczył Inspektora Ochrony Danych, z którym można się skontaktować pod adresem e-mail: [EMAIL].',
    ]
  },
  {
    title: "2. Zakres zbieranych danych",
    content: [
      '2.1. Administrator zbiera następujące dane osobowe:',
      '- Imię i nazwisko',
      '- Adres e-mail',
      '- Numer telefonu',
      '- Dane dotyczące rezerwacji',
      '2.2. Podanie danych jest dobrowolne, ale niezbędne do korzystania z usług Smash&Fun.',
    ]
  },
  {
    title: "3. Cele przetwarzania danych",
    content: [
      '3.1. Dane osobowe przetwarzane są w następujących celach:',
      '- Realizacja usług i rezerwacji',
      '- Komunikacja z klientami',
      '- Marketing bezpośredni własnych produktów i usług',
      '- Realizacja obowiązków prawnych',
      '3.2. Podstawą prawną przetwarzania danych jest:',
      '- Art. 6 ust. 1 lit. b RODO - wykonanie umowy',
      '- Art. 6 ust. 1 lit. c RODO - obowiązek prawny',
      '- Art. 6 ust. 1 lit. f RODO - prawnie uzasadniony interes administratora',
    ]
  },
  {
    title: "4. Okres przechowywania danych",
    content: [
      '4.1. Dane osobowe przechowywane są przez okres:',
      '- Niezbędny do realizacji usług',
      '- Wymagany przez przepisy prawa',
      '- Do momentu wniesienia sprzeciwu wobec przetwarzania',
      '4.2. Po upływie okresu przechowywania dane są usuwane lub anonimizowane.',
    ]
  },
  {
    title: "5. Prawa użytkowników",
    content: [
      '5.1. Użytkownikom przysługuje prawo do:',
      '- Dostępu do swoich danych',
      '- Sprostowania danych',
      '- Usunięcia danych',
      '- Ograniczenia przetwarzania',
      '- Przenoszenia danych',
      '- Wniesienia sprzeciwu',
      '5.2. Realizacja praw następuje po złożeniu wniosku na adres e-mail: [EMAIL].',
    ]
  },
  {
    title: "6. Bezpieczeństwo danych",
    content: [
      '6.1. Administrator stosuje odpowiednie środki techniczne i organizacyjne zapewniające bezpieczeństwo danych osobowych.',
      '6.2. Dostęp do danych mają wyłącznie upoważnione osoby.',
      '6.3. Przetwarzanie danych odbywa się zgodnie z wymogami RODO i innych przepisów o ochronie danych osobowych.',
    ]
  },
  {
    title: "7. Pliki cookies",
    content: [
      '7.1. Strona wykorzystuje pliki cookies w celu:',
      '- Zapewnienia prawidłowego działania strony',
      '- Dostosowania zawartości do preferencji użytkownika',
      '- Celów statystycznych',
      '7.2. Użytkownik może w każdej chwili zmienić ustawienia cookies w swojej przeglądarce.',
    ]
  },
  {
    title: "8. Postanowienia końcowe",
    content: [
      '8.1. Administrator zastrzega sobie prawo do zmiany Polityki Prywatności.',
      '8.2. O zmianach użytkownicy będą informowani z odpowiednim wyprzedzeniem.',
      '8.3. W sprawach nieuregulowanych niniejszą Polityką Prywatności zastosowanie mają przepisy RODO oraz inne właściwe przepisy prawa polskiego.',
      '8.4. Polityka Prywatności obowiązuje od dnia 01.01.2025.',
    ]
  },
];

export default function PrivacyPolicyPage() {
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
                  POLITYKA PRYWATNOŚCI
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
                          {paragraph.replace('[NAZWA FIRMY]', 'Smashandfun')
                                   .replace('[ADRES]', 'ul. Postępu 19/4, 02-676 Warszawa')
                                   .replace('[DATA]', '01.01.2025')}
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
                <div className="text-white/70 mb-4">
                  <p>Administrator Danych Osobowych:</p>
                  <p>Smashandfun</p>
                  <p>ul. Postępu 19/4</p>
                  <p>02-676 Warszawa</p>
                </div>
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
