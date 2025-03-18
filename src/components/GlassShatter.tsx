'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface GlassShatterProps {
  isVisible: boolean
}

interface Shard {
  id: number
  initialX: number
  initialY: number
  finalX: number
  finalY: number
  rotation: number
  scale: number
  opacity: number
  delay: number
  image: string
  size: number
}

const glassShardImages = [
  '/images/glass-shard-1.png',
  '/images/glass-shard-2.png',
  '/images/glass-shard-3.png',
  '/images/glass-shard-4.png',
  '/images/glass-shard-5.png',
  '/images/glass-shard-6.png'
]

const getRandomImage = () => {
  return glassShardImages[Math.floor(Math.random() * glassShardImages.length)]
}

const generateShards = () => {
  const shards: Shard[] = []
  const gridSize = 4
  const baseSize = 16 // 1em = 16px
  const jitterAmount = 15

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const jitterX = (Math.random() - 0.5) * jitterAmount
      const jitterY = (Math.random() - 0.5) * jitterAmount
      
      const baseX = (j - gridSize/2) * (baseSize - 5) + jitterX
      const baseY = (i - gridSize/2) * (baseSize - 5) + jitterY
      
      const distance = Math.sqrt(baseX * baseX + baseY * baseY)
      const angle = Math.atan2(baseY, baseX)
      const force = distance * (2 + Math.random() * 1.5)
      
      shards.push({
        id: i * gridSize + j,
        initialX: baseX,
        initialY: baseY,
        finalX: baseX + Math.cos(angle) * force * (1 + Math.random() * 0.5),
        finalY: baseY + Math.sin(angle) * force * (1 + Math.random() * 0.5),
        rotation: Math.random() * 720 - 360,
        scale: Math.random() * 1.8 + 0.8,
        opacity: Math.random() * 0.3 + 0.7,
        delay: distance * 0.001,
        image: getRandomImage(),
        size: baseSize + (Math.random() * 9)
      })
    }
  }
  return shards
}

export default function GlassShatter({ isVisible }: GlassShatterProps) {
  const [shards, setShards] = useState<Shard[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setShards(generateShards())
  }, [])

  if (!isClient) {
    return null // Return nothing during server-side rendering
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {shards.map((shard) => (
          <motion.div
            key={shard.id}
            initial={{
              x: shard.initialX,
              y: shard.initialY,
              rotate: 0,
              scale: 1,
              opacity: 0
            }}
            animate={isVisible ? {
              x: shard.finalX,
              y: shard.finalY,
              rotate: shard.rotation,
              scale: shard.scale,
              opacity: shard.opacity
            } : {
              x: shard.initialX,
              y: shard.initialY,
              rotate: 0,
              scale: 1,
              opacity: 0
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 15,
              mass: Math.random() * 0.5 + 0.5,
              delay: shard.delay
            }}
            style={{
              position: 'absolute',
              width: shard.size,
              height: shard.size,
              transformOrigin: 'center'
            }}
          >
            <Image
              src={shard.image}
              alt=""
              width={shard.size}
              height={shard.size}
              className="w-full h-full object-contain"
              style={{
                filter: 'brightness(1) contrast(2.2)',
                mixBlendMode: 'screen'
              }}
            />
          </motion.div>
        ))}
      </div>
      
      {/* Glass overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.3 : 0 }}
        transition={{ duration: 0.1 }}
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(243,110,33, 0.5), rgba(243,110,33, 0.05))',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)'
        }}
      />
    </div>
  )
}
