export interface FAQ {
  q: string;
  a: string;
}

export interface BlogPost {
  title: string;
  subtitle: string;
  date: string;
  author: string;
  content: string;
  readTime: string;
  excerpt: string;
}

export interface ServicePackage {
  title: string;
  items: {
    title: string;
    list: string[];
  };
  tools: {
    title: string;
    list: string[];
  };
  details: string;
  price: string;
}

export interface Translations {
  nav: {
    home: string;
    services: string;
    blog: string;
    faq: string;
    contact: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  features: {
    title: string;
  };
  reviews: {
    title: string;
    viewMore: string;
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  faq: {
    title: string;
    subtitle: string;
    questions: FAQ[];
  };
  contact: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    message: string;
    submit: string;
  };
  common: {
    close?: string;
    viewServices: string;
  };
  happyHours: {
    title: string;
    schedule: string;
    discounts: string[];
    cta: string;
  };
  blog: {
    title: string;
    subtitle: string;
    readMore: string;
    backToBlog: string;
    stressAtWork: BlogPost;
  };
  services: {
    title: string;
    subtitle: string;
    booking: {
      title: string;
      description: string;
      cta: string;
      form: {
        name: string;
        email: string;
        phone: string;
        date: string;
        time: string;
        package: string;
        submit: string;
      };
    };
    giftCard: {
      title: string;
      description: string;
      cta: string;
      options: {
        title: string;
        monetary: string;
        package: string;
      };
    };
    promos: {
      title: string;
      description: string;
      groupDiscount: string;
      studentDiscount: string;
      weekdaySpecial: string;
    };
    packages: {
      hard: ServicePackage;
      medium: ServicePackage;
      easy: ServicePackage;
      beginner: ServicePackage;
    };
  };
  social: {
    followUs: string;
    facebook: string;
    instagram: string;
    twitter: string;
  };
  partners: {
    title: string;
  };
  voucher: {
    title: string;
    description: string;
    benefits: string[];
    cta: string;
  };
}
