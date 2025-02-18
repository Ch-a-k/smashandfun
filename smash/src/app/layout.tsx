import './globals.css'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import CookieConsent from '@/components/CookieConsent'

// Load custom fonts
const impact = localFont({
  src: '../../public/fonts/impact.ttf',
  variable: '--font-impact',
})

const akrobat = localFont({
  src: '../../public/fonts/Akrobat-Regular.otf',
  variable: '--font-akrobat',
})

export const metadata: Metadata = {
  title: 'Smash&Fun',
  description: 'Wyjątkowe miejsce na mapie Warszawy, gdzie możesz uwolnić swoje emocje i świetnie się bawić!',
  icons: {
    icon: '/images/favicon.ico',
    shortcut: '/images/favicon.ico',
    apple: '/images/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl" className={`${impact.variable} ${akrobat.variable}`}>
      <head>
        <link rel="icon" href="/images/favicon.ico" />
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/favicon.ico" />
      </head>
      <body className="bg-[#231f20]">
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
