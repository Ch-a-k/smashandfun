"use client";

import React, { useState } from "react";
import { VoucherSection } from "@/components/VoucherSection";
import { useI18n } from '@/i18n/I18nContext';
import { motion } from "framer-motion";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PACKAGE_KEYS = [
  "easy",
  "medium",
  "hard",
  "extreme"
];

export default function VoucheryPage() {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    package: "easy",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePhone = (phone: string) => {
    // Разрешаем только +48 XXX XXX XXX (пробелы не обязательны, но +48 обязательно)
    const regex = /^\+48 ?\d{3} ?\d{3} ?\d{3}$/;
    return regex.test(phone.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setPhoneError("");
    if (!validatePhone(form.phone)) {
      setPhoneError(t("home.voucher.form.phonePlaceholder"));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/sendVoucherForm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ name: "", email: "", phone: "", package: "easy", message: "" });
      } else {
        setError(t("home.voucher.form.error"));
      }
    } catch {
      setError(t("home.voucher.form.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        {/* Секция ваучера */}
        <VoucherSection hideCta />
        {/* Форма обратной связи */}
        <div className="max-w-2xl mx-auto mt-8 px-4 pb-24">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#231f20] rounded-2xl p-8 shadow-lg flex flex-col gap-6 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-2">{t("home.voucher.form.title")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 mb-1" htmlFor="name">{t("home.voucher.form.name")}</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg px-4 py-2 bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#f36e21]"
                  placeholder={t("home.voucher.form.namePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-white/80 mb-1" htmlFor="email">{t("home.voucher.form.email")}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg px-4 py-2 bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#f36e21]"
                  placeholder={t("home.voucher.form.emailPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-white/80 mb-1" htmlFor="phone">{t("home.voucher.form.phone")}</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  className={`w-full rounded-lg px-4 py-2 bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#f36e21] ${phoneError ? 'border-red-500' : ''}`}
                  placeholder={t("home.voucher.form.phonePlaceholder")}
                />
                {phoneError && <div className="text-red-500 text-sm mt-1">{phoneError}</div>}
              </div>
              <div>
                <label className="block text-white/80 mb-1" htmlFor="package">{t("home.voucher.form.package")}</label>
                <select
                  id="package"
                  name="package"
                  required
                  value={form.package}
                  onChange={handleChange}
                  className="w-full rounded-lg px-4 py-2 bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#f36e21]"
                >
                  {PACKAGE_KEYS.map((key) => (
                    <option key={key} value={key} style={{ backgroundColor: 'rgb(35, 31, 32)' }}>{t(`home.pricing.packages.${key}.name`)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-white/80 mb-1" htmlFor="message">{t("home.voucher.form.message")}</label>
              <textarea
                id="message"
                name="message"
                required
                value={form.message}
                onChange={handleChange}
                className="w-full rounded-lg px-4 py-2 bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#f36e21] min-h-[100px]"
                placeholder={t("home.voucher.form.messagePlaceholder")}
              />
            </div>
            {error && <div className="text-red-500 font-medium">{error}</div>}
            {success && <div className="text-green-500 font-medium">{t("home.voucher.form.success")}</div>}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#f36e21] text-white font-semibold rounded-lg px-8 py-3 mt-2 hover:bg-[#ff9f58] transition disabled:opacity-60"
            >
              {loading ? t("home.voucher.form.sending") : t("home.voucher.form.submit")}
            </button>
          </motion.form>
        </div>
      </main>
      <Footer />
    </div>
  );
} 