"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HeroSection } from '@/components/OrganizeParty/HeroSection';
import { IntroSection } from '@/components/OrganizeParty/IntroSection';
import { EventsSection } from '@/components/OrganizeParty/EventsSection';
import { CTASection } from '@/components/OrganizeParty/CTASection';

export default function OrganizacjaImprez() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <IntroSection />
        <EventsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
