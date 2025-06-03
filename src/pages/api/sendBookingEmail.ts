import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { to, booking, type } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_HOST,
    port: Number(process.env.ZOHO_PORT),
    secure: Number(process.env.ZOHO_PORT) === 465, // true для 465, false для 587
    auth: {
      user: process.env.ZOHO_USER,
      pass: process.env.ZOHO_PASS
    }
  });

  let subject = '';
  let text = '';
  let html = '';

  if (type === 'new') {
    subject = 'Potwierdzenie rezerwacji w Smash&Fun';
    text = `
Dziękujemy za dokonanie rezerwacji!
Szczegóły rezerwacji:
- Data: ${booking.date}
- Godzina: ${booking.time}
- Usługa: ${booking.package}
- Liczba osób: ${booking.people}

Życzymy wspaniałej zabawy!
W razie pytań prosimy o kontakt: ${process.env.ZOHO_USER}

Pozdrawiamy,
Zespół Smash&Fun
    `;
    html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#18171c;color:#fff;padding:32px 24px;border-radius:18px;">
        <h2 style="color:#f36e21;margin-bottom:18px;">Dziękujemy za dokonanie rezerwacji!</h2>
        <div style="background:#23222a;padding:18px 20px;border-radius:12px;margin-bottom:18px;">
          <div style="margin-bottom:8px;"><b>Data:</b> ${booking.date}</div>
          <div style="margin-bottom:8px;"><b>Godzina:</b> ${booking.time}</div>
          <div style="margin-bottom:8px;"><b>Usługa:</b> ${booking.package}</div>
          <div style="margin-bottom:8px;"><b>Liczba osób:</b> ${booking.people}</div>
        </div>
        <div style="margin-bottom:18px;">Życzymy wspaniałej zabawy!<br/>W razie pytań prosimy o kontakt: <a href="mailto:${process.env.ZOHO_USER}" style="color:#f36e21;">${process.env.ZOHO_USER}</a></div>
        <div style="font-size:15px;opacity:0.8;">Pozdrawiamy,<br/>Zespół Smash&Fun</div>
      </div>
    `;
  } else if (type === 'update') {
    subject = 'Zmiana rezerwacji w Smash&Fun';
    text = `
Twoja rezerwacja została zaktualizowana!
Nowe szczegóły rezerwacji:
- Data: ${booking.date}
- Godzina: ${booking.time}
- Usługa: ${booking.package}
- Liczba osób: ${booking.people}

W razie pytań prosimy o kontakt: ${process.env.ZOHO_USER}

Pozdrawiamy,
Zespół Smash&Fun
    `;
    html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#18171c;color:#fff;padding:32px 24px;border-radius:18px;">
        <h2 style="color:#f36e21;margin-bottom:18px;">Twoja rezerwacja została zaktualizowana!</h2>
        <div style="background:#23222a;padding:18px 20px;border-radius:12px;margin-bottom:18px;">
          <div style="margin-bottom:8px;"><b>Data:</b> ${booking.date}</div>
          <div style="margin-bottom:8px;"><b>Godzina:</b> ${booking.time}</div>
          <div style="margin-bottom:8px;"><b>Usługa:</b> ${booking.package}</div>
          <div style="margin-bottom:8px;"><b>Liczba osób:</b> ${booking.people}</div>
        </div>
        <div style="margin-bottom:18px;">W razie pytań prosimy o kontakt: <a href="mailto:${process.env.ZOHO_USER}" style="color:#f36e21;">${process.env.ZOHO_USER}</a></div>
        <div style="font-size:15px;opacity:0.8;">Pozdrawiamy,<br/>Zespół Smash&Fun</div>
      </div>
    `;
  }

  try {
    await transporter.sendMail({
      from: `"Smash&Fun" <${process.env.ZOHO_USER}>`,
      to,
      subject,
      text,
      html
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    // Логируем ошибку для отладки
    // eslint-disable-next-line no-console
    console.error('Ошибка отправки email:', err);
    res.status(500).json({ error: 'Błąd wysyłki emaila' });
  }
} 