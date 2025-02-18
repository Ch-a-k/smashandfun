'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleError = (e: Event) => {
      const videoElement = e.target as HTMLVideoElement
      const error = videoElement.error
      
      if (error) {
        const errorDetails = {
          code: error.code,
          message: error.message,
          type: 'video_error',
          timestamp: new Date().toISOString()
        }
        console.error('Video playback error:', errorDetails)
        setVideoError(true)
      }
    }

    const handleLoadedData = () => {
      console.log('Video loaded successfully')
      setVideoError(false)
    }

    video.addEventListener('error', handleError)
    video.addEventListener('loadeddata', handleLoadedData)
    
    return () => {
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadeddata', handleLoadedData)
    }
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#231f20]">
      {!videoError ? (
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          {/* WebM для Chrome и Firefox */}
          <source src="/video/hero-background.webm" type="video/webm" />
          {/* MP4 для Safari и других браузеров */}
          <source src="/video/hero-background.mp4" type="video/mp4" />
          {/* MOV как запасной вариант */}
          <source src="/video/hero-background.MOV" type="video/quicktime" />
        </video>
      ) : (
        <div 
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/hero-fallback.jpg)' }}
          aria-label="Hero Background"
        />
      )}

      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4"
      >
        <motion.h1 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl mb-8 font-impact tracking-wider"
        >
          DEMOLKA #1 <br />
          <span className="text-[#f36e21]">W WARSZAWIE</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xl md:text-2xl mb-12 max-w-2xl font-akrobat"
        >
          Uwolnij stres i emocje w najbardziej ekscytujący sposób!
        </motion.p>

        <motion.button
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-[#f36e21] text-white px-12 py-5 text-2xl font-impact tracking-wide rounded-md shadow-lg hover:bg-[#ff7b2e] transition-colors"
        >
          CHCĘ SPRÓBOWAĆ!
        </motion.button>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center items-center"
        >
          <div className="relative w-6 h-10 border-2 border-white rounded-full flex items-center justify-center">
            <motion.div
              animate={{ 
                y: [0, 12, 0],
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop"
              }}
              className="absolute top-2 w-2 h-2 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
