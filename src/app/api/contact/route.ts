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
      subject: `Новая заявка: ${subject || 'Контактная форма'}`,
      html: `
        <h2>Новая заявка с сайта</h2>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Телефон:</strong> ${phone}</p>
        ${service ? `<p><strong>Услуга:</strong> ${service}</p>` : ''}
        ${people ? `<p><strong>Количество человек:</strong> ${people}</p>` : ''}
        ${date ? `<p><strong>Дата:</strong> ${date}</p>` : ''}
        ${message ? `<p><strong>Сообщение:</strong> ${message}</p>` : ''}
      `,
    };

    // Отправляем письмо
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Сообщение успешно отправлено' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при отправке письма:', error);
    return NextResponse.json(
      { message: 'Произошла ошибка при отправке сообщения' },
      { status: 500 }
    );
  }
} 