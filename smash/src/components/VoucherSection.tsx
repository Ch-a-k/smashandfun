"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export function VoucherSection() {
  return (
    <section className="relative w-full bg-gradient-to-b from-[#231f20] to-[#1a1718] py-32">
      {/* Декоративная линия */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Левая колонка с текстом */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative z-10">
              <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 mb-6">
                POMYSŁ NA PREZENT
              </h2>
              <div className="flex items-center gap-2 mb-8">
                <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#f36e21]"></div>
                <div className="h-[2px] w-12 bg-[#f36e21]"></div>
              </div>
              <p className="text-lg text-white/70 mb-12 leading-relaxed">
                Podaruj swoim bliskim niezapomniane emocje! Kup voucher na dowolny pakiet do Smash&Fun i pozwól im doświadczyć emocjonującej przygody w Rage Room, którą będą wspominać przez długi czas!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group overflow-hidden rounded-xl px-8 py-4 bg-gradient-to-r from-[#f36e21] to-[#f36e21]/80"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative z-10 text-white font-semibold text-lg">
                  CHCĘ VOUCHER!
                </span>
              </motion.button>
            </div>
            
            {/* Декоративный фоновый элемент */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[120%] h-[120%] 
                          bg-gradient-to-r from-[#f36e21]/10 to-transparent rounded-[3rem] -rotate-6 
                          blur-3xl -z-10"></div>
          </motion.div>

          {/* Правая колонка с изображением */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            
              <div className="relative aspect-[4/3] overflow-hidden group bg-gradient-to-br from-white/[0.08] to-transparent 
                            backdrop-blur-sm border border-white/[0.08] rounded-2xl">
                <Image
                  src="/images/voucher.png"
                  alt="Smash&Fun Voucher"
                  fill
                  className="object-contain p-6 transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
                  priority
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-[#f36e21]/0 via-[#f36e21]/5 to-[#f36e21]/0 
                              transition-opacity duration-700 z-20"></div>
              </div>


            {/* Декоративная подсветка */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-[#f36e21]/20 via-[#f36e21]/10 to-[#f36e21]/20 
                          rounded-2xl blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          </motion.div>
        </div>
      </div>
      
      {/* Декоративная линия */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
    </section>
  );
}
