export type TemplateKey = "minimal" | "corporate" | "promo";

export type TemplateContent = {
  heading: string;
  bodyText: string; // простой текст с переносами строк (будет обёрнут в <p>)
  ctaText: string;
};

export const TEMPLATE_DEFAULTS: Record<TemplateKey, { name: string; defaults: TemplateContent }> = {
  minimal: {
    name: "Minimal",
    defaults: {
      heading: "Cześć {{first_name}}!",
      bodyText:
        "Tu wpisz treść wiadomości.\n\nMożesz używać zmiennych takich jak {{first_name}}, {{last_order}} itd.\n\n— Zespół Smash and Fun",
      ctaText: "Zarezerwuj",
    },
  },
  corporate: {
    name: "Corporate",
    defaults: {
      heading: "Szanowny/a {{full_name}},",
      bodyText:
        "Dziękujemy za zaufanie. Twoja łączna wartość zamówień wynosi {{total_order_value}}.\n\nTutaj dodaj szczegóły oferty B2B lub informacje o wydarzeniu.",
      ctaText: "Sprawdź ofertę B2B",
    },
  },
  promo: {
    name: "Promo",
    defaults: {
      heading: "-20% na wszystkie pakiety",
      bodyText:
        "{{first_name}}, specjalnie dla Ciebie!\n\nUżyj kodu SMASH20 na stronie rezerwacji.",
      ctaText: "Rezerwuję teraz",
    },
  },
};

const MOBILE_STYLES = `
  <style>
    @media only screen and (max-width: 600px) {
      .sf-container { width: 100% !important; max-width: 100% !important; }
      .sf-pad { padding: 20px !important; }
      .sf-pad-sm { padding: 16px !important; }
      .sf-h1 { font-size: 22px !important; line-height: 1.2 !important; }
      .sf-h1-big { font-size: 26px !important; line-height: 1.2 !important; }
      .sf-btn { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .sf-logo { max-height: 36px !important; }
    }

    /* Шапка должна оставаться тёмной и в dark mode (логотип белый с оранжевым) */
    @media (prefers-color-scheme: dark) {
      .sf-header { background-color: #18171c !important; }
      .sf-header-text { color: #ffffff !important; }
    }

    /* Outlook.com / Gmail app (inverted color scheme) */
    [data-ogsc] .sf-header,
    [data-ogsb] .sf-header { background-color: #18171c !important; }
    [data-ogsc] .sf-header-text,
    [data-ogsb] .sf-header-text { color: #ffffff !important; }
  </style>
`;

