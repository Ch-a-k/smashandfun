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
    subject = `Potwierdzenie rezerwacji w Smash&Fun`;
    text = `Cześć ${booking.name || ''},\n\nZarezerwowałeś/aś pakiet ${booking.package} w dniu ${booking.date} ${booking.time}.\nZnajdziesz nas pod adresem: Postępu 19/4, Warszawa.\nDziękujemy za dokonanie rezerwacji w SMASH&FUN!\nCieszymy się, że wybrałeś mieć FUN I SPOKÓJ. Nie możemy się doczekać, aby zapewnić Ci niezapomniane doświadczenie.\n\nProsimy o przybycie na miejsce rezerwacji 5 minut wcześniej, abyśmy mogli przeprowadzić krótkie wprowadzenie i zapoznać Cię z zasadami bezpieczeństwa.\nNie możemy się Ciebie doczekać!\n\nPozdrowienia,\nZespół S&F\n\nAby zmienić termin rezerwacji kliknij tutaj: ${booking.change_link}\nAby anulować rezerwację kliknij tutaj: ${booking.cancel_link}`;
    html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#18171c;color:#fff;padding:32px 24px;border-radius:18px;">
        <h2 style="color:#f36e21;margin-bottom:18px;">Cześć ${booking.name || ''},</h2>
        <div style="background:#23222a;padding:18px 20px;border-radius:12px;margin-bottom:18px;">
          <div style="margin-bottom:8px;"><b>Zarezerwowałeś/aś pakiet:</b> ${booking.package}</div>
          <div style="margin-bottom:8px;"><b>Data:</b> ${booking.date}</div>
          <div style="margin-bottom:8px;"><b>Godzina:</b> ${booking.time}</div>
          <div style="margin-bottom:8px;"><b>Adres:</b> Postępu 19/4, Warszawa</div>
        </div>
        <div style="margin-bottom:18px;">Dziękujemy za dokonanie rezerwacji w SMASH&FUN!<br/>Cieszymy się, że wybrałeś mieć FUN I SPOKÓJ. Nie możemy się doczekać, aby zapewnić Ci niezapomniane doświadczenie.<br/><br/>Prosimy o przybycie na miejsce rezerwacji 5 minut wcześniej, abyśmy mogli przeprowadzić krótkie wprowadzenie i zapoznać Cię z zasadami bezpieczeństwa.<br/>Nie możemy się Ciebie doczekać!</div>
        <div style="font-size:15px;opacity:0.8;">Pozdrowienia,<br/>Zespół S&F</div>
        <div style="margin-top:18px;font-size:14px;">
          <b>Zmień termin rezerwacji:</b> <a href='${booking.change_link}' style='color:#f36e21;'>${booking.change_link}</a><br/>
          <b>Anuluj rezerwację:</b> <a href='${booking.cancel_link}' style='color:#f36e21;'>${booking.cancel_link}</a>
        </div>
      </div>
    `;
  } else if (type === 'changed') {
    subject = 'Zmiana rezerwacji w Smash&Fun';
    text = `Hej ${booking.name || ''},\n\nTo jest potwierdzenie, że Twoja usługa ${booking.package} została przeniesiona na ${booking.date} ${booking.time}.\n\nNie możemy się Ciebie doczekać!\n\nPozdrowienia,\nZespół S&F\n\nAby anulować rezerwację kliknij tutaj: ${booking.cancel_link}`;
    html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#18171c;color:#fff;padding:32px 24px;border-radius:18px;">
        <h2 style="color:#f36e21;margin-bottom:18px;">Hej ${booking.name || ''},</h2>
        <div style="background:#23222a;padding:18px 20px;border-radius:12px;margin-bottom:18px;">
          <div style="margin-bottom:8px;"><b>Usługa:</b> ${booking.package}</div>
          <div style="margin-bottom:8px;"><b>Nowa data:</b> ${booking.date}</div>
          <div style="margin-bottom:8px;"><b>Godzina:</b> ${booking.time}</div>
        </div>
        <div style="margin-bottom:18px;">To jest potwierdzenie, że Twoja usługa została przeniesiona.<br/>Nie możemy się Ciebie doczekać!</div>
        <div style="font-size:15px;opacity:0.8;">Pozdrowienia,<br/>Zespół S&F</div>
        <div style="margin-top:18px;font-size:14px;">
          <b>Anuluj rezerwację:</b> <a href='${booking.cancel_link}' style='color:#f36e21;'>${booking.cancel_link}</a>
        </div>
      </div>
    `;
  } else if (type === 'reminder') {
    subject = 'Przypomnienie o rezerwacji w Smash&Fun';
    text = `Hej, ${booking.name || ''},\n\nTo jest przypomnienie o rezerwacji ${booking.package} w dniu ${booking.date} ${booking.time}.\n\nZnajdziesz nas pod adresem: Postępu 19/4, Warszawa.\nProsimy o przybycie na miejsce rezerwacji 5 minut wcześniej, abyśmy mogli przeprowadzić krótkie wprowadzenie i zapoznać Cię z zasadami bezpieczeństwa.\nNie możemy się Ciebie doczekać!\n\nPozdrowienia,\nZespół S&F\n\nAby zmienić termin rezerwacji kliknij tutaj: ${booking.change_link}\nAby anulować rezerwację kliknij tutaj: ${booking.cancel_link}`;
    html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#18171c;color:#fff;padding:32px 24px;border-radius:18px;">
        <h2 style="color:#f36e21;margin-bottom:18px;">Hej, ${booking.name || ''},</h2>
        <div style="background:#23222a;padding:18px 20px;border-radius:12px;margin-bottom:18px;">
          <div style="margin-bottom:8px;"><b>Rezerwacja:</b> ${booking.package}</div>
          <div style="margin-bottom:8px;"><b>Data:</b> ${booking.date}</div>
          <div style="margin-bottom:8px;"><b>Godzina:</b> ${booking.time}</div>
          <div style="margin-bottom:8px;"><b>Adres:</b> Postępu 19/4, Warszawa</div>
        </div>
        <div style="margin-bottom:18px;">Prosimy o przybycie na miejsce rezerwacji 5 minut wcześniej, abyśmy mogli przeprowadzić krótkie wprowadzenie i zapoznać Cię z zasadami bezpieczeństwa.<br/>Nie możemy się Ciebie doczekać!</div>
        <div style="font-size:15px;opacity:0.8;">Pozdrowienia,<br/>Zespół S&F</div>
        <div style="margin-top:18px;font-size:14px;">
          <b>Zmień termin rezerwacji:</b> <a href='${booking.change_link}' style='color:#f36e21;'>${booking.change_link}</a><br/>
          <b>Anuluj rezerwację:</b> <a href='${booking.cancel_link}' style='color:#f36e21;'>${booking.cancel_link}</a>
        </div>
      </div>
    `;
  } else if (type === 'cancelled') {
    subject = 'Anulowanie rezerwacji w Smash&Fun';
    text = `Cześć ${booking.name || ''},\n\nTwoja rezerwacja (${booking.package}, ${booking.date} ${booking.time}) została anulowana.\n\nJeśli to nie Ty anulowałeś rezerwację lub masz pytania, skontaktuj się z nami.\n\nPozdrowienia,\nZespół S&F`;
    html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#18171c;color:#fff;padding:32px 24px;border-radius:18px;">
        <h2 style="color:#f36e21;margin-bottom:18px;">Rezerwacja anulowana</h2>
        <div style="background:#23222a;padding:18px 20px;border-radius:12px;margin-bottom:18px;">
          <div style="margin-bottom:8px;"><b>Usługa:</b> ${booking.package}</div>
          <div style="margin-bottom:8px;"><b>Data:</b> ${booking.date}</div>
          <div style="margin-bottom:8px;"><b>Godzina:</b> ${booking.time}</div>
        </div>
        <div style="margin-bottom:18px;">Twoja rezerwacja została anulowana.<br/>Jeśli to nie Ty anulowałeś rezerwację lub masz pytania, skontaktuj się z nami.</div>
        <div style="font-size:15px;opacity:0.8;">Pozdrowienia,<br/>Zespół S&F</div>
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
    console.error('Błąd wysyłania e -maila:', err);
    res.status(500).json({ error: 'Błąd wysyłki emaila' });
  }
} 