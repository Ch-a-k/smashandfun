import { Translations } from './types';

export const translations: Record<string, Translations> = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      blog: 'Blog',
      faq: 'FAQ',
      contact: 'Contact'
    },
    hero: {
      title: 'SMASH & FUN',
      subtitle: 'Release Your Stress in Style',
      cta: 'Book Now'
    },
    features: {
      title: 'Why Choose Us?'
    },
    services: {
      title: 'Services',
      subtitle: 'Choose your rage package',
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
      }
    },
    reviews: {
      title: 'What Our Clients Say',
      viewMore: 'View More Reviews'
    },
    cta: {
      title: 'Ready to Release Your Stress?',
      subtitle: 'Join thousands of satisfied customers who have experienced the ultimate stress relief'
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions',
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
        }
      ]
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'Have questions? We\'re here to help!',
      name: 'Your Name',
      email: 'Your Email',
      phone: 'Phone',
      address: 'Address',
      message: 'Your Message',
      submit: 'Send Message'
    },
    common: {
      close: 'Close',
      viewServices: 'View Services'
    },
    happyHours: {
      title: 'Happy Hours',
      schedule: 'Monday - Friday, 11:00 - 16:00',
      discounts: [
        '20% off all packages',
        'Free protective gear rental',
        'Complimentary session photos'
      ],
      cta: 'Book Happy Hour Session'
    },
    blog: {
      title: 'Blog',
      subtitle: 'Latest articles and insights',
      readMore: 'Read More',
      backToBlog: 'Back to Blog',
      stressAtWork: {
        title: 'How to Deal with Stress at Work',
        subtitle: 'Effective strategies for managing workplace stress',
        date: '2025-02-09',
        author: 'John Smith',
        readTime: '5 min read',
        excerpt: 'Life is generally stressful, but work-related stress can be particularly challenging. Discover how our Rage Room can help you manage and release work-related stress in a safe and controlled environment.',
        content: `Stress at work is a common issue that affects many professionals. Understanding how to manage it effectively is crucial for maintaining both mental and physical health.

In today's fast-paced work environment, it's essential to recognize the signs of stress and take proactive steps to address them. Some common symptoms include difficulty concentrating, irritability, and physical tension.

One effective way to combat workplace stress is through physical activity. This is where our smash room comes in - it provides a unique and cathartic way to release tension and frustration in a safe, controlled environment.

Regular breaks and stress-relief activities are crucial for maintaining productivity and mental well-being. Our smash room sessions offer a perfect opportunity to take a break from work and release built-up tension in a fun and therapeutic way.

Remember, it's not just about breaking things - it's about giving yourself permission to release stress and negative emotions in a healthy, controlled way. Our trained staff ensures that each session is both safe and therapeutic.

We've seen numerous professionals benefit from regular smash room sessions as part of their stress management routine. It's an unconventional but effective approach to dealing with workplace stress.`
      }
    },
    social: {
      followUs: 'Follow Us'
    },
    partners: {
      title: 'PARTNERS'
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
    }
  },
  pl: {
    nav: {
      home: 'Strona Główna',
      services: 'Usługi',
      blog: 'Blog',
      faq: 'FAQ',
      contact: 'Kontakt'
    },
    hero: {
      title: 'SMASH & FUN',
      subtitle: 'Uwolnij Stres w Stylu',
      cta: 'Zarezerwuj'
    },
    features: {
      title: 'Dlaczego My?'
    },
    services: {
      title: 'Usługi',
      subtitle: 'Wybierz swój pakiet złości',
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
        description: 'Podaruj prezent w postaci uwolnienia od stresu',
        cta: 'Kup Voucher',
        options: {
          title: 'Wybierz Rodzaj Vouchera',
          monetary: 'Voucher Kwotowy',
          package: 'Voucher Pakietowy'
        }
      },
      promos: {
        title: 'Oferty Specjalne',
        description: 'Sprawdź nasze aktualne promocje',
        groupDiscount: 'Zniżka Grupowa: 10% dla grup 4+',
        studentDiscount: 'Zniżka Studencka: 15% z ważną legitymacją',
        weekdaySpecial: 'Promocja w Dni Robocze: 20% zniżki na poranne sesje'
      },
      packages: {
        hard: {
          title: 'TRUDNY',
          items: {
            title: 'DO ZNISZCZENIA',
            list: [
              '35 przedmiotów szklanych',
              '5 mebli',
              '8 elektroniki',
              '10 mniejszej elektroniki'
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
            title: 'DO ZNISZCZENIA',
            list: [
              '30 przedmiotów szklanych',
              '3 meble',
              '5 elektroniki'
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
            title: 'DO ZNISZCZENIA',
            list: [
              '25 przedmiotów szklanych',
              '2 meble',
              '3 elektroniki'
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
          title: 'POCZĄTKUJĄCY',
          items: {
            title: 'DO ZNISZCZENIA',
            list: [
              '25 przedmiotów szklanych'
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
      }
    },
    reviews: {
      title: 'Co Mówią Nasi Klienci',
      viewMore: 'Zobacz Więcej Opinii'
    },
    cta: {
      title: 'Gotowy na Uwolnienie Stresu?',
      subtitle: 'Dołącz do tysięcy zadowolonych klientów'
    },
    faq: {
      title: 'Często Zadawane Pytania',
      subtitle: 'Znajdź odpowiedzi na popularne pytania',
      questions: [
        {
          q: 'Co to jest Pokój Złości?',
          a: 'Pokój Złości to miejsce, gdzie możesz nie tylko uwolnić stres, ale także doświadczyć nowych emocji i rozrywki poprzez niszczenie przedmiotów w kontrolowanym środowisku. Od mebli po elektronikę – wszystko jest do Twojej dyspozycji, aby zapewnić Ci pełną satysfakcję z demolki!'
        },
        {
          q: 'Jakie przedmioty mogę zniszczyć?',
          a: 'Oferujemy szeroki wybór przedmiotów do zniszczenia, w tym meble, szkło, elektronikę, a nawet specjalnie przygotowane rekwizyty. Z każdym pakietem otrzymujesz różne przedmioty, a jeśli masz specjalne życzenia, chętnie je omówimy!'
        },
        {
          q: 'Czy potrzebuję wcześniejszego doświadczenia?',
          a: 'Nie, demolka nie wymaga żadnych umiejętności! Każdy może uczestniczyć, niezależnie od poziomu doświadczenia. Przed sesją zapewniamy pełne instrukcje i niezbędny sprzęt ochronny.'
        },
        {
          q: 'Jak długo trwa sesja?',
          a: 'Czas trwania sesji zależy od wybranego pakietu i może wynosić od 30 minut do 2 godzin. Możesz wykorzystać cały dostępny czas lub zakończyć wcześniej, jeśli czujesz, że osiągnąłeś swoje cele.'
        }
      ]
    },
    contact: {
      title: 'Kontakt',
      subtitle: 'Masz pytania? Jesteśmy tu, aby pomóc!',
      name: 'Twoje Imię',
      email: 'Twój Email',
      phone: 'Telefon',
      address: 'Adres',
      message: 'Twoja Wiadomość',
      submit: 'Wyślij Wiadomość'
    },
    common: {
      close: 'Zamknij',
      viewServices: 'Zobacz Usługi'
    },
    happyHours: {
      title: 'Happy Hours',
      schedule: 'Poniedziałek - Piątek, 11:00 - 16:00',
      discounts: [
        '20% zniżki na wszystkie pakiety',
        'Darmowy wynajem sprzętu ochronnego',
        'Darmowe zdjęcia z sesji'
      ],
      cta: 'Zarezerwuj Sesję w Happy Hours'
    },
    blog: {
      title: 'Blog',
      subtitle: 'Najnowsze artykuły i porady',
      readMore: 'Czytaj więcej',
      backToBlog: 'Powrót do Bloga',
      stressAtWork: {
        title: 'Jak Radzić Sobie ze Stresem w Pracy',
        subtitle: 'Skuteczne strategie zarządzania stresem w miejscu pracy',
        date: '2025-02-09',
        author: 'Anna Kowalska',
        readTime: '5 min czytania',
        excerpt: 'Życie jest generalnie stresujące, ale stres związany z pracą może być szczególnie trudny. Odkryj, jak nasz Pokój Złości może pomóc Ci zarządzać i uwolnić stres związany z pracą w bezpiecznym i kontrolowanym środowisku.',
        content: `Stres w pracy to powszechny problem, który dotyka wielu profesjonalistów. Zrozumienie, jak skutecznie nim zarządzać, jest kluczowe dla zachowania zdrowia psychicznego i fizycznego.

W dzisiejszym szybkim środowisku pracy ważne jest rozpoznawanie oznak stresu i podejmowanie proaktywnych kroków, aby się z nimi zmierzyć. Niektóre częste objawy to trudności z koncentracją, drażliwość i napięcie fizyczne.

Jednym ze skutecznych sposobów walki ze stresem w miejscu pracy jest aktywność fizyczna. Tutaj właśnie wkracza nasz pokój złości - zapewnia on unikalny i katartyczny sposób na uwolnienie napięcia i frustracji w bezpiecznym, kontrolowanym środowisku.

Regularne przerwy i aktywności redukujące stres są kluczowe dla utrzymania produktywności i dobrego samopoczucia psychicznego. Nasze sesje w pokoju złości oferują doskonałą okazję do zrobienia przerwy w pracy i uwolnienia nagromadzonego napięcia w zabawny i terapeutyczny sposób.

Pamiętaj, nie chodzi tylko o niszczenie rzeczy - chodzi o danie sobie pozwolenia na uwolnienie stresu i negatywnych emocji w zdrowy, kontrolowany sposób. Nasz przeszkolony personel dba o to, aby każda sesja była zarówno bezpieczna, jak i terapeutyczna.

Widzieliśmy wielu profesjonalistów, którzy czerpią korzyści z regularnych sesji w pokoju złości jako części swojej rutyny zarządzania stresem. To niekonwencjonalne, ale skuteczne podejście do radzenia sobie ze stresem w miejscu pracy.`
      }
    },
    social: {
      followUs: 'Obserwuj Nas'
    },
    partners: {
      title: 'PARTNERZY'
    },
    voucher: {
      title: 'POMYSŁ NA PREZENT',
      description: 'Szukasz wyjątkowego prezentu? Podaruj voucher na sesję w Pokoju Złości!',
      benefits: [
        'Ważny przez 3 miesiące',
        'Może być wykorzystany na dowolny pakiet',
        'Możliwość personalizacji wiadomości',
        'Dostawa cyfrowa lub fizyczna'
      ],
      cta: 'Zdobądź Voucher'
    }
  }
};