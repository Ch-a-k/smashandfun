import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createEmailTransport, getEmailConfig } from '@/lib/email';

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
    const base = 185 * people;
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

    // Send email notification (same pattern as voucher route)
    const dateText = dateTo ? `${dateFrom} — ${dateTo}` : dateFrom;
    const extraItemsText = (extraItems ?? [])
      .filter((ei: { id: string; count: number }) => ei.count > 0)
      .map((ei: { id: string; count: number }) => {
        const info = priceMap[ei.id];
        return `${info?.name ?? ei.id} x ${ei.count} (${(info?.price ?? 0) * ei.count} zl)`;
      })
      .join('\n');

    const transporter = createEmailTransport();
    const emailConfig = getEmailConfig();

    const mailOptions = {
      from: emailConfig.from,
      to: emailConfig.notificationTo,
      replyTo: email,
      subject: `Nowe zapytanie B2B - ${SERVICE_LABELS[service] ?? service}`,
      text: [
        'Nowe zapytanie B2B',
        `Usluga: ${SERVICE_LABELS[service] ?? service}`,
        `Imie: ${name}`,
        `Email: ${email}`,
        `Telefon: ${phone}`,
        `Liczba osob: ${people}`,
        `Termin: ${dateText}`,
        extraItemsText ? `Dodatki:\n${extraItemsText}` : '',
        message ? `Wiadomosc: ${message}` : '',
        `Szacowany przychod: ${estimatedRevenue} PLN`,
      ].filter(Boolean).join('\n\n'),
      html: `<h2>Nowe zapytanie B2B</h2><p><b>Usluga:</b> ${SERVICE_LABELS[service] ?? service}</p><p><b>Imie:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Telefon:</b> ${phone}</p><p><b>Liczba osob:</b> ${people}</p><p><b>Termin:</b> ${dateText}</p>${extraItemsHtml ? `<p><b>Dodatki:</b><br/>${extraItemsHtml}</p>` : ''}${message ? `<p><b>Wiadomosc:</b> ${message}</p>` : ''}<hr/><p><b>Szacowany przychod:</b> ${estimatedRevenue} PLN</p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('B2B email send failed (request saved):', emailError);
    }

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    console.error('B2B request error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
