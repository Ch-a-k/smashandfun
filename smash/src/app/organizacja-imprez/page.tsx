"use client";

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

const services = [
  {
    title: 'ORGANIZACJA IMPREZ',
    description: 'Szukasz idealnego miejsca na imprezę? Marzysz o zniszczeniu biura czy całego mieszkania? Odwiedź nas! Zorganizujemy całe wydarzenie, a Tobie pozostanie tylko świetna zabawa!',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 48 48"><defs><mask id="ipTBaseballBat0"><g fill="#000" stroke="#fff" strokeWidth="4"><circle cx="40" cy="40" r="3"/><path strokeLinejoin="round" d="M16.502 9.43S26.5 22 37.5 37.501C21.5 26 9.43 16.502 9.43 16.502S3.111 10.89 7 7s9.502 2.43 9.502 2.43Z"/></g></mask></defs><path fill="#F36E21" d="M0 0h48v48H0z" mask="url(#ipTBaseballBat0)"/></svg>
  },
  {
    title: 'BON PODARUNKOWY',
    description: 'Voucher o wartości dowolnej kwoty lub pakiet. Ważny przez 6 miesięcy. Zwrotowi nie podlega. Łączenie z innymi promocjami lub rabatami nie jest możliwe.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="#F36E21" d="M19.87 8.6A1 1 0 0 0 19 8h-4.58l1.27-4.74a1 1 0 0 0-.17-.87a1 1 0 0 0-.79-.39h-7a1 1 0 0 0-1 .74l-2.68 10a1 1 0 0 0 .17.87a1 1 0 0 0 .8.39h3.87l-1.81 6.74a1 1 0 0 0 1.71.93l10.9-12a1 1 0 0 0 .18-1.07m-9.79 8.68l1.07-4a1 1 0 0 0-.17-.87a1 1 0 0 0-.79-.39H6.35L8.49 4h4.93l-1.27 4.74a1 1 0 0 0 1 1.26h3.57Z"/></svg>
  },
  {
    title: 'WYNAJEM PRZESTRZENI',
    description: 'Możesz także skorzystać z opcji wynajmu naszego miejsca na swoją imprezę, przyjęcie czy inną okazję.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 512 512"><path fill="none" stroke="#F36E21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M277.42 247a24.7 24.7 0 0 0-4.08-5.47L255 223.44a21.6 21.6 0 0 0-6.56-4.57a20.93 20.93 0 0 0-23.28 4.27c-6.36 6.26-18 17.68-39 38.43C146 301.3 71.43 367.89 37.71 396.29a16 16 0 0 0-1.09 23.54l39 39.43a16.13 16.13 0 0 0 23.67-.89c29.24-34.37 96.3-109 136-148.23c20.39-20.06 31.82-31.58 38.29-37.94a21.76 21.76 0 0 0 3.84-25.2m201.01-46l-34.31-34a5.44 5.44 0 0 0-4-1.59a5.6 5.6 0 0 0-4 1.59h0a11.41 11.41 0 0 1-9.55 3.27c-4.48-.49-9.25-1.88-12.33-4.86c-7-6.86 1.09-20.36-5.07-29a243 243 0 0 0-23.08-26.72c-7.06-7-34.81-33.47-81.55-52.53a123.8 123.8 0 0 0-47-9.24c-26.35 0-46.61 11.76-54 18.51c-5.88 5.32-12 13.77-12 13.77a91 91 0 0 1 10.81-3.2a79.5 79.5 0 0 1 23.28-1.49C241.19 76.8 259.94 84.1 270 92c16.21 13 23.18 30.39 24.27 52.83c.8 16.69-15.23 37.76-30.44 54.94a7.85 7.85 0 0 0 .4 10.83l21.24 21.23a8 8 0 0 0 11.14.1c13.93-13.51 31.09-28.47 40.82-34.46s17.58-7.68 21.35-8.09a35.7 35.7 0 0 1 21.3 4.62a13.7 13.7 0 0 1 3.08 2.38c6.46 6.56 6.07 17.28-.5 23.74l-2 1.89a5.5 5.5 0 0 0 0 7.84l34.31 34a5.5 5.5 0 0 0 4 1.58a5.65 5.65 0 0 0 4-1.58L478.43 209a5.82 5.82 0 0 0 0-8"/></svg>
  }
];

