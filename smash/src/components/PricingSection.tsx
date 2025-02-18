'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarBorder } from './ui/star-border'

type Tool = 'ubranie' | 'kask' | 'rękawice';

type Package = {
  name: string;
  items: string[];
  tools: Tool[];
  people: string;
  duration: string;
  price: string;
  difficulty: string;
  isBestseller?: boolean;
}

const packages: Package[] = [
  {
    name: 'BUŁKA Z MASŁEM',
    items: ['25 szklanych przedmiotów'],
    tools: ['ubranie', 'kask', 'rękawice'],
    people: '1-2 osoby',
    duration: 'do 30 min',
    price: '199 PLN',
    difficulty: 'ŁATWY',
  },
  {
    name: 'ŁATWY',
    items: [
      '25 szklanych przedmiotów',
      '2 meble',
      '3 sprzęty RTV i AGD'
    ],
    tools: ['ubranie', 'kask', 'rękawice'],
    people: '1-2 osoby',
    duration: 'do 45 min',
    price: '299 PLN',
    difficulty: 'ŚREDNI',
  },
  {
    name: 'ŚREDNI',
    items: [
      '30 szklanych przedmiotów',
      '3 meble',
      '5 sprzętów RTV i AGD'
    ],
    tools: ['ubranie', 'kask', 'rękawice'],
    people: '1-4 osoby',
    duration: 'do 120 min',
    price: '499 PLN',
    isBestseller: true,
    difficulty: 'TRUDNY',
  },
  {
    name: 'TRUDNY',
    items: [
      '35 szklanych przedmiotów',
      '5 meble',
      '8 sprzętów RTV i AGD',
      '10 mniejszych sprzętów RTV i AGD'
    ],
    tools: ['ubranie', 'kask', 'rękawice'],
    people: '1-6 osób',
    duration: 'do 180 min',
    price: '999 PLN',
    difficulty: 'EKSTREMALNY',
  },
]

const additionalItems = [
  { quantity: '10', name: 'Szklanych przedmiotów', price: '50 PLN', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
      <path fill="currentColor" d="M15.5 14.04c-.71 0-1.37.19-1.95.51l-3.12-3.12c.32-.58.51-1.24.51-1.95c0-2.24-1.76-4-4-4s-4 1.76-4 4s1.76 4 4 4c.71 0 1.37-.19 1.95-.51l3.12 3.12c-.32.58-.51 1.24-.51 1.95c0 2.24 1.76 4 4 4s4-1.76 4-4s-1.76-4-4-4M6.94 12c-1.37 0-2.5-1.13-2.5-2.5S5.57 7 6.94 7s2.5 1.13 2.5 2.5S8.31 12 6.94 12m8.56 8c-1.37 0-2.5-1.13-2.5-2.5s1.13-2.5 2.5-2.5s2.5 1.13 2.5 2.5s-1.13 2.5-2.5 2.5M8 5h8v3H8V5m8 14H8v-4h8v4m4-4h-2v-2H6v2H4v-4c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v4Z"/>
    </svg>
  )},
  { quantity: '1', name: 'Klawiatura', price: '20 PLN', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
      <path fill="currentColor" d="M4 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H4m0 2h2v2H4V7m4 0h2v2H8V7m4 0h2v2h-2V7m4 0h2v2h-2V7M4 11h2v2H4v-2m4 0h2v2H8v-2m4 0h8v2h-8v-2m10 0h2v2h-2v-2Z"/>
    </svg>
  )},
  { quantity: '1', name: 'TV/monitor', price: '100 PLN', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
      <path fill="currentColor" d="M21 17H3V5h18m0-2H3c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2Z"/>
    </svg>
  )},
  { quantity: '1', name: 'Meble', price: '120 PLN', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
      <path fill="currentColor" d="M5 17h14v2H5zm7-12h7v2h-7zM5 7h5v2H5zm0 4h5v2H5zm7 0h7v2h-7z"/>
    </svg>
  )},
  { quantity: '1', name: 'Drukarka', price: '50 PLN', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
      <path fill="currentColor" d="M19 8h-1V3H6v5H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3M8 5h8v3H8V5m8 14H8v-4h8v4m4-4h-2v-2H6v2H4v-4c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v4Z"/>
    </svg>
  )},
  { quantity: '1', name: 'Mysz komputerowa', price: '10 PLN', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
      <path fill="currentColor" d="M11 1.07C7.05 1.56 4 4.92 4 9h7m-7 6a8 8 0 0 0 8 8a8 8 0 0 0 8-8v-4H4m9-9.93V9h7c0-4.08-3.06-7.44-7-7.93Z"/>
    </svg>
  )},
  { quantity: '1', name: 'Telefon', price: '30 PLN', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
      <path fill="currentColor" d="M17 19H7V5h10m0-4H7c-1.11 0-2 .89-2 2v18c0 1.11.89 2 2 2h10c1.11 0 2-.89 2-2V3c0-1.11-.89-2-2-2Z"/>
    </svg>
  )},
  { quantity: '1', name: 'Nagranie z pomocą GoPro', price: '50 PLN', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
        <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4Z"/>
      </svg>
  )}
]

