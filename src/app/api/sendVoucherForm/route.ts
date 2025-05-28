import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const PACKAGE_NAMES_PL: Record<string, string> = {
  easy: 'BUŁKA Z MASŁEM',
  medium: 'ŁATWY',
  hard: 'ŚREDNI',
  extreme: 'TRUDNY',
};

export async function POST(req: NextRequest) {
  const { name, email, phone, package: pkg, message } = await req.json();

  // Получаем название пакета на польском
  const packageName = PACKAGE_NAMES_PL[pkg] || pkg;

  // Настройка транспорта
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
    subject: 'Nowe zamówienie vouchera / New voucher order',
    text: `Imię i nazwisko / Name: ${name}\nEmail: ${email}\nTelefon / Phone: ${phone}\nPakiet / Package: ${packageName}\nWiadomość / Message: ${message}`,
    html: `<b>Imię i nazwisko / Name:</b> ${name}<br/><b>Email:</b> ${email}<br/><b>Telefon / Phone:</b> ${phone}<br/><b>Pakiet / Package:</b> ${packageName}<br/><b>Wiadomość / Message:</b> ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Email send error' }, { status: 500 });
  }
} 