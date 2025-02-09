import './globals.css';
import type { Metadata } from 'next';
import { LanguageProvider } from './i18n/LanguageProvider';
import Navbar from './components/Navbar';

export const metadata: Metadata = {
  title: 'Smash & Fun - Release Your Stress',
  description: 'Rent a room to smash and destroy things in a safe environment',
  icons: {
    icon: '/images/favicon.webp'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-hammersmith bg-black text-white">
        <LanguageProvider>
          <Navbar />
          <main className="pt-32">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}