const toolIcons = {
  'ubranie': (
    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 72 72"><circle cx="36.344" cy="10.432" r="2.969" fill="#F36E21"/><path fill="#F36E21" d="M43.54 22.541a4.3 4.3 0 0 0-4.209-4.131h-6a4.3 4.3 0 0 0-4.209 4.131l-.792 19.44a1 1 0 0 1-.12.437l1.395-.997l.824 21.035a1.23 1.23 0 0 0 .25.88a.24.24 0 0 0 .152.09c.214 0 .656-.427.735-1.126l2.899-22.503a5 5 0 0 1 .402-1.193l.725-.805h1.625l.984.623a5 5 0 0 1 .352 1.342l2.542 22.534c.079.698.522 1.125.736 1.125a.24.24 0 0 0 .152-.09c.192-.248.49-.585.457-.9l-.076-21.515l2.643 1.835"/><circle cx="36.344" cy="10.432" r="2.969" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"/><path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M31.477 24.252c2.352 3.533.677 6.107.032 8a33.4 33.4 0 0 0-.898 5.613c-.6 5.977-1.002 24.005-1.002 24.005c-.055 1.1.575 2 1.4 2a2.076 2.076 0 0 0 1.729-1.987l2.539-22.031c.126-1.093.679-1.987 1.229-1.987s1.1.894 1.229 1.987l2.542 22.031a2.076 2.076 0 0 0 1.73 1.987c.824 0 1.454-.9 1.4-2c0 0-.524-17.841-1.074-23.762a36 36 0 0 0-.827-5.856c-.617-1.902-2.416-4.739-.029-8"/><path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="m27.38 41.842l.792-19a5.274 5.274 0 0 1 5.208-5h5.927a5.274 5.274 0 0 1 5.208 5l.792 19"/><ellipse cx="38.844" cy="13.521" stroke="#000" strokeLinecap="round" strokeLinejoin="round" rx="1.134" ry=".757" transform="rotate(-50 38.844 13.521)" strokeWidth="0"/><ellipse cx="33.844" cy="13.521" stroke="#000" strokeLinecap="round" strokeLinejoin="round" rx=".757" ry="1.134" transform="rotate(-40 33.843 13.521)" strokeWidth="0"/><circle cx="36.344" cy="13.401" r="1.5" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0"/><circle cx="39.63" cy="20.875" r="1"/></svg>
  ),
  'kask': (
    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 64 64"><path fill="#000" d="M6 28h52v12H6z"/><path fill="#ffba57" d="M8 37v-9h48v9s4 0 4 5s-4 5-4 5c0 8-18 15-24 15S8 55 8 47c0 0-4 0-4-5s4-5 4-5"/><path fill="#f0eaea" d="M20 35.8c-5 0-7 1.8-7 3.6s0 4.4 6.6 4.4c6.4 0 7.4-.8 7.4-3.5c0-1.8-2-4.5-7-4.5"/><circle cx="20.5" cy="38.8" r="4.5" fill="#000"/><path fill="#000" d="M22 38.8c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5s1.5.7 1.5 1.5"/><path fill="#000" d="M13 39.3c0-7 14-7 14 1c-2-6-12-6-14-1"/><path fill="#f0eaea" d="M44 35.8c5 0 7 1.8 7 3.6s0 4.4-6.6 4.4c-6.4 0-7.4-.8-7.4-3.5c0-1.8 2-4.5 7-4.5"/><circle cx="43.5" cy="38.8" r="4.5" fill="#000"/><path fill="#000" d="M42 38.8c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5"/><path fill="#000" d="M51 39.3c0-7-14-7-14 1c2-6-12-6-14-1"/><path fill="#9b4615" d="M41 50.9c0 3.4-4.5 5.1-9 5.1s-9-1.7-9-5.1c0 0 0-.9.9-.9h16.2c.9 0 .9.9.9.9"/><path fill="#F36E21" d="M59 31H5C5 16.6 11.8 5.5 32 5.5S59 16.6 59 31"/><g fill="#a44a17"><path d="M24.5 31h-4V7.1l4-1.2zm19 0h-4V5.9l4 1.2z"/><path d="M62 33.2H2c0-5.1 13.4-9.3 30-9.3s30 4.2 30 9.3"/></g><path fill="#F36E21" d="M41.5 27.7h-19V6.6c0-6.1 19.1-6.1 19.1 0v21.1z"/></svg>
  ),
  'rękawice': (
    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 36 36"><path fill="#5e2707" d="M33.334 27.096c-.588-1.143-1.532-4.627-1.246-5.976s1.015-3.975.402-6.053L30.216 7.36s-.108-1.503-1.519-1.122c-1.949.526-1.501 2.043-1.501 2.043l.715 3.092l1.157 2.42s-.701.206-1.551-2.674l-2.872-9.731S24.578-.1 23.16.255c-1.85.463-1.521 2.102-1.521 2.102l2.662 9.02c-.402.05-.456.203-.46.191l-2.905-9.846S21.015.261 19.582.543c-1.92.377-1.695 2.08-1.695 2.08l2.939 9.851c.003.012-.479.156-.473.176l-2.506-8.494s.059-1.547-1.355-1.179c-2.018.525-1.659 2.142-1.659 2.142l3.101 10.51l.037-.011c-.02.005.074.474.17.711c.604 1.49 1.395 2.726 2.324 3.706a.7.7 0 0 0 .163.277c.969 1.036 3.396 4.267 4.325 7.59c.581 2.078 4.215.914 5.026.556c1.078-.477-.641-3.61-.753-4.311s.618-1.482 1.096-.51s.646 4.026 1.657 3.835s2.888-1.17 3.558-1.855c.44-.452.851-1.079.263-2.222"/><path fill="#a63d00" d="M33.794 26.905c-.588-1.143-1.532-4.627-1.246-5.976s1.015-3.975.402-6.053L30.676 7.17s-.413-1.401-1.816-.988c-1.4.414-.987 1.815-.987 1.815L28.759 11l.768 2.602s-.701.206-1.551-2.675l-2.872-9.731S24.69-.205 23.289.208s-.988 1.815-.988 1.815l2.715 9.203c-.006-.02-.713.162-.717.15L21.394 1.53S20.981.128 19.579.542s-.988 1.815-.988 1.815l2.905 9.847c.003.012-.692.235-.686.255l-2.506-8.494s-.414-1.401-1.815-.988s-.988 1.815-.988 1.815l2.665 9.03c.024.083-.649.383-.618.486l-1.92-6.507s-.414-1.401-1.815-.987s-.988 1.815-.988 1.815l3.102 10.51l.037-.011c-.02.005.074.474.17.711c.604 1.49 1.395 2.726 2.324 3.705a.7.7 0 0 0 .163.277c.969 1.036 3.396 4.267 4.325 7.59c.581 2.078 4.215.914 5.026.556c1.078-.477-.641-3.61-.753-4.311c-.112-.7.618-1.482 1.096-.51s.646 4.026 1.657 3.835s2.888-1.17 3.558-1.855c.441-.451.853-1.078.264-2.221"/><path fill="#a63d00" d="M29.743 26.025c-1.09-.681-3.683-3.193-4.127-4.498s-1.16-3.935-2.75-5.407l-5.895-5.461s-1.072-.993-2.065.079s.079 2.065.079 2.065l2.297 2.128l1.991 1.844s-.497.536-2.701-1.505L9.427 7.974s-1.072-.993-2.065.079s.079 2.065.079 2.065l7.039 6.52c-.015-.014-.53.504-.54.495l-7.531-6.976s-1.072-.993-2.065.079s.079 2.065.079 2.065l7.532 6.977c.009.008-.475.556-.46.57L4.999 13.83s-1.072-.993-2.065.079s.079 2.065.079 2.065l6.907 6.398c.063.059-.362.661-.283.734l-4.977-4.61s-1.072-.993-2.065.08s.079 2.065.079 2.065l8.039 7.447s.332.341.536.496c1.28.972 2.444 1.603 3.741 2.01c.127.042.314.107.433.141c1.363.395 5.1 1.931 7.597 4.311c1.562 1.489 4.09-1.37 4.603-2.092c.683-.961-2.397-2.775-2.851-3.32s-.227-1.589.681-.999s2.613 3.13 3.385 2.448s1.884-2.482 2.11-3.413c.149-.614.182-1.364-.907-2.045"/><path fill="#a63d00" d="M19.097 27.624a.5.5 0 0 1-.202-.043l-6.529-2.883a.5.5 0 1 1 .405-.914l6.529 2.883a.5.5 0 0 1-.203.957m2.497-2.997a.5.5 0 0 1-.351-.144l-5.253-5.167a.5.5 0 1 1 .701-.713l5.252 5.167a.5.5 0 0 1-.349.857m-1.226 1.453a.5.5 0 0 1-.281-.087l-6.235-4.241a.501.501 0 0 1 .563-.826l6.235 4.241a.5.5 0 0 1-.282.913"/></svg>
  )
}

