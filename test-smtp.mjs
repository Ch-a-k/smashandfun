import 'dotenv/config';
import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || process.env.ZOHO_HOST || process.env.EMAIL_HOST;
const port = Number(process.env.SMTP_PORT || process.env.ZOHO_PORT || process.env.EMAIL_PORT);
const user = process.env.SMTP_USER || process.env.ZOHO_USER || process.env.EMAIL_USER;
const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.ZOHO_PASS || process.env.EMAIL_PASS;
const to = process.env.EMAIL_TO || process.env.EMAIL_RECEIVER || process.env.ZOHO_USER || user;

console.log('SMTP config:');
console.log(`  host: ${host}`);
console.log(`  port: ${port}`);
console.log(`  user: ${user}`);
console.log(`  pass: ${pass ? '***' + pass.slice(-3) : 'NOT SET'}`);
console.log(`  to:   ${to}`);
console.log();

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

console.log('Verifying SMTP connection...');
try {
  await transporter.verify();
  console.log('SMTP connection OK');
} catch (err) {
  console.error('SMTP connection FAILED:', err.message);
  process.exit(1);
}

console.log('Sending test email...');
try {
  const info = await transporter.sendMail({
    from: user,
    to,
    subject: 'SMTP test — smash and fun',
    text: 'If you see this, SMTP works.',
  });
  console.log('Email sent! messageId:', info.messageId);
} catch (err) {
  console.error('Send FAILED:', err.message);
  process.exit(1);
}
