'use client';

import { useLanguage } from '../i18n/LanguageProvider';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock,} from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function Contact() {
  const { t } = useLanguage();

  return (
    <main>
      <PageHeader 
        title={t('contact.title')} 
        subtitle={t('contact.subtitle')} 
      />
      {/* Contact Info & Map Section */}
      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-12"
            >
              {/* Contact Cards */}
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-black/80 backdrop-blur-sm p-8 rounded-xl border border-[#ff5a00]/20 hover:border-[#ff5a00] transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#ff5a00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-white">{t('contact.address')}</h3>
                      <p className="text-gray-400">ul. Example 123<br />00-000 Warsaw, Poland</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/80 backdrop-blur-sm p-8 rounded-xl border border-[#ff5a00]/20 hover:border-[#ff5a00] transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#ff5a00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-white">{t('contact.phone')}</h3>
                      <p className="text-gray-400">+48 123 456 789</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/80 backdrop-blur-sm p-8 rounded-xl border border-[#ff5a00]/20 hover:border-[#ff5a00] transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#ff5a00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-white">{t('contact.email')}</h3>
                      <p className="text-gray-400">contact@smashandfun.pl</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/80 backdrop-blur-sm p-8 rounded-xl border border-[#ff5a00]/20 hover:border-[#ff5a00] transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#ff5a00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-white">Opening Hours</h3>
                      <div className="text-gray-400 space-y-1">
                        <p>Monday - Friday: 12:00 - 22:00</p>
                        <p>Saturday: 10:00 - 22:00</p>
                        <p>Sunday: 10:00 - 20:00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative h-[600px] rounded-xl overflow-hidden"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d156388.35439831169!2d20.921111!3d52.233333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ecc669a869f01%3A0x72f0be2a88ead3fc!2sWarsaw%2C%20Poland!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="rounded-xl"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}