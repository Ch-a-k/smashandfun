export type TemplateKey = "minimal" | "corporate" | "promo";

export const TEMPLATES: Record<TemplateKey, { name: string; html: string }> = {
  minimal: {
    name: "Minimal",
    html: `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><title>{{subject}}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#222">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden">
      <tr><td style="padding:24px;text-align:center;background:#18171c;border-bottom:3px solid {{primary_color}}">
        <img src="{{logo_url}}" alt="Logo" style="max-height:48px;display:inline-block"/>
      </td></tr>
      <tr><td style="padding:32px 32px 16px 32px">
        <h1 style="margin:0 0 16px 0;font-size:22px">Cześć {{first_name}}!</h1>
        <p style="margin:0 0 16px 0;line-height:1.5">Tu wpisz treść wiadomości.</p>
        <p style="margin:0 0 24px 0;line-height:1.5;color:#666">— Zespół Smash and Fun</p>
        <a href="{{cta_url}}" style="display:inline-block;padding:12px 24px;background:{{primary_color}};color:#fff;text-decoration:none;border-radius:6px;font-weight:700">Zarezerwuj</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
  },
  corporate: {
    name: "Corporate",
    html: `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><title>{{subject}}</title></head>
<body style="margin:0;padding:0;background:#18171c;font-family:Arial,Helvetica,sans-serif;color:#eee">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px">
    <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#23222a;border:1px solid #333;border-radius:12px;overflow:hidden">
      <tr><td style="padding:24px;border-bottom:4px solid {{primary_color}};text-align:left">
        <img src="{{logo_url}}" alt="Logo" style="max-height:40px"/>
      </td></tr>
      <tr><td style="padding:32px">
        <h1 style="margin:0 0 8px 0;font-size:24px;color:#fff">Szanowny/a {{full_name}},</h1>
        <p style="margin:0 0 16px 0;line-height:1.6;color:#ccc">Dziękujemy za zaufanie. Twoja łączna wartość zamówień wynosi <b style="color:{{primary_color}}">{{total_order_value}}</b>.</p>
        <p style="margin:0 0 24px 0;line-height:1.6;color:#ccc">Tutaj dodaj szczegóły oferty B2B lub informacje o wydarzeniu.</p>
        <a href="{{cta_url}}" style="display:inline-block;padding:14px 28px;background:{{primary_color}};color:#fff;text-decoration:none;border-radius:8px;font-weight:700;letter-spacing:.5px">Sprawdź ofertę B2B</a>
      </td></tr>
      <tr><td style="padding:20px;background:#18171c;text-align:center;color:#666;font-size:12px">
        Smash and Fun · Warszawa · hello@smashandfun.pl
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
  },
  promo: {
    name: "Promo",
    html: `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><title>{{subject}}</title></head>
<body style="margin:0;padding:0;background:#fff3ea;font-family:Arial,Helvetica,sans-serif;color:#222">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(243,110,33,.15)">
      <tr><td style="padding:24px;text-align:center;background:#18171c">
        <img src="{{logo_url}}" alt="Logo" style="max-height:44px;display:inline-block;vertical-align:middle"/>
      </td></tr>
      <tr><td style="height:3px;background:{{primary_color}};font-size:0;line-height:0">&nbsp;</td></tr>
      <tr><td style="padding:0 32px 16px 32px;text-align:center"><br/>
        <div style="font-size:14px;letter-spacing:3px;color:{{primary_color}};font-weight:800">PROMOCJA</div>
        <h1 style="margin:8px 0 12px 0;font-size:32px;line-height:1.1">-20% na wszystkie pakiety</h1>
        <p style="margin:0 0 24px 0;line-height:1.6;font-size:16px;color:#555">
          {{first_name}}, specjalnie dla Ciebie! Użyj kodu na stronie rezerwacji.
        </p>
        <div style="display:inline-block;padding:14px 28px;border:2px dashed {{primary_color}};border-radius:10px;font-size:22px;font-weight:900;letter-spacing:4px;color:{{primary_color}};margin-bottom:24px">SMASH20</div>
        <br/>
        <a href="{{cta_url}}" style="display:inline-block;padding:14px 32px;background:{{primary_color}};color:#fff;text-decoration:none;border-radius:8px;font-weight:800;font-size:16px">Rezerwuję teraz</a>
      </td></tr>
      <tr><td style="padding:20px;background:#fafafa;text-align:center;font-size:12px;color:#999">
        Oferta ograniczona czasowo.
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
  },
};
