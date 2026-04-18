"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TEMPLATES,
  TEMPLATE_DEFAULTS,
  buildTemplate,
  type TemplateKey,
} from "./templates";

type Mode = "all" | "filtered" | "single" | "test";
type Payment = "any" | "full" | "partial" | "unpaid";
type CreatedSince = "all" | "week" | "month";
type InactiveSince = "any" | "2weeks" | "month" | "3months" | "6months";

type Brand = {
  logo_url: string | null;
  primary_color: string | null;
  sender_name: string | null;
};

type Filters = {
  mode: Mode;
  createdSince: CreatedSince;
  inactiveSince: InactiveSince;
  minOrderValue: number;
  minGuests: number;
  paymentStatus: Payment;
  singleEmail?: string;
  testEmail?: string;
};

type RecipientPreview = {
  email: string;
  name: string | null;
  total_order_value: number;
  guests_count: number;
  bookings_count: number;
};

type CampaignListItem = {
  id: string;
  name: string;
  subject: string;
  status: string;
  scheduled_at: string | null;
  recipients_count: number;
  sent_count: number;
  opens_count: number;
  clicks_count: number;
  created_at: string;
};

const PERSONALIZATION: { key: string; label: string; sample: string }[] = [
  { key: "first_name", label: "Imię", sample: "Jan" },
  { key: "full_name", label: "Imię i nazwisko", sample: "Jan Kowalski" },
  { key: "email", label: "Email", sample: "jan@example.com" },
  { key: "phone", label: "Telefon", sample: "+48 600 000 000" },
  { key: "last_order", label: "Ostatnie zamówienie", sample: "240 zł" },
  { key: "total_order_value", label: "Suma zamówień", sample: "540 zł" },
  { key: "bookings_count", label: "Liczba rezerwacji", sample: "2" },
  { key: "guests_count", label: "Liczba gości", sample: "8" },
  { key: "order_id", label: "ID rezerwacji", sample: "abc-123" },
  { key: "first_booking_date", label: "Data 1. rezerwacji", sample: "12.03.2025" },
  { key: "last_booking_date", label: "Data ostatniej rez.", sample: "02.04.2026" },
];

const btn =
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed border";
const btnPrimary = `${btn} bg-[#f36e21] hover:bg-[#e05d10] text-white border-[#f36e21]`;
const btnGhost = `${btn} bg-[#2a2930] hover:bg-[#34333b] text-gray-200 border-white/10`;
const input =
  "w-full bg-[#18171c] border border-white/10 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-[#f36e21]";
const label = "block text-xs font-semibold text-gray-400 mb-1";
const card =
  "bg-[#23222a] border border-white/[0.06] rounded-lg p-4";

function fmtPln(v: number) {
  return `${v.toLocaleString("pl-PL", { maximumFractionDigits: 0 })} zł`;
}

