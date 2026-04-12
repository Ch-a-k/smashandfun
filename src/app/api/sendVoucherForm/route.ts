import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const PACKAGE_NAMES_PL: Record<string, string> = {
  easy: 'BUŁKA Z MASŁEM',
  medium: 'ŁATWY',
  hard: 'ŚREDNI',
  extreme: 'TRUDNY',
};

export async function POST(req: NextRequest) {
  const {
    name, email, phone, package: pkg, message,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
    referrer, landing_page,
  } = await req.json();

  // 1. Save to database (authoritative)
  const { error: dbError } = await supabaseAdmin.from('voucher_requests').insert([{
    name,
    email,
    phone,
    package: pkg,
    message: message || null,
    status: 'new',
    utm_source: utm_source || null,
    utm_medium: utm_medium || null,
    utm_campaign: utm_campaign || null,
    utm_term: utm_term || null,
    utm_content: utm_content || null,
    referrer: referrer || null,
    landing_page: landing_page || null,
  }]);

  if (dbError) {
    console.error('Voucher request DB error:', dbError);
    return NextResponse.json({ ok: false, error: 'Database error' }, { status: 500 });
  }

  // 2. Send email (non-blocking — DB save is source of truth)
  const packageName = PACKAGE_NAMES_PL[pkg] || pkg;

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
  } catch (emailErr) {
    console.error('Voucher email send error (non-fatal):', emailErr);
  }

  return NextResponse.json({ ok: true });
}
