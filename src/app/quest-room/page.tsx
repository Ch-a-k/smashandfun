import type { Metadata } from 'next';
import { QuestRoomClient } from '@/components/QuestRoom/QuestRoomClient';

const PAGE_URL = 'https://smashandfun.pl/quest-room';
const BOOKING_URL = 'https://smashandfun.pl/rezerwacja';

export const metadata: Metadata = {
  title:
    'Quest Room Warszawa? Sprawdź Rage Room Smash&Fun — coś lepszego niż escape room',
  description:
    'Szukasz quest room w Warszawie? Smash&Fun to rage room — alternatywa dla escape roomu. Zamiast szukać kluczy, rozbijasz wszystko młotem. Sesje 30–150 min, do 6 osób, rezerwacja online.',
  keywords: [
    'quest room warszawa',
    'quest room',
    'escape room warszawa',
    'pokój zagadek warszawa',
    'alternatywa dla quest room',
    'rage room warszawa',
    'demolka warszawa',
    'smash room warszawa',
  ],
  alternates: {
    canonical: PAGE_URL,
    languages: {
      pl: PAGE_URL,
      en: PAGE_URL,
      'x-default': PAGE_URL,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    alternateLocale: 'en_US',
    url: PAGE_URL,
    title:
      'Quest Room Warszawa? Mamy coś lepszego — Rage Room Smash&Fun',
    description:
      'Alternatywa dla quest roomu w Warszawie. Zamiast zagadek — młot, kij baseballowy i lista rzeczy do zniszczenia. Rezerwacja online w 60 sekund.',
    siteName: 'Smash&Fun',
    images: [
      {
        url: '/og/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Smash&Fun — alternatywa dla quest roomu w Warszawie',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quest Room Warszawa? Sprawdź Rage Room Smash&Fun',
    description:
      'Alternatywa dla quest roomu w Warszawie — rage room z młotem i listą celów. Rezerwacja online.',
    images: ['/og/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const businessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EntertainmentBusiness',
  '@id': PAGE_URL,
  name: 'Smash&Fun — Rage Room Warszawa',
  alternateName: ['Quest Room Warszawa', 'Escape Room Warszawa', 'Demolka Warszawa'],
  description:
    'Rage room w Warszawie — alternatywa dla klasycznego quest roomu. Sesje demolki z pełnym wyposażeniem ochronnym, dla 1–6 osób.',
  url: PAGE_URL,
  image: 'https://smashandfun.pl/og/og-image.png',
  telephone: '+48881281313',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ul. Postępu 19/4',
    addressLocality: 'Warszawa',
    postalCode: '02-676',
    addressCountry: 'PL',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 52.1799,
    longitude: 21.0076,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '14:00',
      closes: '20:30',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '12:00',
      closes: '20:30',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '320',
    bestRating: '5',
    worstRating: '1',
  },
  potentialAction: {
    '@type': 'ReserveAction',
    target: BOOKING_URL,
    name: 'Zarezerwuj sesję',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Czy Smash&Fun to quest room?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nie, jesteśmy rage roomem. Klienci, którzy szukają quest roomu w Warszawie, często trafiają do nas i wracają — zamiast łamać głowę nad zagadkami, rozładowują napięcie fizycznie.',
      },
    },
    {
      '@type': 'Question',
      name: 'Czym rage room różni się od quest roomu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'W quest roomie szukasz wskazówek i rozwiązujesz zagadki. U nas dostajesz młot, kij baseballowy lub łom i niszczysz prawdziwe przedmioty: szkło, meble, elektronikę.',
      },
    },
    {
      '@type': 'Question',
      name: 'Dla ilu osób są wasze sesje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Standardowe pakiety obsługują 1–6 osób. Dla większych grup organizujemy osobne sloty.',
      },
    },
    {
      '@type': 'Question',
      name: 'Czy to jest bezpieczne?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Każdy uczestnik dostaje kombinezon ochronny, kask z przyłbicą i wytrzymałe rękawice. Personel przeprowadza pełen briefing i obserwuje sesję z podglądu.',
      },
    },
    {
      '@type': 'Question',
      name: 'Czy organizujecie imprezy firmowe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tak. Mamy osobne pakiety B2B, faktury VAT i pomoc w organizacji od A do Z.',
      },
    },
  ],
};

export default function QuestRoomPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <QuestRoomClient />
    </>
  );
}