interface GlassShard {
  id: number
  src: string
  initialX: number
  initialY: number
  duration: number
  delay: number
  scale: number
}

export function PricingSection() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [glassShards, setGlassShards] = useState<GlassShard[]>([])

  // Configuration for floating glass shards
  const CONFIG = useMemo(() => ({
    NUMBER_OF_SHARDS: 15,    // Increase/decrease this number to change the amount of shards
    SHARD_WIDTH: '10em',     // Adjust size of shards
    ANIMATION_DURATION: 15,  // Base animation duration
    MAX_DELAY: 10,          // Maximum delay before animation starts
    MIN_SCALE: 0.3,         // Minimum random scale
    MAX_SCALE: 0.8,         // Maximum random scale
  }), [])

  useEffect(() => {
    // Generate glass shards with random values
    const shards = Array.from({ length: CONFIG.NUMBER_OF_SHARDS }, (_, i) => ({
      id: i,
      src: `/images/glass-shard-${(i % 6) + 1}.png`,
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      duration: CONFIG.ANIMATION_DURATION + Math.random() * 20,
      delay: Math.random() * CONFIG.MAX_DELAY,
      scale: CONFIG.MIN_SCALE + Math.random() * (CONFIG.MAX_SCALE - CONFIG.MIN_SCALE),
    }))
    setGlassShards(shards)
  }, [CONFIG])

  return (
    <section className="py-20 bg-[#231f20] relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5"
      />

      {/* Floating glass shards */}
      {glassShards.map((shard) => (
        <motion.img
          key={shard.id}
          src={shard.src}
          alt=""
          className="absolute pointer-events-none select-none"
          style={{ width: CONFIG.SHARD_WIDTH, height: 'auto' }}
          initial={{
            x: `${shard.initialX}vw`,
            y: `${shard.initialY}vh`,
            scale: shard.scale,
            opacity: 0,
          }}
          animate={{
            x: [`${shard.initialX}vw`, `${(shard.initialX + 30) % 100}vw`],
            y: [`${shard.initialY}vh`, `${(shard.initialY + 40) % 100}vh`],
            opacity: [0.4, 0.6, 0.4],
            rotate: [0, 360],
          }}
          transition={{
            duration: shard.duration,
            delay: shard.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-impact text-center text-white mb-12"
        >
          WYBIERZ SWÓJ PAKIET
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {packages.map((pkg, index) => (
              <GlassCard
                key={pkg.name}
                onClick={() => setSelectedPackage(pkg.name)}
                isActive={selectedPackage === pkg.name}
                delay={index * 0.1}
              >
                <div className="relative h-full p-4">
                  {pkg.isBestseller && (
                    <motion.div
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 200,
                        damping: 15
                      }}
                      className="absolute -top-4 -right-2 z-20"
                    >
                      <StarBorder>
                        BESTSELLER!
                      </StarBorder>
                    </motion.div>
                  )}
                  
                  <div className="flex flex-col h-full">
                    <h3 className="text-xl font-impact text-white mb-3">{pkg.name}</h3>
                    
                    <div className="mb-4">
                      <h4 className="text-white font-impact text-sm mb-1.5">DO ZDEMOLOWANIA</h4>
                      <ul className="space-y-1.5 text-white/80 font-akrobat text-sm">
                        {pkg.items.slice(0, 4).map((item, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + i * 0.1 }}
                            className="flex items-center"
                          >
                            <svg className="w-3 h-3 text-[#f36e21] mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="truncate">{item}</span>
                          </motion.li>
                        ))}
                        {pkg.items.length > 4 && (
                          <li className="text-xs text-white/40 pl-4">
                            +{pkg.items.length - 4} więcej...
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-white font-impact text-sm mb-1.5">NARZĘDZIA</h4>
                      <div className="flex gap-3 items-center">
                        {pkg.tools.map((tool, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 + i * 0.1 }}
                            className="text-[#f36e21] bg-white/5 p-2 rounded-lg cursor-help relative group"
                            title={tool}
                          >
                            {toolIcons[tool]}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-[#F36E21]/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                              {tool}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between text-white/80 font-akrobat text-sm">
                        <span>{pkg.people}</span>
                        <span>{pkg.duration}</span>
                      </div>
                      
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        className="text-2xl font-impact text-[#f36e21] text-center"
                      >
                        {pkg.price}
                      </motion.div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-white/10 hover:bg-[#f36e21] text-white font-impact py-2 rounded-lg transition-colors text-sm"
                      >
                        REZERWUJ TERAZ
                      </motion.button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Additional Items Section */}
      <div className="mt-16 max-w-4xl mx-auto px-4">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#f36e21]/50"></div>
            <div className="w-3 h-3 rounded-full bg-[#f36e21]/20 border border-[#f36e21]/50"></div>
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#f36e21]/50"></div>
          </div>
          
          <div className="bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/5 p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-2"
            >
              <h3 className="text-xl font-impact text-white/90">Dodatki</h3>
              <p className="text-white/60 text-sm max-w-md mx-auto">
                Wybierz dodatkowe przedmioty, które chcesz zniszczyć wraz z wybranym pakietem
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2"
            >
              {additionalItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 flex flex-col items-center text-center hover:bg-white/10 transition-all duration-300 border border-white/5">
                    <div className="text-[#f36e21] relative flex items-center gap-1">
                      <span className="font-impact text-sm">{item.quantity} ×</span>
                      {item.icon}
                    </div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 border border-white/90 bg-white/5 backdrop-blur-sm rounded-lg">
                    <div className="bg-[#222]/90 rounded-lg p-2 text-center min-w-[120px]">
                      <p className="text-white/90 font-akrobat text-sm">{item.name}</p>
                      <p className="text-[#f36e21] font-impact text-sm mt-1">{item.price}</p>
                    </div>
                    <div className="w-2 h-2 bg-[#222]/90 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border border-t-[#222]/90 border-l-[#222]/90"></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

type GlassCardProps = {
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  delay?: number;
}

const GlassCard = ({ children, onClick, isActive, delay = 0 }: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <div
        onClick={onClick}
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.08] to-transparent 
                   backdrop-blur-sm border border-white/[0.08] h-full transition-colors
                   ${isActive ? 'border-[#f36e21]/30' : 'hover:border-white/[0.12]'}`}
      >
        {/* Simple hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-[#f36e21]/5" />
        </div>

        {children}
      </div>
    </motion.div>
  )
}
