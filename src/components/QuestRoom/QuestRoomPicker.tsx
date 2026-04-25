"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabaseClient';
import { PackageCard, type Package } from '@/components/PackageCard';
import { QUEST_ROOM_UTM_QUERY } from '@/lib/questRoomUtm';

const ALLOWED_PACKAGE_NAMES = new Set([
  'BUŁKA Z MASŁEM',
  'ŁATWY',
  'ŚREDNI',
  'TRUDNY',
]);

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
  position?: number;
}

export function QuestRoomPicker() {
  const { t } = useI18n();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchPackages() {
      setLoading(true);
      const { data } = await supabase
        .from('packages')
        .select('*')
        .order('position', { ascending: true })
        .returns<PackageDB[]>();
      if (cancelled) return;
      if (data) {
        setPackages(
          data
            .filter((p) =>
              ALLOWED_PACKAGE_NAMES.has((p.name || '').trim().toUpperCase()),
            )
            .slice(0, 4)
            .map((p) => ({
              id: p.id,
              name: p.name,
              items: p.items || [],
              tools: p.tools || [],
              people: p.people || (p.people_count ? `${p.people_count} osób` : ''),
              duration: p.duration || '',
              price: p.price || '',
              bookingUrl: p.bookingurl || '',
              isBestseller: p.isBestseller || false,
            })),
        );
      }
      setLoading(false);
    }
    fetchPackages();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative w-full bg-[#231f20] py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 30%, rgba(243,110,33,0.12), transparent 60%)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <p className="text-[#f36e21] font-impact tracking-widest uppercase text-sm mb-3">
            {t('questRoom.picker.eyebrow')}
          </p>
          <h2 className="text-3xl md:text-5xl font-impact text-white leading-tight mb-4">
            {t('questRoom.picker.title')}
          </h2>
          <p className="text-white/65 text-lg">{t('questRoom.picker.subtitle')}</p>
        </motion.div>

        {loading ? (
          <div className="text-white/60 text-center py-20 text-lg">Ładowanie pakietów...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {packages.map((pkg) => (
              <div key={pkg.id} className="h-full min-h-[440px] flex">
                <PackageCard pkg={pkg} bookingQuery={QUEST_ROOM_UTM_QUERY} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
