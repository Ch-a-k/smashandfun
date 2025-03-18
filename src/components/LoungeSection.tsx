"use client";

import React from "react";
import { motion } from "framer-motion";
import { useI18n } from '@/i18n/I18nContext'
import { Sofa, Coffee, Music, Tv } from 'lucide-react'

const features = [
  {
    icon: <Sofa className="w-6 h-6" />,
    key: 'sofa'
  },
  {
    icon: <Coffee className="w-6 h-6" />,
    key: 'coffee'
  },
  {
    icon: <Music className="w-6 h-6" />,
    key: 'music'
  },
  {
    icon: <Tv className="w-6 h-6" />,
    key: 'tv'
  }
];

export function LoungeSection() {
  const { t } = useI18n();

  return (
    <section className="relative w-full bg-gradient-to-b from-[#1a1718] to-[#231f20] py-6">
      {/* Декоративная линия */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Section heading */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block"
          >
            
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="h-full w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent 
                            backdrop-blur-sm border border-white/[0.08] p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-[#f36e21]/0 via-[#f36e21]/5 to-[#f36e21]/0 
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="relative flex items-start gap-6">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-[#f36e21] to-[#f36e21]/30
                                group-hover:from-[#f36e21]/80 group-hover:to-[#f36e21] transition-all duration-300">
                    <div className="text-white transform group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-[#f36e21] transition-colors">
                      {t(`home.lounge.features.${feature.key}.title`)}
                    </h3>
                    <p className="text-lg text-white/60 group-hover:text-white/80 transition-colors">
                      {t(`home.lounge.features.${feature.key}.description`)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-lg text-white/70 mt-12 max-w-3xl mx-auto"
        >
          {t('home.lounge.description')}
        </motion.p>
      </div>
      
      {/* Декоративная линия */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
    </section>
  );
}
