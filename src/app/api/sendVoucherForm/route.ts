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

  // Настройка транспорта (Zoho SMTP, как в sendBookingEmail)
  const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_HOST,
    port: Number(process.env.ZOHO_PORT),
    secure: Number(process.env.ZOHO_PORT) === 465,
    auth: {
      user: process.env.ZOHO_USER,
      pass: process.env.ZOHO_PASS,
    },
  });

  const mailOptions = {
    from: process.env.ZOHO_USER,
    to: process.env.EMAIL_RECEIVER || process.env.ZOHO_USER,
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