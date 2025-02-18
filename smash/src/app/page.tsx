"use client";

import Header from '../components/Header'
import Footer from '../components/Footer'
import { HeroSection } from '../components/HeroSection'
import { PricingSection } from '../components/PricingSection'
import { LoungeSection } from '../components/LoungeSection'
import { VoucherSection } from '../components/VoucherSection'
import { ReviewsSection } from '../components/ReviewsSection';
import { PartnersSection } from '../components/PartnersSection';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <section id="services" className="relative w-full bg-gradient-to-b from-[#1a1718] to-[#231f20] py-32">
          {/* Decorative line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
          <PricingSection />
        </section>
        <LoungeSection />
        <VoucherSection />
        <ReviewsSection />
        <PartnersSection />
      </main>
      <Footer />
    </div>
  )
}
