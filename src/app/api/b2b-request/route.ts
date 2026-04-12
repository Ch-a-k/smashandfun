import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SERVICE_LABELS: Record<string, string> = {
  team_building: 'Team Building',
  corporate_events: 'Imprezy Firmowe',
  integration: 'Integracja Zespołu',
};

export async function POST(request: Request) {
  try {
    const { name, email, phone, service, people, dateFrom, dateTo, extraItems, message,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, landing_page } =
      await request.json();

    // Fetch extra item prices for revenue calculation + email
    const { data: itemsData } = await supabaseAdmin
      .from('extra_items')
      .select('id, name, price');
    const priceMap: Record<string, { name: string; price: number }> = {};
    for (const i of (itemsData ?? []) as { id: string; name: string; price: number }[]) {
      priceMap[i.id] = { name: i.name, price: Number(i.price) };
    }

    // Compute estimated revenue
    const base = people < 7 ? 200 * people : 150 * people;
    const extras = (extraItems ?? []).reduce(
      (sum: number, ei: { id: string; count: number }) =>
        sum + (priceMap[ei.id]?.price ?? 0) * ei.count,
      0
    );
    const estimatedRevenue = base + extras;

    // Save to Supabase
    const { error: dbError } = await supabaseAdmin.from('b2b_requests').insert([{
      name,
      email,
      phone,
      service,
      people,
      date_from: dateFrom,
      date_to: dateTo || null,
      extra_items: extraItems ?? [],
      message: message || null,
      status: 'new',
      estimated_revenue: estimatedRevenue,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      utm_term: utm_term || null,
      utm_content: utm_content || null,
      referrer: referrer || null,
      landing_page: landing_page || null,
    }]);

    if (dbError) {
      console.error('B2B request DB error:', dbError);
      return NextResponse.json({ message: 'Database error' }, { status: 500 });
    }

    // Build extra items text for email
    const extraItemsHtml = (extraItems ?? [])
      .filter((ei: { id: string; count: number }) => ei.count > 0)
      .map((ei: { id: string; count: number }) => {
        const info = priceMap[ei.id];
        return `${info?.name ?? ei.id} × ${ei.count} (${(info?.price ?? 0) * ei.count} zł)`;
      })
      .join('<br/>');

    // Send email notification (non-blocking — DB save is the priority)
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const dateText = dateTo ? `${dateFrom} — ${dateTo}` : dateFrom;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        cc: process.env.EMAIL_CC,
        subject: `Nowe zapytanie B2B — ${SERVICE_LABELS[service] ?? service}`,
        html: `
          <h2>Nowe zapytanie B2B</h2>
          <p><strong>Usługa:</strong> ${SERVICE_LABELS[service] ?? service}</p>
          <p><strong>Imię:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefon:</strong> ${phone}</p>
          <p><strong>Liczba osób:</strong> ${people}</p>
          <p><strong>Termin:</strong> ${dateText}</p>
          ${extraItemsHtml ? `<p><strong>Dodatki:</strong><br/>${extraItemsHtml}</p>` : ''}
          ${message ? `<p><strong>Wiadomość:</strong> ${message}</p>` : ''}
          <hr/>
          <p><strong>Szacowany przychód:</strong> ${estimatedRevenue} PLN</p>
          <p style="color:#888;font-size:12px">Baza: ${people} os. × ${people < 7 ? 200 : 150} zł = ${base} zł${extras > 0 ? ` + dodatki ${extras} zł` : ''}</p>
        `,
      });
    } catch (emailError) {
      console.error('B2B email send failed (request saved):', emailError);
    }

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    console.error('B2B request error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
