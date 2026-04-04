"use client";
import { ViewTab } from "../types";

interface ViewTabsProps {
  activeTab: ViewTab;
  onChange: (tab: ViewTab) => void;
}

const TABS: { key: ViewTab; label: string }[] = [
  { key: "overview", label: "Przegląd" },
  { key: "clients", label: "Klienci" },
  { key: "packages", label: "Pakiety" },
  { key: "funnel", label: "Lejek" },
  { key: "trend", label: "Trend" },
];

export default function ViewTabs({ activeTab, onChange }: ViewTabsProps) {
  return (
    <div
      style={{
        background: "#1a191f",
        borderRadius: 10,
        padding: 3,
        display: "flex",
        gap: 2,
        marginBottom: 24,
        width: "fit-content",
      }}
    >
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: "8px 16px",
            borderRadius: 7,
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            background: activeTab === tab.key ? "#f36e21" : "transparent",
            color: activeTab === tab.key ? "#fff" : "#666",
            transition: "all 0.15s",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
