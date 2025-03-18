"use client";

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export interface Section {
  title: string;
  content: string[];
}

export interface DocumentSection {
  key: string;
  title: string;
}

interface DocumentHeaderProps {
  title: string;
  lastUpdatedKey: string;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({ title, lastUpdatedKey }) => {
  const { t } = useI18n();
  
  return (
    <div className="text-center mb-12 relative">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
        {title}
      </h1>
      <div className="text-white/70 space-y-2">
        <p>{t('terms.companyInfo.name')}</p>
        <p>{t('terms.companyInfo.address')}</p>
        <p>{t('terms.companyInfo.city')}</p>
        <p className="mt-4">{t(lastUpdatedKey)} 01.01.2025</p>
      </div>
    </div>
  );
};

const ContentSection: React.FC<{ section: Section; isLast?: boolean }> = ({ section, isLast = false }) => {
  const content = Array.isArray(section.content) ? section.content : [];
  
  return (
    <div className="relative">
      <h2 className="text-2xl font-bold text-white mb-6">
        {section.title}
      </h2>
      <div className="space-y-4">
        {content.map((paragraph: string, i: number) => (
          <p key={i} className="text-white/80 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
      {!isLast && <div className="my-12 border-b border-white/10" />}
    </div>
  );
};

const DocumentFooter: React.FC = () => {
  const { t } = useI18n();
  
  return (
    <div className="mt-12 pt-8 border-t border-white/10 text-center">
      <div className="text-white/70 mb-4">
        <p>{t('terms.companyInfo.name')}</p>
        <p>{t('terms.companyInfo.address')}</p>
        <p>{t('terms.companyInfo.city')}</p>
      </div>
      <p className="text-white/50 text-sm">
        {t('terms.footer')}
      </p>
    </div>
  );
};

interface DocumentLayoutProps {
  title: string;
  lastUpdatedKey: string;
  sections: Section[];
  sectionKeys: string[];
}

export default function DocumentLayout({ title, lastUpdatedKey, sections, sectionKeys }: DocumentLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative w-full bg-gradient-to-b from-[#1a1718] to-[#231f20] py-32">
          {/* Decorative line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
          
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-12 relative"
            >
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 rounded-2xl pointer-events-none" />
              
              <DocumentHeader title={title} lastUpdatedKey={lastUpdatedKey} />

              {/* Document content */}
              <div className="space-y-8">
                {sections.map((section, index) => (
                  <ContentSection 
                    key={sectionKeys[index]}
                    section={section}
                    isLast={index === sections.length - 1}
                  />
                ))}
              </div>

              <DocumentFooter />
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 