export default function EmailDashboard() {
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [brand, setBrand] = useState<Brand>({
    logo_url: "",
    primary_color: "#f36e21",
    sender_name: "Smash&Fun",
  });
  const [tab, setTab] = useState<"compose" | "campaigns">("compose");

  // Compose state
  const [name, setName] = useState("Kampania " + new Date().toLocaleDateString("pl-PL"));
  const [subject, setSubject] = useState("Smash and Fun — nowa oferta!");
  const [subjectB, setSubjectB] = useState("");
  const [abSplit, setAbSplit] = useState(0);
  const [fromName, setFromName] = useState("Smash&Fun");
  const [fromEmail, setFromEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [utmSource, setUtmSource] = useState("email");
  const [utmMedium, setUtmMedium] = useState("email");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [ctaUrl, setCtaUrl] = useState("https://smashandfun.pl/rezerwacja");
  const [trackClicks, setTrackClicks] = useState(true);
  const [scheduledAt, setScheduledAt] = useState("");
  const [templateKey, setTemplateKey] = useState<TemplateKey>("minimal");
  const [heading, setHeading] = useState<string>(
    TEMPLATE_DEFAULTS.minimal.defaults.heading
  );
  const [bodyText, setBodyText] = useState<string>(
    TEMPLATE_DEFAULTS.minimal.defaults.bodyText
  );
  const [ctaText, setCtaText] = useState<string>(
    TEMPLATE_DEFAULTS.minimal.defaults.ctaText
  );
  const [advancedMode, setAdvancedMode] = useState(false);
  const [advancedHtml, setAdvancedHtml] = useState<string>(TEMPLATES.minimal.html);
  const [activeField, setActiveField] = useState<"heading" | "body" | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({});

  // Финальный HTML: либо собранный из блоков, либо raw из advanced mode
  const html = useMemo(() => {
    if (advancedMode) return advancedHtml;
    return buildTemplate(templateKey, { heading, bodyText, ctaText });
  }, [advancedMode, advancedHtml, templateKey, heading, bodyText, ctaText]);

  const [filters, setFilters] = useState<Filters>({
    mode: "all",
    createdSince: "all",
    inactiveSince: "any",
    minOrderValue: 0,
    minGuests: 0,
    paymentStatus: "any",
    singleEmail: "",
    testEmail: "",
  });
  const [count, setCount] = useState<{
    total: number;
    eligible: number;
    unsubscribed: number;
    preview: RecipientPreview[];
  } | null>(null);
  const [countLoading, setCountLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [sending, setSending] = useState(false);

  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [campaignDetails, setCampaignDetails] = useState<{
    campaign: CampaignListItem & { html: string; utm_campaign: string | null };
    logs: Array<{
      id: string;
      to_email: string;
      variant: string;
      subject: string;
      status: string;
      error: string | null;
      sent_at: string | null;
      opened_at: string | null;
      first_click_at: string | null;
      opens: number;
      clicks: number;
    }>;
  } | null>(null);

  useEffect(() => {
    const e = typeof window !== "undefined" ? localStorage.getItem("admin_email") : null;
    if (e) setAdminEmail(e);
  }, []);

  const loadBrand = useCallback(async () => {
    if (!adminEmail) return;
    const r = await fetch(`/api/admin/email/brand?adminEmail=${encodeURIComponent(adminEmail)}`);
    if (r.ok) {
      const j = await r.json();
      if (j.brand) setBrand(j.brand);
    }
  }, [adminEmail]);

  const loadPreviewVars = useCallback(async () => {
    if (!adminEmail) return;
    const r = await fetch(
      `/api/admin/email/preview-data?adminEmail=${encodeURIComponent(adminEmail)}`
    );
    if (r.ok) {
      const j = await r.json();
      setPreviewVars(j.vars || {});
    }
  }, [adminEmail]);

  const loadCampaigns = useCallback(async () => {
    if (!adminEmail) return;
    const r = await fetch(`/api/admin/email/campaigns?adminEmail=${encodeURIComponent(adminEmail)}`);
    if (r.ok) {
      const j = await r.json();
      setCampaigns(j.campaigns || []);
    }
  }, [adminEmail]);

  useEffect(() => {
    loadBrand();
    loadPreviewVars();
    loadCampaigns();
  }, [loadBrand, loadPreviewVars, loadCampaigns]);

  // Poll count when filters change
  const countTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!adminEmail) return;
    if (countTimer.current) clearTimeout(countTimer.current);
    countTimer.current = setTimeout(async () => {
      setCountLoading(true);
      const r = await fetch("/api/admin/email/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, filters }),
      });
      setCountLoading(false);
      if (r.ok) setCount(await r.json());
    }, 300);
    return () => {
      if (countTimer.current) clearTimeout(countTimer.current);
    };
  }, [adminEmail, filters]);

  // Poll campaigns tab every 3s
  useEffect(() => {
    if (tab !== "campaigns") return;
    const t = setInterval(loadCampaigns, 3000);
    return () => clearInterval(t);
  }, [tab, loadCampaigns]);

  function applyTemplate(k: TemplateKey) {
    setTemplateKey(k);
    const d = TEMPLATE_DEFAULTS[k].defaults;
    setHeading(d.heading);
    setBodyText(d.bodyText);
    setCtaText(d.ctaText);
    setAdvancedHtml(TEMPLATES[k].html);
  }

  async function saveBrandColor(color: string) {
    setBrand({ ...brand, primary_color: color });
    await fetch("/api/admin/email/brand", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminEmail, primary_color: color }),
    });
  }

  const renderedPreview = useMemo(() => {
    const vars = {
      ...previewVars,
      subject,
      logo_url: "/images/logo.png",
      primary_color: brand.primary_color || "#f36e21",
      cta_url: ctaUrl || "#",
    };
    return html.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, k) => {
      const v = vars[k as keyof typeof vars];
      return v == null ? "" : String(v);
    });
  }, [html, previewVars, subject, brand, ctaUrl]);

  function insertToken(token: string) {
    if (advancedMode) {
      setAdvancedHtml((h) => h + token);
      return;
    }
    if (activeField === "heading") {
      setHeading((s) => s + token);
    } else {
      setBodyText((s) => s + token);
    }
  }

  function insertVar(key: string) {
    insertToken(`{{${key}}}`);
  }

  function insertInlinePromo() {
    const code = window.prompt("Wpisz kod promocyjny (np. SMASH20):", "SMASH20");
    if (!code) return;
    insertToken(`{{promo:${code.trim()}}}`);
  }

  async function launch(dispatchNow: boolean) {
    if (!adminEmail) return;
    if (!count?.eligible) {
      setMsg("Brak odbiorców.");
      return;
    }
    if (dispatchNow) {
      const ok = confirm(
        `Czy na pewno wysłać kampanię „${name}" teraz?\n\n` +
          `Odbiorcy: ${count.eligible}\n` +
          `Temat: ${subject}\n\n` +
          `Tej operacji nie można cofnąć.`
      );
      if (!ok) return;
    }
    setSending(true);
    setMsg("");
    const r = await fetch("/api/admin/email/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminEmail,
        name,
        subject,
        subject_b: subjectB || undefined,
        ab_split_b_pct: abSplit,
        html,
        template_key: templateKey,
        from_name: fromName || undefined,
        from_email: fromEmail || undefined,
        reply_to: replyTo || undefined,
        utm_source: utmSource || undefined,
        utm_medium: utmMedium || undefined,
        utm_campaign: utmCampaign || undefined,
        primary_color: brand.primary_color || undefined,
        cta_url: ctaUrl || undefined,
        track_clicks: trackClicks,
        // Преобразуем "YYYY-MM-DDTHH:mm" (локальное время браузера) в ISO UTC,
        // чтобы сервер в UTC не интерпретировал как UTC-время.
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        filters,
        dispatchNow: dispatchNow && !scheduledAt,
      }),
    });
    setSending(false);
    const j = await r.json();
    if (!r.ok) {
      setMsg(j.error || "Błąd wysyłki");
      return;
    }
    setMsg(
      scheduledAt
        ? `Kampania zaplanowana. Wysyłka: ${new Date(scheduledAt).toLocaleString("pl-PL")}`
        : "Kampania utworzona i wysyłana."
    );
    loadCampaigns();
    setTab("campaigns");
  }

  async function openCampaign(id: string) {
    setSelectedCampaign(id);
    const r = await fetch(
      `/api/admin/email/campaigns/${id}?adminEmail=${encodeURIComponent(adminEmail)}`
    );
    if (r.ok) setCampaignDetails(await r.json());
  }

  async function deleteCampaign(id: string) {
    if (!confirm("Usunąć kampanię i jej logi?")) return;
    const r = await fetch(
      `/api/admin/email/campaigns/${id}?adminEmail=${encodeURIComponent(adminEmail)}`,
      { method: "DELETE" }
    );
    if (r.ok) {
      setCampaignDetails(null);
      setSelectedCampaign(null);
      loadCampaigns();
    } else {
      const j = await r.json();
      alert(j.error || "Błąd");
    }
  }

  return (
    <div className="text-gray-100 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-white">
          <span className="text-[#f36e21]">Email</span> Marketing
        </h1>
        <div className="flex gap-2">
          <button
            className={tab === "compose" ? btnPrimary : btnGhost}
            onClick={() => setTab("compose")}
          >
            Nowa kampania
          </button>
          <button
            className={tab === "campaigns" ? btnPrimary : btnGhost}
            onClick={() => setTab("campaigns")}
          >
            Historia
          </button>
        </div>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2 rounded-md bg-[#f36e21]/10 border border-[#f36e21]/40 text-[#ffb888] text-sm">
          {msg}
        </div>
      )}

      {tab === "compose" && (
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr_280px] gap-4">
          {/* LEWA: Segmentacja + marka */}
          <div className="space-y-4">
            <div className={card}>
              <h2 className="font-bold mb-3">Odbiorcy</h2>
              <div className="space-y-3">
                <div>
                  <label className={label}>Tryb</label>
                  <select
                    className={input}
                    value={filters.mode}
                    onChange={(e) => setFilters({ ...filters, mode: e.target.value as Mode })}
                  >
                    <option value="all">Wszyscy klienci</option>
                    <option value="filtered">Filtrowani</option>
                    <option value="single">Jeden email</option>
                    <option value="test">Test (mój email)</option>
                  </select>
                </div>

                {filters.mode === "test" && (
                  <div>
                    <label className={label}>Email testowy</label>
                    <input
                      className={input}
                      type="email"
                      value={filters.testEmail}
                      onChange={(e) => setFilters({ ...filters, testEmail: e.target.value })}
                    />
                  </div>
                )}
                {filters.mode === "single" && (
                  <div>
                    <label className={label}>Email odbiorcy</label>
                    <input
                      className={input}
                      type="email"
                      value={filters.singleEmail}
                      onChange={(e) => setFilters({ ...filters, singleEmail: e.target.value })}
                    />
                  </div>
                )}

                {(filters.mode === "all" || filters.mode === "filtered") && (
                  <>
                    <div>
                      <label className={label}>Nowi klienci (pierwsza rezerwacja)</label>
                      <select
                        className={input}
                        value={filters.createdSince}
                        onChange={(e) =>
                          setFilters({ ...filters, createdSince: e.target.value as CreatedSince })
                        }
                      >
                        <option value="all">Wszyscy</option>
                        <option value="week">Ostatni tydzień</option>
                        <option value="month">Ostatni miesiąc</option>
                      </select>
                    </div>
                    <div>
                      <label className={label}>Dawno nie był (ostatnia wizyta)</label>
                      <select
                        className={input}
                        value={filters.inactiveSince}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            inactiveSince: e.target.value as InactiveSince,
                          })
                        }
                      >
                        <option value="any">Bez filtru</option>
                        <option value="2weeks">Ponad 2 tygodnie temu</option>
                        <option value="month">Ponad miesiąc temu</option>
                        <option value="3months">Ponad 3 miesiące temu</option>
                        <option value="6months">Ponad 6 miesięcy temu</option>
                      </select>
                    </div>
                    <div>
                      <label className={label}>Min. suma zamówień (zł)</label>
                      <input
                        className={input}
                        type="number"
                        min={0}
                        value={filters.minOrderValue}
                        onChange={(e) =>
                          setFilters({ ...filters, minOrderValue: Number(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <label className={label}>Min. liczba gości</label>
                      <input
                        className={input}
                        type="number"
                        min={0}
                        value={filters.minGuests}
                        onChange={(e) =>
                          setFilters({ ...filters, minGuests: Number(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <label className={label}>Status płatności</label>
                      <select
                        className={input}
                        value={filters.paymentStatus}
                        onChange={(e) =>
                          setFilters({ ...filters, paymentStatus: e.target.value as Payment })
                        }
                      >
                        <option value="any">Dowolny</option>
                        <option value="full">Opłacone (Full)</option>
                        <option value="partial">Zaliczka (Partial)</option>
                        <option value="unpaid">Nieopłacone (Unpaid)</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={card}>
              <div className="text-xs uppercase text-gray-500">Odbiorcy</div>
              <div className="text-3xl font-black text-[#f36e21]">
                {countLoading ? "…" : count?.eligible ?? 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {count?.total ?? 0} znalezionych · {count?.unsubscribed ?? 0} wypisanych
              </div>
              {count && count.preview.length > 0 && (
                <div className="mt-3 text-xs space-y-1 max-h-40 overflow-auto">
                  {count.preview.map((p) => (
                    <div key={p.email} className="flex justify-between text-gray-400">
                      <span className="truncate">{p.email}</span>
                      <span className="text-gray-500 ml-2">{fmtPln(p.total_order_value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={card}>
              <h2 className="font-bold mb-3">Branding</h2>
              <label className={label}>Logo (z nagłówka strony)</label>
              <div className="flex items-center gap-3 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo.png"
                  alt="logo"
                  className="h-10 bg-white/5 rounded px-2"
                />
                <span className="text-xs text-gray-500">
                  używane automatycznie w każdym mailu
                </span>
              </div>
              <label className={label}>Kolor główny</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brand.primary_color || "#f36e21"}
                  onChange={(e) => saveBrandColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border border-white/10"
                />
                <input
                  className={input}
                  value={brand.primary_color || ""}
                  onChange={(e) => setBrand({ ...brand, primary_color: e.target.value })}
                  onBlur={(e) => saveBrandColor(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ŚRODEK: Edytor + podgląd */}
          <div className="space-y-4 min-w-0">
            <div className={card}>
              <h2 className="font-bold mb-3">Ustawienia kampanii</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={label}>Nazwa (wewnętrzna)</label>
                  <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className={label}>Temat (A)</label>
                  <input
                    className={input}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>Temat (B) · A/B test</label>
                  <input
                    className={input}
                    placeholder="opcjonalnie"
                    value={subjectB}
                    onChange={(e) => setSubjectB(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>% wariant B (np. 5)</label>
                  <input
                    className={input}
                    type="number"
                    min={0}
                    max={100}
                    value={abSplit}
                    onChange={(e) => setAbSplit(Number(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className={label}>Nadawca (nazwa)</label>
                  <input
                    className={input}
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>Nadawca (email)</label>
                  <input
                    className={input}
                    placeholder="domyślnie SMTP_USER"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>Reply-To</label>
                  <input
                    className={input}
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>Zaplanuj wysyłkę (24h, Europe/Warsaw)</label>
                  <div className="flex gap-2 flex-wrap">
                    <input
                      className={input}
                      type="date"
                      style={{ width: 160 }}
                      value={scheduledAt.split("T")[0] || ""}
                      onChange={(e) => {
                        const date = e.target.value;
                        const time = scheduledAt.split("T")[1] || "12:00";
                        setScheduledAt(date ? `${date}T${time}` : "");
                      }}
                    />
                    <select
                      className={input}
                      style={{ width: 80 }}
                      value={(scheduledAt.split("T")[1] || "").split(":")[0] || ""}
                      onChange={(e) => {
                        const hh = e.target.value;
                        const mm =
                          (scheduledAt.split("T")[1] || "").split(":")[1] || "00";
                        const date =
                          scheduledAt.split("T")[0] ||
                          new Date().toISOString().slice(0, 10);
                        setScheduledAt(hh ? `${date}T${hh}:${mm}` : "");
                      }}
                    >
                      <option value="">HH</option>
                      {Array.from({ length: 24 }).map((_, h) => (
                        <option key={h} value={String(h).padStart(2, "0")}>
                          {String(h).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    <span className="self-center text-gray-400">:</span>
                    <select
                      className={input}
                      style={{ width: 80 }}
                      value={(scheduledAt.split("T")[1] || "").split(":")[1] || ""}
                      onChange={(e) => {
                        const mm = e.target.value;
                        const hh =
                          (scheduledAt.split("T")[1] || "").split(":")[0] || "12";
                        const date =
                          scheduledAt.split("T")[0] ||
                          new Date().toISOString().slice(0, 10);
                        setScheduledAt(mm ? `${date}T${hh}:${mm}` : "");
                      }}
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 60 }).map((_, m) => (
                        <option key={m} value={String(m).padStart(2, "0")}>
                          {String(m).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    {scheduledAt && (
                      <button
                        type="button"
                        className={btnGhost}
                        onClick={() => setScheduledAt("")}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className={label}>UTM source</label>
                  <input
                    className={input}
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>UTM medium</label>
                  <input
                    className={input}
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={label}>UTM campaign</label>
                  <input
                    className={input}
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={label}>
                    Link CTA (gdzie prowadzi przycisk — UTM doklejony automatycznie)
                  </label>
                  <input
                    className={input}
                    placeholder="https://smashandfun.pl/rezerwacja"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    id="trackClicks"
                    type="checkbox"
                    checked={trackClicks}
                    onChange={(e) => setTrackClicks(e.target.checked)}
                  />
                  <label htmlFor="trackClicks" className="text-sm text-gray-300 cursor-pointer">
                    Śledź kliknięcia (linki przekierowywane przez /api/.../track/click)
                  </label>
                </div>
              </div>
            </div>

            <div className={card}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <h2 className="font-bold">Szablon i treść</h2>
                <div className="flex gap-2">
                  {(["minimal", "corporate", "promo"] as TemplateKey[]).map((k) => (
                    <button
                      key={k}
                      className={templateKey === k ? btnPrimary : btnGhost}
                      onClick={() => applyTemplate(k)}
                    >
                      {TEMPLATES[k].name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-400 mb-2">
                Nagłówek i stopka (logo, kolor, link do wypisania) są ustawione w szablonie i nie wymagają edycji.
                Uzupełnij pola poniżej.
              </div>

              {!advancedMode && (
                <div className="space-y-3">
                  <div>
                    <label className={label}>Tytuł (nagłówek w treści)</label>
                    <input
                      className={input}
                      value={heading}
                      onChange={(e) => setHeading(e.target.value)}
                      onFocus={() => setActiveField("heading")}
                      placeholder="np. Cześć {{first_name}}!"
                    />
                  </div>

                  <div>
                    <label className={label}>Treść wiadomości</label>
                    <textarea
                      className={input}
                      style={{ minHeight: 200 }}
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      onFocus={() => setActiveField("body")}
                      placeholder="Wpisz treść. Pusta linia = nowy akapit. Możesz używać zmiennych jak {{first_name}}."
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Pusta linia = nowy akapit. Pojedynczy Enter = nowa linia w akapicie.
                    </div>
                  </div>

                  <div>
                    <label className={label}>Tekst przycisku (CTA)</label>
                    <input
                      className={input}
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="np. Zarezerwuj"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Link przycisku ustawiasz niżej w polu „Link CTA".
                    </div>
                  </div>
                </div>
              )}

              {advancedMode && (
                <div>
                  <textarea
                    className={`${input} font-mono text-xs`}
                    style={{ minHeight: 360 }}
                    spellCheck={false}
                    value={advancedHtml}
                    onChange={(e) => setAdvancedHtml(e.target.value)}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Edytujesz pełny HTML. Zmiany w blokach wyżej są ignorowane dopóki ten tryb jest włączony.
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={advancedMode}
                    onChange={(e) => {
                      const on = e.target.checked;
                      if (on) {
                        // При включении advanced — сохраняем текущий собранный HTML
                        setAdvancedHtml(
                          buildTemplate(templateKey, { heading, bodyText, ctaText })
                        );
                      }
                      setAdvancedMode(on);
                    }}
                  />
                  Tryb zaawansowany (edycja surowego HTML)
                </label>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-xs font-semibold text-gray-400 mb-2">
                  Zmienne — kliknij, aby wstawić do {activeField === "heading" ? "tytułu" : "treści"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={insertInlinePromo}
                    className="text-xs px-2 py-1 rounded border-2 border-dashed border-[#f36e21] bg-[#2a2930] hover:bg-[#34333b] text-gray-200"
                    title="Wstawia kod z pomarańczową ramką bezpośrednio w tekście. Możesz użyć wielu różnych kodów w jednym mailu."
                  >
                    <span className="text-[#f36e21] font-bold">{"{{promo:KOD}}"}</span>
                    <span className="text-gray-400 ml-1">— Kod promo (inline, w ramce)</span>
                  </button>
                  {PERSONALIZATION.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => insertVar(p.key)}
                      className="text-xs px-2 py-1 rounded border border-white/10 bg-[#2a2930] hover:bg-[#34333b] text-gray-200"
                      title={`Przykład: ${p.sample}`}
                    >
                      <span className="text-[#f36e21]">{`{{${p.key}}}`}</span>
                      <span className="text-gray-400 ml-1">— {p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={card}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold">Podgląd (Live)</h2>
                <div className="flex gap-2">
                  <button
                    className={previewMode === "desktop" ? btnPrimary : btnGhost}
                    onClick={() => setPreviewMode("desktop")}
                  >
                    Desktop
                  </button>
                  <button
                    className={previewMode === "mobile" ? btnPrimary : btnGhost}
                    onClick={() => setPreviewMode("mobile")}
                  >
                    Mobile
                  </button>
                </div>
              </div>
              <div className="bg-[#0f0e13] rounded-md p-3 overflow-auto flex justify-center">
                <iframe
                  title="preview"
                  srcDoc={renderedPreview}
                  style={{
                    width: previewMode === "mobile" ? 380 : "100%",
                    height: 600,
                    border: "0",
                    background: "#fff",
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                className={btnGhost}
                onClick={() => launch(false)}
                disabled={sending || !count?.eligible}
              >
                {scheduledAt ? "Zaplanuj" : "Zapisz jako kolejkę"}
              </button>
              <button
                className={btnPrimary}
                onClick={() => launch(true)}
                disabled={sending || !count?.eligible || !!scheduledAt}
              >
                {sending ? "Wysyłam…" : `Wyślij teraz (${count?.eligible ?? 0})`}
              </button>
            </div>
          </div>

          {/* PRAWA: Personalizacja + podgląd danych */}
          <div className="space-y-4">
            <div className={card}>
              <h2 className="font-bold mb-3">Personalizacja</h2>
              <div className="space-y-1 text-xs">
                {PERSONALIZATION.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => insertVar(p.key)}
                    className="w-full text-left flex justify-between items-center px-2 py-2 rounded hover:bg-white/5"
                  >
                    <span>
                      <span className="text-[#f36e21] font-mono">{`{{${p.key}}}`}</span>
                      <span className="text-gray-400 block text-[11px]">{p.label}</span>
                    </span>
                    <span className="text-gray-500 truncate ml-2 max-w-[90px]">
                      {previewVars[p.key] ?? p.sample}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={card}>
              <h2 className="font-bold mb-2">Compliance</h2>
              <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                <li>Link wypisz się dodawany automatycznie</li>
                <li>Wypisani wykluczani z wysyłki</li>
                <li>UTM auto-wstrzykiwany w linki</li>
                <li>Open pixel + click tracking</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === "campaigns" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4">
          <div className={card}>
            <h2 className="font-bold mb-3">Kampanie</h2>
            <div className="space-y-2 max-h-[70vh] overflow-auto">
              {campaigns.length === 0 && (
                <div className="text-sm text-gray-500">Brak kampanii.</div>
              )}
              {campaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openCampaign(c.id)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    selectedCampaign === c.id
                      ? "bg-[#f36e21]/10 border-[#f36e21]/50"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{c.name}</div>
                      <div className="text-xs text-gray-400 truncate">{c.subject}</div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Wysłane: {c.sent_count}/{c.recipients_count}</span>
                    <span>Open: {c.opens_count}</span>
                    <span>Click: {c.clicks_count}</span>
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1">
                    {new Date(c.created_at).toLocaleString("pl-PL")}
                    {c.scheduled_at
                      ? ` · zaplanowano: ${new Date(c.scheduled_at).toLocaleString("pl-PL")}`
                      : ""}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={card}>
            {!campaignDetails && (
              <div className="text-sm text-gray-500">Wybierz kampanię z listy.</div>
            )}
            {campaignDetails && (
              <>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div>
                    <h2 className="text-xl font-bold">{campaignDetails.campaign.name}</h2>
                    <div className="text-sm text-gray-400">
                      {campaignDetails.campaign.subject}
                    </div>
                  </div>
                  <button
                    className={`${btnGhost} !bg-red-500/20 hover:!bg-red-500/30 !text-red-300`}
                    onClick={() => deleteCampaign(campaignDetails.campaign.id)}
                  >
                    Usuń
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                  <Stat label="Status" value={campaignDetails.campaign.status} />
                  <Stat
                    label="Wysłane"
                    value={`${campaignDetails.campaign.sent_count}/${campaignDetails.campaign.recipients_count}`}
                  />
                  <Stat label="Otwarcia" value={String(campaignDetails.campaign.opens_count)} />
                  <Stat label="Kliknięcia" value={String(campaignDetails.campaign.clicks_count)} />
                </div>
                <div className="overflow-auto max-h-[55vh] border border-white/5 rounded">
                  <table className="w-full text-xs">
                    <thead className="bg-white/5 text-gray-400">
                      <tr>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Wariant</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Wysłano</th>
                        <th className="text-left p-2">Otwarcia</th>
                        <th className="text-left p-2">Kliknięcia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignDetails.logs.map((l) => (
                        <tr key={l.id} className="border-t border-white/5">
                          <td className="p-2">{l.to_email}</td>
                          <td className="p-2">{l.variant}</td>
                          <td className="p-2">
                            <StatusBadge status={l.status} small />
                          </td>
                          <td className="p-2 text-gray-500">
                            {l.sent_at ? new Date(l.sent_at).toLocaleString("pl-PL") : "—"}
                          </td>
                          <td className="p-2">{l.opens}</td>
                          <td className="p-2">{l.clicks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] rounded p-2">
      <div className="text-[11px] uppercase text-gray-500">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

function StatusBadge({ status, small }: { status: string; small?: boolean }) {
  const map: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-300",
    queued: "bg-blue-500/20 text-blue-300",
    sending: "bg-yellow-500/20 text-yellow-300",
    sent: "bg-green-500/20 text-green-300",
    pending: "bg-blue-500/20 text-blue-300",
    failed: "bg-red-500/20 text-red-300",
    skipped: "bg-gray-500/20 text-gray-400",
    cancelled: "bg-gray-500/20 text-gray-400",
  };
  const pl: Record<string, string> = {
    draft: "Szkic",
    queued: "Kolejka",
    sending: "Wysyłam",
    sent: "Wysłane",
    pending: "Oczekuje",
    failed: "Błąd",
    skipped: "Pominięte",
    cancelled: "Anulowane",
  };
  return (
    <span
      className={`inline-block rounded-full ${small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"} font-semibold ${
        map[status] || "bg-white/5 text-gray-300"
      }`}
    >
      {pl[status] || status}
    </span>
  );
}