function head(subject: string): string {
  return `<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>${subject}</title>
    ${MOBILE_STYLES}
  </head>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Спец-переменные, которые при рендере оборачиваются в собственный HTML
const PROMO_CODE_WRAPPER = (innerToken: string) =>
  `<span style="display:inline-block;padding:8px 16px;margin:4px 2px;border:2px dashed {{primary_color}};border-radius:8px;font-weight:900;letter-spacing:3px;color:{{primary_color}};font-family:Arial,Helvetica,sans-serif">${innerToken}</span>`;

function stylizeSpecialVars(html: string): string {
  // {{promo:SMASH20}} — inline, любой код между promo: и }} стилизуется
  return html.replace(/\{\{\s*promo:\s*([^{}]+?)\s*\}\}/g, (_m, code) =>
    PROMO_CODE_WRAPPER(escapeHtml(code))
  );
}

// Превращает простой текст с переносами строк в HTML <p>…</p>
// Переменные {{…}} сохраняются без экранирования, спец-переменные стилизуются
function bodyToHtml(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paragraphs
    .map((p) => {
      const withBr = escapeHtml(p).replace(/\n/g, "<br/>");
      // Возвращаем {{var}} после escapeHtml
      const restored = withBr.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, "{{$1}}");
      const styled = stylizeSpecialVars(restored);
      return `<p style="margin:0 0 16px 0;line-height:1.6;font-size:15px">${styled}</p>`;
    })
    .join("\n");
}

function headingToHtml(text: string, cls: string, style: string): string {
  const safe = escapeHtml(text).replace(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
    "{{$1}}"
  );
  const styled = stylizeSpecialVars(safe);
  return `<h1 class="${cls}" style="${style}">${styled}</h1>`;
}

export function buildTemplate(
  key: TemplateKey,
  content: TemplateContent
): string {
  const headingText = content.heading;
  const body = bodyToHtml(content.bodyText);
  const ctaText = escapeHtml(content.ctaText);

  if (key === "minimal") {
    const h1 = headingToHtml(
      headingText,
      "sf-h1",
      "margin:0 0 16px 0;font-size:22px;line-height:1.3;color:#111"
    );
    return `<!doctype html>
<html lang="pl">${head("{{subject}}")}
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#222;-webkit-text-size-adjust:100%">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5"><tr><td align="center" style="padding:16px">
    <table role="presentation" class="sf-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#fff;border-radius:8px;overflow:hidden">
      <tr><td class="sf-pad-sm sf-header" style="padding:24px;text-align:center;background-color:#18171c;border-bottom:3px solid {{primary_color}}">
        <div style="display:inline-block;padding:10px 18px;background-color:#18171c;border:2px solid {{primary_color}};border-radius:8px;line-height:0">
          <img src="{{logo_url}}" alt="Logo" class="sf-logo" style="max-height:40px;display:block;border:0"/>
        </div>
      </td></tr>
      <tr><td class="sf-pad" style="padding:32px">
        ${h1}
        ${body}
        <div style="margin-top:8px">
          <a href="{{cta_url}}" class="sf-btn" style="display:inline-block;padding:14px 24px;background:{{primary_color}};color:#fff;text-decoration:none;border-radius:6px;font-weight:700;text-align:center">${ctaText}</a>
        </div>
      </td></tr>
      <tr><td style="padding:16px;background:#fafafa;text-align:center;font-size:12px;color:#999">
        Smash and Fun · Warszawa · <a href="mailto:hello@smashandfun.pl" style="color:#999;text-decoration:underline">hello@smashandfun.pl</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  }

  if (key === "corporate") {
    const h1 = headingToHtml(
      headingText,
      "sf-h1",
      "margin:0 0 16px 0;font-size:24px;line-height:1.3;color:#fff"
    );
    const bodyDark = body
      .replace(/color:#111/g, "color:#eee")
      .replace(/font-size:15px/g, "font-size:15px;color:#ccc");
    return `<!doctype html>
<html lang="pl">${head("{{subject}}")}
<body style="margin:0;padding:0;background:#18171c;font-family:Arial,Helvetica,sans-serif;color:#eee;-webkit-text-size-adjust:100%">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#18171c"><tr><td align="center" style="padding:16px">
    <table role="presentation" class="sf-container" width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;background:#23222a;border:1px solid #333;border-radius:12px;overflow:hidden">
      <tr><td class="sf-pad-sm sf-header" style="padding:24px;background-color:#23222a;border-bottom:4px solid {{primary_color}};text-align:left">
        <div style="display:inline-block;padding:8px 14px;background-color:#18171c;border:2px solid {{primary_color}};border-radius:8px;line-height:0">
          <img src="{{logo_url}}" alt="Logo" class="sf-logo" style="max-height:36px;display:block;border:0"/>
        </div>
      </td></tr>
      <tr><td class="sf-pad" style="padding:32px">
        ${h1}
        ${bodyDark}
        <div style="margin-top:8px">
          <a href="{{cta_url}}" class="sf-btn" style="display:inline-block;padding:14px 28px;background:{{primary_color}};color:#fff;text-decoration:none;border-radius:8px;font-weight:700;letter-spacing:.5px;text-align:center">${ctaText}</a>
        </div>
      </td></tr>
      <tr><td style="padding:20px;background:#18171c;text-align:center;color:#666;font-size:12px">
        Smash and Fun · Warszawa · <a href="mailto:hello@smashandfun.pl" style="color:#888;text-decoration:underline">hello@smashandfun.pl</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  }

  // promo
  const h1 = headingToHtml(
    headingText,
    "sf-h1-big",
    "margin:12px 0;font-size:32px;line-height:1.1;color:#111"
  );
  return `<!doctype html>
<html lang="pl">${head("{{subject}}")}
<body style="margin:0;padding:0;background:#fff3ea;font-family:Arial,Helvetica,sans-serif;color:#222;-webkit-text-size-adjust:100%">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff3ea"><tr><td align="center" style="padding:16px">
    <table role="presentation" class="sf-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(243,110,33,.15)">
      <tr><td class="sf-pad-sm sf-header" style="padding:24px;text-align:center;background-color:#18171c">
        <div style="display:inline-block;padding:10px 18px;background-color:#18171c;border:2px solid {{primary_color}};border-radius:8px;line-height:0">
          <img src="{{logo_url}}" alt="Logo" class="sf-logo" style="max-height:40px;display:block;border:0"/>
        </div>
      </td></tr>
      <tr><td style="height:3px;background:{{primary_color}};font-size:0;line-height:0">&nbsp;</td></tr>
      <tr><td class="sf-pad" style="padding:32px;text-align:center">
        <div style="font-size:14px;letter-spacing:3px;color:{{primary_color}};font-weight:800">PROMOCJA</div>
        ${h1}
        <div style="text-align:left">${body}</div>
        <div style="margin-top:8px">
          <a href="{{cta_url}}" class="sf-btn" style="display:inline-block;padding:14px 32px;background:{{primary_color}};color:#fff;text-decoration:none;border-radius:8px;font-weight:800;font-size:16px;text-align:center">${ctaText}</a>
        </div>
      </td></tr>
      <tr><td style="padding:20px;background:#fafafa;text-align:center;font-size:12px;color:#999">
        Oferta ograniczona czasowo. · <a href="mailto:hello@smashandfun.pl" style="color:#999;text-decoration:underline">hello@smashandfun.pl</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

// Legacy — оставим для совместимости (templates.TEMPLATES[k].html используется во всех текстах)
export const TEMPLATES: Record<TemplateKey, { name: string; html: string }> = {
  minimal: {
    name: TEMPLATE_DEFAULTS.minimal.name,
    html: buildTemplate("minimal", TEMPLATE_DEFAULTS.minimal.defaults),
  },
  corporate: {
    name: TEMPLATE_DEFAULTS.corporate.name,
    html: buildTemplate("corporate", TEMPLATE_DEFAULTS.corporate.defaults),
  },
  promo: {
    name: TEMPLATE_DEFAULTS.promo.name,
    html: buildTemplate("promo", TEMPLATE_DEFAULTS.promo.defaults),
  },
};
