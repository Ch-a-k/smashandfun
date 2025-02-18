import { motion } from 'framer-motion'
import Image from 'next/image'

const partners = [
  {
    name: "Wyjątkowy Prezent",
    logo: "/images/partner1.png",
    description: "Pierwsza w Polsce firma, oferująca Vouchery na prezenty w formie przeżyć."
  },
  {
    name: "Super prezenty",
    logo: "/images/partner2.png",
    description: "Sklep z dobrymi emocjami. Loty, aktywna rozrywka, prędkość i adrenalina."
  }
];

export function PartnersSection() {
  return (
    <section className="relative py-32 bg-gradient-to-b from-[#1a1718] to-[#231f20] overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30" />

      {/* Noise texture */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section title */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block"
          >
            <h2 className="text-5xl font-impact bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 mb-6">
              PARTNERZY
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#f36e21]"></div>
              <div className="h-[2px] w-12 bg-[#f36e21]"></div>
              <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#f36e21]"></div>
            </div>
          </motion.div>
        </div>

        {/* Partners grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group"
            >
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-sm border border-white/[0.08]">
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f36e21]/0 to-[#f36e21]/0 group-hover:from-[#f36e21]/5 group-hover:to-transparent transition-all duration-500 rounded-2xl" />
                
                {/* Partner content */}
                <div className="relative z-10">
                  {/* Partner logo */}
                  <div className="w-full aspect-[3/2] mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-sm border border-white/[0.08]">
                    <div className="w-full h-full flex items-center justify-center relative">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                  </div>

                  {/* Partner info */}
                  <div className="space-y-4">
                    <motion.h3 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.2 }}
                      className="text-2xl font-impact text-white group-hover:text-[#f36e21] transition-colors"
                    >
                      {partner.name}
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.2 }}
                      className="text-white/60 font-akrobat"
                    >
                      {partner.description}
                    </motion.p>
                  </div>
                </div>

                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30" />
    </section>
  );
}
