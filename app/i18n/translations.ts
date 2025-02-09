import { Translations } from './types';

export const translations: Record<string, Translations> = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      contact: 'Contact',
      blog: 'Blog',
      faq: 'FAQ'
    },
    hero: {
      title: 'SMASH & FUN',
      subtitle: 'Release Your Stress in Style',
      cta: 'Book Now',
    },
    features: {
      title: 'Why Choose Us?',
    },
    services: {
      title: 'Services',
      subtitle: 'Choose your rage package',
      book: 'Book Now',
      gift: 'Gift Card',
      promo: 'Special Offer',
      additionalItems: {
        title: 'Additional Items',
        items: [
          'Extra glass items (5 pcs) - 50 PLN',
          'Extra electronics (1 pc) - 100 PLN',
          'Extra furniture (1 pc) - 150 PLN',
          'Video recording - 50 PLN'
        ]
      },
      descriptions: {
        pieceCake: {
          title: 'PIECE OF CAKE',
          duration: '30 min',
          items: ['Basic glass items', 'Safety equipment', 'Perfect for beginners']
        },
        easy: {
          title: 'EASY',
          duration: '1 hour',
          items: ['More glass items', 'Basic furniture', 'Safety equipment', 'Good for stress relief']
        },
        medium: {
          title: 'MEDIUM',
          duration: '2 hours',
          items: ['Lots of glass items', 'Multiple furniture pieces', 'Electronics', 'Safety equipment', 'Our most popular choice']
        },
        hard: {
          title: 'HARD',
          duration: '2 hours',
          items: ['Maximum glass items', 'Large furniture', 'Multiple electronics', 'Safety equipment', 'For ultimate destruction']
        }
      },
      packages: {
        hard: {
          title: 'HARD',
          items: {
            title: 'TO DEMOLISH',
            list: [
              '35 glass items',
              '5 furniture',
              '8 electronics',
              '10 smaller electronics'
            ]
          },
          tools: {
            title: 'TOOLS',
            list: [
              'clothing',
              'helmet',
              'gloves'
            ]
          },
          details: '1-6 people/up to 180 min',
          price: '999 PLN'
        },
        medium: {
          title: 'MEDIUM',
          items: {
            title: 'TO DEMOLISH',
            list: [
              '30 glass items',
              '3 furniture',
              '5 electronics'
            ]
          },
          tools: {
            title: 'TOOLS',
            list: [
              'clothing',
              'helmet',
              'gloves'
            ]
          },
          details: '1-4 people/up to 120 min',
          price: '499 PLN'
        },
        easy: {
          title: 'EASY',
          items: {
            title: 'TO DEMOLISH',
            list: [
              '25 glass items',
              '2 furniture',
              '3 electronics'
            ]
          },
          tools: {
            title: 'TOOLS',
            list: [
              'clothing',
              'helmet',
              'gloves'
            ]
          },
          details: '1-2 people/up to 45 min',
          price: '299 PLN'
        },
        beginner: {
          title: 'BEGINNER',
          items: {
            title: 'TO DEMOLISH',
            list: [
              '25 glass items'
            ]
          },
          tools: {
            title: 'TOOLS',
            list: [
              'clothing',
              'helmet',
              'gloves'
            ]
          },
          details: '1-2 people/up to 30 min',
          price: '199 PLN'
        }
      },
      booking: {
        title: 'Book Your Session',
        description: 'Ready to release some stress? Book your rage room session now!',
        cta: 'Book Now',
        form: {
          name: 'Your Name',
          email: 'Email',
          phone: 'Phone Number',
          date: 'Preferred Date',
          time: 'Preferred Time',
          package: 'Select Package',
          submit: 'Book Session'
        }
      },
      giftCard: {
        title: 'Gift Voucher',
        description: 'Give the gift of stress relief',
        cta: 'Buy Voucher',
        options: {
          title: 'Choose Voucher Type',
          monetary: 'Money Value Voucher',
          package: 'Package Voucher'
        }
      },
      promos: {
        title: 'Special Offers',
        description: 'Check out our current promotions',
        groupDiscount: 'Group Discount: 10% off for groups of 4+',
        studentDiscount: 'Student Discount: 15% off with valid student ID',
        weekdaySpecial: 'Weekday Special: 20% off morning sessions'
      },
    },
    contact: {
      title: 'Contact Us',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
    },
    reviews: {
      title: 'What Our Clients Say',
      viewMore: 'View more reviews on Google',
    },
    cta: {
      title: 'Ready to Release Your Stress?',
      subtitle: 'Join thousands of satisfied customers who have experienced the ultimate stress relief',
      button: 'Book Your Session Now'
    },
    faq: {
      title: 'Frequently Asked Questions',
      questions: [
        {
          q: 'What is a Rage Room?',
          a: 'A Rage Room is a place where you can not only release stress but also experience new emotions and entertainment by destroying objects in a controlled environment. From furniture to electronics – everything is at your disposal to ensure your complete satisfaction with the demolition!'
        },
        {
          q: 'What objects can I destroy?',
          a: 'We offer a wide selection of objects for destruction, including furniture, glass, electronics, and even specially prepared props. With each package, you get various objects, and if you have special requests, we\'ll gladly discuss them!'
        },
        {
          q: 'Do I need prior experience?',
          a: 'No, demolition requires no skills! Anyone can participate, regardless of experience level. Before the session, we provide full instruction and necessary protective equipment.'
        },
        {
          q: 'How long does a session last?',
          a: 'Session duration depends on the chosen package and can range from 30 minutes to 2 hours. You can use the full available time or end earlier if you feel you\'ve achieved your goals.'
        },
        {
          q: 'Is it safe?',
          a: 'Yes! Our clients\' safety is our priority. We provide full protective equipment, including face shields, coveralls or jackets, and gloves. Our staff supervises the session to ensure you have safe and exciting fun.'
        },
        {
          q: 'Can I organize a private event, such as a birthday or company party?',
          a: 'Of course! We organize private events for groups, including birthdays, team building events, and other special occasions. Contact us to book a date and customize details to your needs.'
        },
        {
          q: 'Can I come alone, or do I need a group?',
          a: 'We welcome both individuals and groups. Our packages are flexible and adapted to different numbers of participants.'
        },
        {
          q: 'Can I bring my own objects to destroy?',
          a: 'Yes, you can bring your own objects, but they must meet our safety standards. Contact us in advance to ensure your items are suitable for destruction.'
        },
        {
          q: 'How can I book a session?',
          a: 'Reservations can only be made online through our website. We recommend booking in advance to guarantee availability on your preferred date.'
        },
        {
          q: 'What is the price of a session?',
          a: 'Prices depend on the chosen package and number of participants. You can find detailed pricing in the "Offer" section on our website. We also offer discounts for larger groups and special occasions.'
        }
      ]
    },
    blog: {
      title: 'Our Blog',
      subtitle: 'Latest articles and insights',
      stressAtWork: {
        title: 'How to Deal with Stress at Work',
        subtitle: 'Effective strategies for managing workplace stress',
        date: '2025-02-09',
        author: 'Anna Kowalska',
        readTime: '5 min read',
        content: `Stress at work is a common issue that affects many professionals. Understanding how to manage it effectively is crucial for maintaining both mental and physical health.

In today's fast-paced work environment, it's essential to recognize the signs of stress and take proactive steps to address them. Some common symptoms include difficulty concentrating, irritability, and physical tension.

One effective way to combat workplace stress is through physical activity. This is where our smash room comes in - it provides a unique and cathartic way to release tension and frustration in a safe, controlled environment.

Regular breaks and stress-relief activities are crucial for maintaining productivity and mental well-being. Our smash room sessions offer a perfect opportunity to take a break from work and release built-up tension in a fun and therapeutic way.

Remember, it's not just about destroying things - it's about giving yourself permission to let go of stress and negative emotions in a healthy, controlled manner. Our trained staff ensures that every session is both safe and therapeutic.

We've seen numerous professionals benefit from regular smash room sessions as part of their stress management routine. It's an unconventional but effective approach to dealing with workplace stress.`
      }
    },
    voucher: {
      title: 'GIFT IDEA',
      description: 'Looking for a unique gift? Give the gift of stress relief with our Rage Room vouchers!',
      benefits: [
        'Valid for 3 months',
        'Can be used for any package',
        'Personalized message option',
        'Digital or physical delivery'
      ],
      cta: 'Get a Voucher'
    },
    happyHours: {
      title: 'Happy Hours',
      schedule: 'Monday to Friday, 11:00 - 16:00',
      discounts: [
        '20% off on all packages',
        'Free protective gear rental',
        'Complimentary photos of your session'
      ],
      cta: 'Book Happy Hour Session'
    },
    social: {
      followUs: 'Follow Us'
    },
    partners: {
      title: 'PARTNERS'
    },
    common: {
      close: 'Close',
      viewServices: 'View Services'
    }
  },
  pl: {
    nav: {
      home: 'Strona Główna',
      services: 'Usługi',
      contact: 'Kontakt',
      blog: 'Blog',
      faq: 'FAQ'
    },
    hero: {
      title: 'SMASH & FUN',
      subtitle: 'Uwolnij Stres w Stylu',
      cta: 'Zarezerwuj',
    },
    features: {
      title: 'Dlaczego My?',
    },
    services: {
      title: 'Usługi',
      subtitle: 'Wybierz swój pakiet destrukcji',
      book: 'Zarezerwuj',
      gift: 'Karta Podarunkowa',
      promo: 'Promocja',
      additionalItems: {
        title: 'Dodatkowe Przedmioty',
        items: [
          'Dodatkowe szklane przedmioty (5 szt.) - 50 PLN',
          'Dodatkowy sprzęt RTV i AGD (1 szt.) - 100 PLN',
          'Dodatkowe meble (1 szt.) - 150 PLN',
          'Nagranie wideo - 50 PLN'
        ]
      },
      descriptions: {
        pieceCake: {
          title: 'BUŁKA Z MASŁEM',
          duration: '30 min',
          items: ['Podstawowe elementy szklane', 'Sprzęt ochronny', 'Idealne dla początkujących']
        },
        easy: {
          title: 'ŁATWY',
          duration: '1 godzina',
          items: ['Więcej elementów szklanych', 'Podstawowe meble', 'Sprzęt ochronny', 'Dobre na odstresowanie']
        },
        medium: {
          title: 'ŚREDNI',
          duration: '2 godziny',
          items: ['Dużo elementów szklanych', 'Kilka mebli', 'Elektronika', 'Sprzęt ochronny', 'Nasz najpopularniejszy wybór']
        },
        hard: {
          title: 'TRUDNY',
          duration: '2 godziny',
          items: ['Maksymalna ilość szkła', 'Duże meble', 'Różnorodna elektronika', 'Sprzęt ochronny', 'Dla maksymalnej destrukcji']
        }
      },
      packages: {
        hard: {
          title: 'TRUDNY',
          items: {
            title: 'DO ZDEMOLOWANIA',
            list: [
              '35 szklanych przedmiotów',
              '5 meble',
              '8 sprzętów RTV i AGD',
              '10 mniejszych sprzętów RTV i AGD'
            ]
          },
          tools: {
            title: 'NARZĘDZIA',
            list: [
              'ubranie',
              'kask',
              'rękawice'
            ]
          },
          details: '1-6 osób/do 180 min',
          price: '999 PLN'
        },
        medium: {
          title: 'ŚREDNI',
          items: {
            title: 'DO ZDEMOLOWANIA',
            list: [
              '30 szklanych przedmiotów',
              '3 meble',
              '5 sprzętów RTV i AGD'
            ]
          },
          tools: {
            title: 'NARZĘDZIA',
            list: [
              'ubranie',
              'kask',
              'rękawice'
            ]
          },
          details: '1-4 osoby/do 120 min',
          price: '499 PLN'
        },
        easy: {
          title: 'ŁATWY',
          items: {
            title: 'DO ZDEMOLOWANIA',
            list: [
              '25 szklanych przedmiotów',
              '2 meble',
              '3 sprzęty RTV i AGD'
            ]
          },
          tools: {
            title: 'NARZĘDZIA',
            list: [
              'ubranie',
              'kask',
              'rękawice'
            ]
          },
          details: '1-2 osoby/do 45 min',
          price: '299 PLN'
        },
        beginner: {
          title: 'BUŁKA Z MASŁEM',
          items: {
            title: 'DO ZDEMOLOWANIA',
            list: [
              '25 szklanych przedmiotów'
            ]
          },
          tools: {
            title: 'NARZĘDZIA',
            list: [
              'ubranie',
              'kask',
              'rękawice'
            ]
          },
          details: '1-2 osoby/do 30 min',
          price: '199 PLN'
        }
      },
      booking: {
        title: 'Zarezerwuj Sesję',
        description: 'Gotowy na uwolnienie stresu? Zarezerwuj swoją sesję już teraz!',
        cta: 'Zarezerwuj',
        form: {
          name: 'Twoje Imię',
          email: 'Email',
          phone: 'Numer Telefonu',
          date: 'Preferowana Data',
          time: 'Preferowana Godzina',
          package: 'Wybierz Pakiet',
          submit: 'Zarezerwuj Sesję'
        }
      },
      giftCard: {
        title: 'Karta Podarunkowa',
        description: 'Podaruj prezent w postaci sesji odstresowującej',
        cta: 'Kup Voucher',
        options: {
          title: 'Wybierz Rodzaj Vouchera',
          monetary: 'Voucher Wartościowy',
          package: 'Voucher Pakietowy'
        }
      },
      promos: {
        title: 'Promocje',
        description: 'Sprawdź nasze aktualne promocje',
        groupDiscount: 'Zniżka Grupowa: 10% dla grup 4+',
        studentDiscount: 'Zniżka Studencka: 15% z ważną legitymacją',
        weekdaySpecial: 'Promocja w Dni Powszednie: 20% zniżki na poranne sesje'
      },
    },
    contact: {
      title: 'Kontakt',
      address: 'Adres',
      phone: 'Telefon',
      email: 'Email',
    },
    reviews: {
      title: 'Co Mówią Nasi Klienci',
      viewMore: 'Zobacz więcej opinii na Google',
    },
    cta: {
      title: 'Gotowy na Uwolnienie Stresu?',
      subtitle: 'Dołącz do tysięcy zadowolonych klientów, którzy doświadczyli najlepszego sposobu na odstresowanie',
      button: 'Zarezerwuj Swoją Sesję Teraz'
    },
    faq: {
      title: 'Często Zadawane Pytania',
      questions: [
        {
          q: 'Czym jest Rage Room?',
          a: 'Rage Room to miejsce, gdzie możesz nie tylko wyładować stres, ale także doświadczyć nowych emocji i rozrywki, niszcząc przedmioty w kontrolowanym środowisku. Od mebli po elektronikę – wszystko jest do Twojej dyspozycji, aby zapewnić Ci pełną satysfakcję z demolki!'
        },
        {
          q: 'Jakie przedmioty mogę niszczyć?',
          a: 'Oferujemy szeroki wybór przedmiotów do zniszczenia, w tym meble, szkło, elektronikę, a nawet specjalnie przygotowane rekwizyty. Z każdym pakietem dostajesz różnorodne obiekty, a jeśli masz specjalne życzenia, chętnie je omówimy!'
        },
        {
          q: 'Czy muszę mieć wcześniejsze doświadczenie?',
          a: 'Nie, demolka nie wymaga żadnych umiejętności! Każdy może wziąć udział, niezależnie od poziomu doświadczenia. Przed sesją zapewniamy pełen instruktaż oraz niezbędny sprzęt ochronny.'
        },
        {
          q: 'Jak długo trwa sesja?',
          a: 'Czas trwania sesji zależy od wybranego pakietu i może wynosić od 30 minut do 2 godzin. Możecie wykorzystać pełny dostępny czas lub zakończyć wcześniej, jeśli uznacie, że osiągnęliście swoje cele.'
        },
        {
          q: 'Czy to bezpieczne?',
          a: 'Tak! Bezpieczeństwo naszych klientów jest naszym priorytetem. Zapewniamy pełny sprzęt ochronny, w tym przyłbice ochronne, kombinezony lub kurtki oraz rękawice. Nasz personel czuwa nad przebiegiem sesji, aby zapewnić Wam bezpieczną i ekscytującą zabawę.'
        },
        {
          q: 'Czy mogę zorganizować prywatne wydarzenie, takie jak urodziny czy impreza firmowa?',
          a: 'Oczywiście! Organizujemy prywatne eventy dla grup, w tym urodziny, imprezy integracyjne i inne wydarzenia specjalne. Skontaktuj się z nami, aby zarezerwować termin i dostosować szczegóły do Twoich potrzeb.'
        },
        {
          q: 'Czy mogę przyjść sam/a, czy potrzebuję grupy?',
          a: 'Zapraszamy zarówno osoby indywidualne, jak i grupy. Nasze pakiety są elastyczne i dopasowane do różnych liczebności uczestników.'
        },
        {
          q: 'Czy mogę przynieść własne przedmioty do zniszczenia?',
          a: 'Tak, możesz przynieść własne przedmioty, jednak muszą one spełniać nasze standardy bezpieczeństwa. Skontaktuj się z nami wcześniej, aby upewnić się, że Twoje przedmioty są odpowiednie do zniszczenia.'
        },
        {
          q: 'Jak mogę zarezerwować sesję?',
          a: 'Rezerwacji można dokonać wyłącznie online za pośrednictwem naszej strony internetowej. Polecamy wcześniejszą rezerwację, aby zagwarantować dostępność w wybranym terminie.'
        },
        {
          q: 'Jaka jest cena sesji?',
          a: 'Ceny zależą od wybranego pakietu oraz liczby uczestników. Szczegółowy cennik znajdziesz w zakładce "Oferta" na naszej stronie internetowej. Oferujemy także zniżki na większe grupy i specjalne okazje.'
        }
      ]
    },
    blog: {
      title: 'Blog',
      readMore: 'Czytaj więcej',
      backToBlog: 'Powrót do Bloga',
      stressAtWork: {
        title: 'Stres w pracy – jak się go pozbyć?',
        excerpt: 'Życie jest generalnie stresujące, ale stres związany z pracą może być szczególnie trudny. Odkryj, jak nasz Pokój Złości może pomóc Ci zarządzać i uwolnić stres związany z pracą w bezpiecznym i kontrolowanym środowisku.',
        content: 'W dzisiejszym szybko zmieniającym się świecie, stres w miejscu pracy stał się coraz bardziej powszechnym wyzwaniem, które dotyka miliony ludzi. Od napiętych terminów po trudnych współpracowników, źródła stresu wydają się być nieskończone. A co, gdyby istniał unikalny i skuteczny sposób na uwolnienie całego tego napięcia?\n\nNasz Pokój Złości oferuje rewolucyjne podejście do zarządzania stresem. Zamiast tłumić swoje frustracje lub zabierać je do domu, możesz je uwolnić w kontrolowanym, bezpiecznym środowisku. Akt fizycznego niszczenia rzeczy wyzwala uwalnianie endorfin - naturalnych środków przeciwstresowych twojego organizmu.\n\nOto jak nasz Pokój Złości pomaga w walce ze stresem w pracy:\n\n1. Uwolnienie fizyczne: Akt rozbijania przedmiotów zapewnia natychmiastowe fizyczne ujście dla nagromadzonych frustracji.\n\n2. Katharsis emocjonalne: Wyrażaj swoje emocje swobodnie bez osądzania i konsekwencji.\n\n3. Reset stresu: Wyjdź czując się lżej i bardziej zrównoważony, gotowy do stawienia czoła wyzwaniom w pracy z odnowioną energią.\n\n4. Czynnik zabawy: Przekształć redukcję stresu w przyjemne doświadczenie - kto by pomyślał, że niszczenie rzeczy może być tak terapeutyczne?\n\nPamiętaj, że choć nasz Pokój Złości zapewnia doskonałe ujście dla stresu, ważne jest również zajęcie się podstawowymi przyczynami stresu w pracy. Rozważ połączenie sesji w Pokoju Złości z innymi technikami zarządzania stresem, takimi jak medytacja, ćwiczenia czy profesjonalne poradnictwo.\n\nGotowy wypróbować to unikalne podejście do redukcji stresu? Zarezerwuj swoją sesję już dziś i doświadcz terapeutycznych korzyści naszego Pokoju Złości na własnej skórze.'
      }
    },
    voucher: {
      title: 'POMYSŁ NA PREZENT',
      description: 'Szukasz wyjątkowego prezentu? Podaruj voucher do Pokoju Złości!',
      benefits: [
        'Ważny przez 3 miesiące',
        'Można wykorzystać na dowolny pakiet',
        'Możliwość personalizacji wiadomości',
        'Dostawa cyfrowa lub fizyczna'
      ],
      cta: 'Zdobądź Voucher'
    },
    happyHours: {
      title: 'Happy Hours',
      schedule: 'Monday to Friday, 11:00 - 16:00',
      discounts: [
        '20% off on all packages',
        'Free protective gear rental',
        'Complimentary photos of your session'
      ],
      cta: 'Book Happy Hour Session'
    },
    social: {
      followUs: 'Obserwuj nas'
    },
    partners: {
      title: 'PARTNERZY'
    },
    common: {
      close: 'Zamknij',
      viewServices: 'Zobacz Usługi'
    }
  },
};