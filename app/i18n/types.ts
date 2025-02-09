export interface FAQ {
  q: string;
  a: string;
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
    message: string;
    submit: string;
  };
  common: {
    viewServices: string;
  };
  happyHours: {
    title: string;
    schedule: string;
    discounts: string[];
    cta: string;
  };
}
