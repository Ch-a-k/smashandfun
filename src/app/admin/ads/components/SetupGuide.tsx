"use client";
import { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

interface SetupGuideProps {
  error?: string;
}

const steps = [
  {
    varName: "GOOGLE_ADS_DEVELOPER_TOKEN",
    desc: "Otwórz Google Ads → Narzędzia i ustawienia → Centrum API → Developer Token",
  },
  {
    varName: "GOOGLE_ADS_CLIENT_ID + CLIENT_SECRET",
    desc: "Google Cloud Console → API i usługi → Dane logowania → Utwórz dane OAuth 2.0 (typ: Aplikacja komputerowa)",
  },
  {
    varName: "GOOGLE_ADS_REFRESH_TOKEN",
    desc: "Użyj OAuth Playground lub skrypt z zakresem https://www.googleapis.com/auth/adwords, aby uzyskać refresh token",
  },
  {
    varName: "GOOGLE_ADS_CUSTOMER_ID",
    desc: "10-cyfrowy identyfikator konta z nagłówka Google Ads (bez myślników)",
  },
  {
    varName: "Dodaj do Vercel",
    desc: "Settings → Environment Variables → dodaj wszystkie 5 zmiennych → Redeploy",
  },
];

const codeStyle: React.CSSProperties = {
  background: "#18171c",
  padding: "2px 6px",
  borderRadius: 4,
  fontFamily: "monospace",
  color: "#f36e21",
};

export default function SetupGuide({ error }: SetupGuideProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Warning banner */}
      <div
        style={{
          background: "#3a2a0e",
          border: "1px solid #f9a825",
          borderRadius: 10,
          padding: "16px 20px",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <FaExclamationTriangle
          size={20}
          color="#f9a825"
          style={{ marginTop: 2, flexShrink: 0 }}
        />
        <div style={{ fontSize: 13, flex: 1 }}>
          <div>
            <b style={{ color: "#f9a825" }}>Google Ads API nie jest podłączony</b>
          </div>
          <div style={{ color: "#ccc", marginTop: 4 }}>
            Dane o wydatkach, kliknięciach i wyświetleniach będą dostępne po dodaniu zmiennych środowiskowych.
          </div>
          <div style={{ marginTop: 4 }}>
            <b>Dane o przychodach z rezerwacji (Supabase) działają już teraz.</b>
          </div>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              marginTop: 10,
              background: "transparent",
              border: "1px solid #f9a825",
              borderRadius: 6,
              color: "#f9a825",
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 12px",
              cursor: "pointer",
            }}
          >
            {expanded ? "Ukryj instrukcję" : "Pokaż instrukcję konfiguracji"}
          </button>
        </div>
      </div>

      {/* Expanded steps */}
      {expanded && (
        <div
          style={{
            background: "#23222a",
            border: "1px solid #f9a825",
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
            padding: "16px 20px",
          }}
        >
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {steps.map((step, i) => (
              <li key={i} style={{ marginBottom: 12, fontSize: 13, color: "#ccc" }}>
                <code style={codeStyle}>{step.varName}</code>
                <span style={{ color: "#aaa", marginLeft: 8 }}>— {step.desc}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Error box */}
      {error && (
        <div
          style={{
            marginTop: 12,
            background: "#2a1515",
            border: "1px solid #ea4335",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 13,
            color: "#ea4335",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
