"use client";

import { useEffect } from 'react';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { HeroSection } from '@/components/HeroSection'
import { PricingSection } from '@/components/PricingSection'
import { LoungeSection } from '@/components/LoungeSection'
import { VoucherSection } from '@/components/VoucherSection'
import { ReviewsSection } from '@/components/ReviewsSection';
import { PartnersSection } from '@/components/PartnersSection';

const SCROLL_DELAY = 500;
const PRICING_HASH = '#pricing';

function useHashScroll() {
  useEffect(() => {
    const scrollToElement = (elementId: string) => {
      const element = document.getElementById(elementId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, SCROLL_DELAY);
      }
    };

    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === PRICING_HASH) {
        scrollToElement('pricing');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);

    return () => {
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);
}

export default function Home() {
  useHashScroll();

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <PricingSection />
        <LoungeSection />
        <VoucherSection />
        <ReviewsSection />
        <PartnersSection />
      </main>
      <Footer />
    </div>
  )
}
