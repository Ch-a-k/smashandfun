"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { FloatingImages } from '@/components/FloatingImages';
import { ExtraItemsSection } from '@/components/ExtraItemsSection';
import InFomoFooterButton from '@/components/InFomoFooterButton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PackageCard, type Package } from '@/components/PackageCard';

interface PackageDB {
  id: string;
  name: string;
  items: string[];
  tools: string[];
  people_count: number;
  people: string;
  duration: string;
  price: string;
  bookingurl: string;
  isBestseller?: boolean;
}

const sectionAnimation = {
  initial: { opacity: 0, y: -20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="text-center mb-24">
      <motion.div {...sectionAnimation} className="inline-block">
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          {title}
        </h2>
        <div className="flex justify-center mt-4">
          <div className="h-1 w-12 bg-gradient-to-r from-[#f36e21] to-[#ff9f58] rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}

export default function RezerwacjaPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPackages() {
      setLoading(true);
      const { data } = await supabase
        .from('packages')
        .select('*')
        .order('position', { ascending: true })
        .returns<PackageDB[]>();
      console.log('Supabase data:', data);
      if (data) {
        const mapped = data.map((p) => ({
          id: p.id,
          name: p.name,
          items: p.items || [],
          tools: p.tools || [],
          people: p.people || (p.people_count ? `${p.people_count} osób` : ''),
          duration: p.duration || '',
          price: p.price || '',
          bookingUrl: p.bookingurl || '',
          isBestseller: p.isBestseller || false,
        }));
        console.log('Mapped packages:', mapped);
        setPackages(mapped);
      } else {
        setPackages([]);
      }
      setLoading(false);
    }
    fetchPackages();
  }, []);

  return (
    <>
    <Header />
    <section className="relative w-full bg-[#231f20] py-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" style={{ pointerEvents: 'none' }} />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#f36e21]/5 rounded-full blur-[150px]" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#231f20]/90 rounded-full blur-[150px]" />
      {/* Floating images */}
      <FloatingImages />
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <SectionTitle title="Wybierz pakiet i zarezerwuj termin" />
        {loading ? (
          <div className="text-white text-center py-20 text-xl">Ładowanie...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {packages.map((pkg) => (
              <div key={pkg.id} className="h-full min-h-[440px] flex">
                <PackageCard pkg={pkg} />
              </div>
            ))}
          </div>
        )}
      </div>
      <ExtraItemsSection />
      {/* IN-FOMO button */}
      <InFomoFooterButton />
    </section>
    <Footer />
    </>
  );
}
