import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, service, people, date, message, subject } = body;

    // Создаем транспорт для отправки почты
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Формируем содержимое письма
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      cc: process.env.EMAIL_CC,
      subject: `Nowa aplikacja: ${subject || 'Formularz kontaktowy'}`,
      html: `
        <h2>Nowa aplikacja ze strony</h2>
        <p><strong>Nazwa:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        ${service ? `<p><strong>Praca:</strong> ${service}</p>` : ''}
        ${people ? `<p><strong>Liczba ludzi:</strong> ${people}</p>` : ''}
        ${date ? `<p><strong>Data:</strong> ${date}</p>` : ''}
        ${message ? `<p><strong>Wiadomość:</strong> ${message}</p>` : ''}
      `,
    };

    // Отправляем письмо
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Wiadomość jest pomyślnie wysyłana' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Błąd podczas wysyłania listu:', error);
    return NextResponse.json(
      { message: 'Wystąpił błąd podczas wysyłania wiadomości' },
      { status: 500 }
    );
  }
} 