const events = [
  {
    title: 'ZORGANIZUJ IMPREZĘ!',
    description: 'Szukasz pomysłu na wieczór w większym gronie? Niezapomniane urodziny, szalony wieczór panieński lub kawalerski, a może luźne spotkanie z przyjaciółmi? Chcesz zorganizować pełen wrażeń wieczór w Smash&Fun, ale nie wiesz, od czego zacząć rezerwację?\n\nZ nami wszystko będzie proste i szybkie!',
    image: '/images/party.png',
    alt: 'Grupa przyjaciół bawiąca się w Smash&Fun'
  },
  {
    title: 'IMPREZA FIRMOWA, KTÓRA ZROBI WRAŻENIE!',
    description: 'Marzysz o zniszczeniu biura czy całego mieszkania? Planujesz zorganizować u nas firmowe spotkanie lub imprezę integracyjną dla swojego zespołu? Chcesz zapewnić niezapomniane aktywności teambuildingowe, ale nie wiesz, jak zaplanować idealny scenariusz dla większej grupy ani jak wybrać odpowiedni pakiet?\n\nNie musisz się martwić, zajmiemy się wszystkim!',
    image: '/images/corporate.png',
    alt: 'Grupa pracowników podczas imprezy firmowej'
  },
  {
    title: 'NIEZAPOMNIANE URODZINY DLA TWOJEGO DZIECKA!',
    description: 'Chcesz zorganizować niezapomniane urodziny dla swojego dziecka? Wybierz jeden z naszych trzech pakietów, które zapewnią mnóstwo zabawy i wyjątkowe wspomnienia, dzięki czemu żaden z gości nie będzie się nudził ani przez moment!\n\nSkontaktuj się z nami by stworzyć urodziny, o których Twoje dziecko zawsze marzyło!',
    image: '/images/kids.png',
    alt: 'Dzieci świętujące urodziny'
  }
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function OrganizacjaImprez() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full bg-gradient-to-b from-[#1a1718] to-[#231f20] py-32">
          {/* Decorative line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
          
          {/* Decorative background images */}
          <div className="absolute top-[5%] left-[15%] w-20 h-20 opacity-90 pointer-events-none">
            <Image
              src="/images/turn-left.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute top-[40%] left-[8%] w-16 h-16 opacity-90 pointer-events-none">
            <Image
              src="/images/6o.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute top-[65%] right-[20%] w-24 h-24 opacity-90 pointer-events-none">
            <Image
              src="/images/1.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute top-[75%] left-[50%] w-20 h-20 opacity-90 pointer-events-none -translate-x-1/2">
            <Image
              src="/images/down.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute top-[25%] right-[12%] w-12 h-12 opacity-90 pointer-events-none">
            <Image
              src="/images/turn-right.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute top-[60%] left-[25%] w-16 h-16 opacity-90 pointer-events-none">
            <Image
              src="/images/3o.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute top-[15%] right-[35%] w-14 h-14 opacity-90 pointer-events-none">
            <Image
              src="/images/2o.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute top-[50%] right-[15%] w-12 h-12 opacity-90 pointer-events-none">
            <Image
              src="/images/4o.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
          
          <div className="max-w-7xl mx-auto px-4">
            {/* Hero content */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold text-white text-center mb-8 relative z-10"
            >
              ZORGANIZUJ IMPREZĘ
            </motion.h1>
          </div>
        </section>

        {/* Services Section */}
        <section className="relative w-full bg-[#1a1718] py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 relative group hover:bg-white/10 transition-all duration-300"
                >
                  {/* Glass effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 rounded-2xl pointer-events-none" />
                  
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                  <p className="text-white/70">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="relative w-full bg-[#231f20] py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="space-y-24">
              {events.map((event, index) => (
                <motion.div
                  key={event.title}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  variants={{
                    initial: { opacity: 0 },
                    animate: { opacity: 1 }
                  }}
                  className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
                >
                  <div className="w-full md:w-1/2">
                    <div className="relative aspect-video rounded-2xl overflow-hidden">
                      <Image
                        src={event.image}
                        alt={event.alt}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-6">
                    <motion.h3 
                      variants={fadeInUp}
                      className="text-3xl font-bold text-white"
                    >
                      {event.title}
                    </motion.h3>
                    <motion.p 
                      variants={fadeInUp}
                      className="text-white/70 whitespace-pre-line"
                    >
                      {event.description}
                    </motion.p>
                    <motion.div variants={fadeInUp}>
                      <Link
                        href="/kontakt"
                        className="inline-block px-8 py-4 bg-[#f36e21] text-white font-bold rounded-lg
                          transform transition-all duration-200 hover:scale-105 hover:bg-[#ff7b2e]
                          focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:ring-opacity-50"
                      >
                        REZERWACJA
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative w-full bg-[#1a1718] py-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 relative"
            >
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 rounded-2xl pointer-events-none" />
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Gotowy na niezapomniane wrażenia?
              </h2>
              <p className="text-white/70 mb-8">
                Skontaktuj się z nami już dziś i pozwól nam zorganizować wyjątkowe wydarzenie!
              </p>
              <Link
                href="/kontakt"
                className="inline-block px-12 py-6 bg-[#f36e21] text-white font-bold rounded-lg
                  transform transition-all duration-200 hover:scale-105 hover:bg-[#ff7b2e]
                  focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:ring-opacity-50
                  text-lg"
              >
                ZAREZERWUJ TERAZ
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
