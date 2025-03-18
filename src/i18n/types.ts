export interface Translations {
  common: {
    readMore: string;
    bookNow: string;
    minutes: string;
    learnMore: string;
    close: string;
    save: string;
    cancel: string;
    accept: string;
    reject: string;
    settings: string;
  };
  happyHours: {
    title: string;
    subtitle: string;
    schedule: {
      title: string;
      weekdays: string;
      time: string;
      discount: string;
    };
    benefits: string[];
    cta: string;
  };
  nav: {
    home: string;
    organizeParty: string;
    blog: string;
    faq: string;
    contact: string;
  };
  home: {
    hero: {
      title: string;
      subtitle: string;
      description: string;
      cta: string;
    };
    pricing: {
      title: string;
      toDestroy: string;
      tools: string;
      bestSeller: string;
      more: string;
      bookNow: string;
      additionalItems: {
        title: string;
        subtitle: string;
        items: {
          glass: string;
          furniture: string;
          electronic: string;
          gloves: string;
        };
      };
      extraItems: {
        title: string;
        subtitle: string;
        items: {
          glass: string;
          keyboard: string;
          tvMonitor: string;
          furniture: string;
          printer: string;
          mouse: string;
          phone: string;
          goProRecording: string;
        };
      };
      packages: {
        easy: {
          name: string;
          items: string[];
          difficulty: string;
        };
        medium: {
          name: string;
          items: string[];
          difficulty: string;
        };
        hard: {
          name: string;
          items: string[];
          difficulty: string;
        };
        extreme: {
          name: string;
          items: string[];
          difficulty: string;
        };
      };
      people: {
        '1-2': string;
        '1-4': string;
        '1-6': string;
      };
      duration: {
        '30': string;
        '45': string;
        '120': string;
        '180': string;
      };
      equipment: {
        included: string;
        items: {
          ubranie: string;
          kask: string;
          rękawice: string;
        };
        tooltips: {
          ubranie: string;
          kask: string;
          rękawice: string;
        };
      };
    };
    lounge: {
      title: string;
      subtitle: string;
      description: string;
      features: {
        sofa: {
          title: string;
          description: string;
        };
        coffee: {
          title: string;
          description: string;
        };
        music: {
          title: string;
          description: string;
        };
        tv: {
          title: string;
          description: string;
        };
      };
    };
    voucher: {
      title: string;
      subtitle: string;
      description: string;
      cta: string;
      benefits: string[];
    };
    reviews: {
      title: string;
      subtitle: string;
      description: string;
    };
    partners: {
      title: string;
      subtitle: string;
      'wyjatkowy-prezent': {
        name: string;
        description: string;
      };
      'super-prezenty': {
        name: string;
        description: string;
      };
    };
  };
  blog: {
    hero: {
      title: string;
      subtitle: string;
    };
    readTime: string;
    ctaSection: {
      title: string;
      subtitle: string;
      cta: string;
    };
  };
  contact: {
    hero: {
      title: string;
      subtitle: string;
    };
    form: {
      title: string;
      name: {
        label: string;
        placeholder: string;
      };
      email: {
        label: string;
        placeholder: string;
      };
      phone: {
        label: string;
        placeholder: string;
      };
      subject: {
        label: string;
        placeholder: string;
      };
      message: {
        label: string;
        placeholder: string;
      };
      submit: string;
      success: string;
      error: string;
    };
    info: {
      title: string;
      address: {
        title: string;
        line1: string;
        line2: string;
      };
      phone: {
        title: string;
        number: string;
      };
      email: {
        title: string;
        address: string;
      };
      openingHours: {
        title: string;
        weekdays: string;
        weekend: string;
      };
    };
  };
  faq: {
    hero: {
      title: string;
      subtitle: string;
    };
    categories: {
      general: {
        title: string;
        items: Array<{
          question: string;
          answer: string;
        }>;
      };
      booking: {
        title: string;
        items: Array<{
          question: string;
          answer: string;
        }>;
      };
      safety: {
        title: string;
        items: Array<{
          question: string;
          answer: string;
        }>;
      };
      payment: {
        title: string;
        items: Array<{
          question: string;
          answer: string;
        }>;
      };
    };
    cta: {
      title: string;
      description: string;
      email: string;
      button: string;
    };
  };
  organizeParty: {
    hero: {
      title: string;
      subtitle: string;
    };
    events: {
      party: {
        title: string;
        description: string;
      };
      corporate: {
        title: string;
        description: string;
      };
      kids: {
        title: string;
        description: string;
      };
    };
    services: {
      title: string;
      items: {
        planning: {
          title: string;
          description: string;
        };
        catering: {
          title: string;
          description: string;
        };
        music: {
          title: string;
          description: string;
        };
      };
    };
  };
  terms: {
    title: string;
    companyInfo: {
      name: string;
      address: string;
      city: string;
      validFrom: string;
    };
    sections: {
      general: {
        title: string;
        content: string[];
      };
      reservations: {
        title: string;
        content: string[];
      };
      responsibility: {
        title: string;
        content: string[];
      };
      complaints: {
        title: string;
        content: string[];
      };
      final: {
        title: string;
        content: string[];
      };
    };
    footer: string;
  };
  privacyPolicy: {
    title: string;
    lastUpdated: string;
    sections: {
      general: {
        title: string;
        content: string[];
      };
      dataCollection: {
        title: string;
        content: string[];
      };
      dataUsage: {
        title: string;
        content: string[];
      };
      cookies: {
        title: string;
        content: string[];
      };
      rights: {
        title: string;
        content: string[];
      };
    };
  };
  cookies: {
    banner: {
      text: string;
      settings: string;
      acceptAll: string;
      rejectAll: string;
    };
    modal: {
      title: string;
      necessary: {
        title: string;
        description: string;
      };
      analytics: {
        title: string;
        description: string;
      };
      marketing: {
        title: string;
        description: string;
      };
      save: string;
      cancel: string;
    };
  };
  errors: {
    general: string;
    notFound: string;
    serverError: string;
    validation: {
      required: string;
      email: string;
      phone: string;
      minLength: string;
      maxLength: string;
    };
  };
}
