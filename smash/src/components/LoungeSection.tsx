"use client";

import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    title: "BEZPIECZENSTWO",
    description: "Ubrania ochronne, kaski i rękawice w cenie",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-4m0 2.18l7 3.12v4.7c0 4.38-2.85 8.51-7 9.79c-4.15-1.28-7-5.41-7-9.79V6.3l7-3.12Z"/>
      </svg>
    )
  },
  {
    title: "KONTSOLA PLAYSTATION",
    description: "Strefa relaksu z konsolą do gier",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <path fill="currentColor" d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h18v8zM6 15h2v-2h2v-2H8V9H6v2H4v2h2z"/>
      </svg>
    )
  },
  {
    title: "ŚRODKI HIGIENICZNE",
    description: "Wszystkie niezbędne środki higieniczne",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 2c-5.33 4.55-8 8.48-8 11.8c0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>
      </svg>
    )
  },
  {
    title: "NAGRYWANIE",
    description: "Nagrywanie i zdjęcia Twoich osiągnięć",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4Z"/>
      </svg>
    )
  }
];

export function LoungeSection() {
  return (
    <section className="relative w-full bg-gradient-to-b from-[#1a1718] to-[#231f20] py-32">
      {/* Декоративная линия */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block"
          >
            <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 mb-6">
              ZADBAMY O TO
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#f36e21]"></div>
              <div className="h-[2px] w-12 bg-[#f36e21]"></div>
              <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#f36e21]"></div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent 
                            backdrop-blur-sm border border-white/[0.08] p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-[#f36e21]/0 via-[#f36e21]/5 to-[#f36e21]/0 
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="relative flex items-start gap-6">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-[#f36e21] to-[#f36e21]/30
                                group-hover:from-[#f36e21]/80 group-hover:to-[#f36e21] transition-all duration-300">
                    <div className="text-white transform group-hover:scale-150 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-[#f36e21] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-white/60 group-hover:text-white/80 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Декоративная линия */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
    </section>
  );
}
