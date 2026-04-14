import nodemailer from 'nodemailer';

type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  notificationTo: string;
  cc?: string;
};

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

function firstDefined(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === 'string' && value.trim().length > 0)?.trim();
}

function parsePort(value: string | undefined): number | undefined {
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parseSecure(value: string | undefined, port: number): boolean {
  if (!value) return port === 465;
  return TRUE_VALUES.has(value.trim().toLowerCase());
}

function resolveEmailConfig(): EmailConfig {
  const host = firstDefined(
    process.env.SMTP_HOST,
    process.env.ZOHO_HOST,
    process.env.EMAIL_HOST
  );
  const port = parsePort(
    firstDefined(
      process.env.SMTP_PORT,
      process.env.ZOHO_PORT,
      process.env.EMAIL_PORT
    )
  );
  const user = firstDefined(
    process.env.SMTP_USER,
    process.env.ZOHO_USER,
    process.env.EMAIL_USER
  );
  const pass = firstDefined(
    process.env.SMTP_PASSWORD,
    process.env.SMTP_PASS,
    process.env.ZOHO_PASS,
    process.env.EMAIL_PASS
  );

  const missing: string[] = [];
  if (!host) missing.push('SMTP_HOST / ZOHO_HOST / EMAIL_HOST');
  if (!port) missing.push('SMTP_PORT / ZOHO_PORT / EMAIL_PORT');
  if (!user) missing.push('SMTP_USER / ZOHO_USER / EMAIL_USER');
  if (!pass) missing.push('SMTP_PASSWORD / SMTP_PASS / ZOHO_PASS / EMAIL_PASS');

  if (missing.length > 0) {
    throw new Error(`Email config is incomplete: ${missing.join(', ')}`);
  }

  if (!host || !port || !user || !pass) {
    throw new Error('Email config is incomplete.');
  }

  return {
    host,
    port,
    secure: parseSecure(
      firstDefined(process.env.SMTP_SECURE, process.env.EMAIL_SECURE),
      port
    ),
    user,
    pass,
    from: firstDefined(process.env.EMAIL_FROM, process.env.ZOHO_USER, user) ?? user,
    notificationTo:
      firstDefined(
        process.env.EMAIL_TO,
        process.env.EMAIL_RECEIVER,
        process.env.ZOHO_USER,
        user
      ) ?? user,
    cc: firstDefined(process.env.EMAIL_CC),
  };
}

export function getEmailConfig(): EmailConfig {
  return resolveEmailConfig();
}

export function createEmailTransport() {
  const config = resolveEmailConfig();

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}
