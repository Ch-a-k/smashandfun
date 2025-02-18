"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Toast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import Image from 'next/image';

type ToastState = {
  message: string;
  type: 'success' | 'error';
} | null;

type ValidationError = {
  email?: string;
  phone?: string;
};

const MAX_MESSAGE_LENGTH = 3000;
const VALIDATION_DELAY = 1000; // 1 second delay for validation

// Function to check if email is Russian
const isRussianEmail = (email: string) => {
  return email.toLowerCase().endsWith('.ru');
};

// Function to validate international phone number
const isValidPhoneNumber = (phone: string) => {
  // Validate format: +XX XXX XXX XXX or +XXXXXXXXXXXX
  // Must start with +, followed by 8-15 digits
  const phoneRegex = /^\+\d{8,15}$/;
  const digitsOnly = phone.replace(/\s/g, '');
  return phoneRegex.test(digitsOnly);
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError>({});
  const validationTimer = useRef<NodeJS.Timeout>();

  const validateForm = (): boolean => {
    const errors: ValidationError = {};

    // Validate email
    if (isRussianEmail(formData.email)) {
      errors.email = 'Przepraszamy, nie akceptujemy rosyjskich adresów e-mail';
    }

    // Validate phone only if it's not empty and not just "+"
    if (formData.phone.length > 1 && !isValidPhoneNumber(formData.phone)) {
      errors.phone = 'Wprowadź prawidłowy numer telefonu w formacie międzynarodowym (+XX XXX XXX XXX)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setToast({
        message: 'Wiadomość została wysłana pomyślnie!',
        type: 'success'
      });
      
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        message: ''
      });
      setValidationErrors({});
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Wystąpił błąd podczas wysyłania wiadomości',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneFocus = () => {
    if (!formData.phone) {
      setFormData(prev => ({ ...prev, phone: '+' }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const sanitizedValue = value.replace(/[^\d\s+]/g, '');
    setFormData(prev => ({ ...prev, phone: sanitizedValue }));

    // Clear any existing validation timer
    if (validationTimer.current) {
      clearTimeout(validationTimer.current);
    }

    // Clear validation error immediately when user starts typing
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.phone;
      return newErrors;
    });

    // Set new validation timer
    validationTimer.current = setTimeout(() => {
      if (sanitizedValue && !isValidPhoneNumber(sanitizedValue)) {
        setValidationErrors(prev => ({
          ...prev,
          phone: 'Wprowadź prawidłowy numer telefonu w formacie międzynarodowym (+XX XXX XXX XXX)'
        }));
      }
    }, VALIDATION_DELAY);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'message' && value.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    if (name === 'email') {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Validate email as user types
      if (value && isRussianEmail(value)) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'Przepraszamy, nie akceptujemy rosyjskich adresów e-mail'
        }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Cleanup validation timer on unmount
  useEffect(() => {
    return () => {
      if (validationTimer.current) {
        clearTimeout(validationTimer.current);
      }
    };
  }, []);

  const remainingChars = MAX_MESSAGE_LENGTH - formData.message.length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative w-full bg-gradient-to-b from-[#1a1718] to-[#231f20] py-32">
          {/* Decorative line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f36e21] to-transparent opacity-30"></div>
          
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl md:text-6xl font-bold text-white mb-6"
              >
                Kontakt
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl text-white/70"
              >
                Skontaktuj się z nami
              </motion.p>
            </div>
            
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-6 bg-transparent backdrop-blur-sm rounded-2xl p-8 relative overflow-visible"
            >
              {/* Background images */}
              <div className="absolute -top-28 -left-16 w-48 h-48 opacity-90 pointer-events-none">
                <Image
                  src="/images/smile.png"
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>

              <div className="absolute -bottom-16 -right-16 w-48 h-48 opacity-90 pointer-events-none">
                <Image
                  src="/images/heart.png"
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>

              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 rounded-2xl pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-white/70 text-sm mb-2">Imię</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#f36e21] transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-white/70 text-sm mb-2">Nazwisko</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#f36e21] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-white/70 text-sm mb-2">
                    Numer kontaktowy
                    <span className="text-white/40 ml-1">(np. +48 XXX XXX XXX)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onFocus={handlePhoneFocus}
                    required
                    className={`
                      w-full px-4 py-3 bg-black/20 border rounded-lg text-white 
                      focus:outline-none transition-colors
                      ${validationErrors.phone ? 'border-red-500' : 'border-white/10 focus:border-[#f36e21]'}
                    `}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-white/70 text-sm mb-2">Adres e-mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`
                      w-full px-4 py-3 bg-black/20 border rounded-lg text-white 
                      focus:outline-none transition-colors
                      ${validationErrors.email ? 'border-red-500' : 'border-white/10 focus:border-[#f36e21]'}
                    `}
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="message" className="block text-white/70 text-sm">Treść wiadomości</label>
                  <span className={`text-sm ${remainingChars < 100 ? 'text-orange-400' : 'text-white/50'}`}>
                    {remainingChars} znaków pozostało
                  </span>
                </div>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  maxLength={MAX_MESSAGE_LENGTH}
                  rows={6}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#f36e21] transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || Object.keys(validationErrors).length > 0}
                  className={`
                    px-8 py-4 bg-[#f36e21] text-white font-bold rounded-lg
                    transform transition-all duration-200
                    hover:scale-105 hover:bg-[#ff7b2e]
                    focus:outline-none focus:ring-2 focus:ring-[#f36e21] focus:ring-opacity-50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      <span>Wysyłanie...</span>
                    </>
                  ) : (
                    'WYŚLIJ'
                  )}
                </button>
              </div>
            </motion.form>
          </div>
        </section>
      </main>
      <Footer />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
