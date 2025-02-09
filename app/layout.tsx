import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LanguageProvider } from './i18n/LanguageProvider';
import Navbar from './components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smash & Fun - Release Your Stress',
  description: 'Rent a room to smash and destroy things in a safe environment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <LanguageProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}