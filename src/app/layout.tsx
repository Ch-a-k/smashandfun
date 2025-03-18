import './globals.css'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import CookieConsent from '@/components/CookieConsent'
import { I18nProvider } from '@/i18n/I18nContext'
import { Inter } from 'next/font/google'
import GoogleTagManager from '@/components/GoogleTagManager'

// Load custom fonts
const impact = localFont({
  src: '../../public/fonts/impact.ttf',
  variable: '--font-impact',
  display: 'swap',
})

const akrobat = localFont({
  src: '../../public/fonts/Akrobat-Regular.otf',
  variable: '--font-akrobat',
  display: 'swap',
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smash&Fun - Rage Room #1 in Warsaw',
  description: 'Release stress and emotions in the most exciting way! Visit our rage room in Warsaw.',
  metadataBase: new URL('https://smashandfun.pl'),
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    alternateLocale: 'en_US',
    url: 'https://smashandfun.pl',
    title: 'Smash&Fun - Rage Room #1 in Warsaw',
    description: 'Release stress and emotions in the most exciting way! Visit our rage room in Warsaw.',
    siteName: 'Smash&Fun',
    images: [
      {
        url: '/og/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Smash&Fun - Rage Room',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smash&Fun - Rage Room #1 in Warsaw',
    description: 'Release stress and emotions in the most exciting way! Visit our rage room in Warsaw.',
    images: ['/og/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    title: 'Smash&Fun',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f36e21',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl" className={`${impact.variable} ${akrobat.variable} ${inter.className}`}>
      <head>
        {/* Основные иконки */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Apple Touch иконки */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.jpg" />
        
        {/* Манифест и другие метаданные */}
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#f36e21" />
        <meta name="msapplication-TileColor" content="#f36e21" />
      </head>
      <body className="bg-[#231f20]">
        <I18nProvider>
          <GoogleTagManager />
          {children}
          <CookieConsent />
        </I18nProvider>
      </body>
    </html>
  )
}
