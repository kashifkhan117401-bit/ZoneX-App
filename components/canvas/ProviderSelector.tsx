"use client";

export type ImageProvider = "gemini-2.5" | "gemini-3.1" | "fal-flux";

export interface ProviderOption {
  id: ImageProvider;
  name: string;
  model: string;
  badge: string;
  badgeColor: "green" | "purple" | "blue";
  credits: string;
  description: string;
  needsKey: "GEMINI_API_KEY" | "FAL_KEY";
}

export const PROVIDERS: ProviderOption[] = [
  {
    id: "gemini-2.5",
    name: "Gemini 2.5 Flash",
    model: "gemini-2.5-flash-image",
    badge: "Google AI",
    badgeColor: "green",
    credits: "1 cr",
    description: "Real-time multimodal product photography from Google.",
    needsKey: "GEMINI_API_KEY",
  },
  {
    id: "gemini-3.1",
    name: "Gemini 3.1 Flash Image",
    model: "gemini-3.1-flash-image",
    badge: "Google AI Ultra",
    badgeColor: "purple",
    credits: "2 cr",
    description: "Google's highest fidelity photorealistic model.",
    needsKey: "GEMINI_API_KEY",
  },
  {
    id: "fal-flux",
    name: "FLUX 1.1 Pro",
    model: "fal-ai/flux-pro/v1.1",
    badge: "fal.ai",
    badgeColor: "blue",
    credits: "2 cr",
    description: "Studio-grade commercial product rendering.",
    needsKey: "FAL_KEY",
  },
];

const BADGE_STYLES: Record<
  "blue" | "green" | "purple",
  { bg: string; border: string; color: string }
> = {
  blue:   { bg: "rgba(26,95,248,0.12)",   border: "rgba(26,95,248,0.3)",   color: "#60a5fa" },
  green:  { bg: "rgba(34,197,94,0.10)",   border: "rgba(34,197,94,0.3)",   color: "#4ade80" },
  purple: { bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.3)",  color: "#a78bfa" },
};

interface ProviderSelectorProps {
  value: ImageProvider;
  onChange: (p: ImageProvider) => void;
}

export function ProviderSelector({ value, onChange }: ProviderSelectorProps) {
  return (
    <div>
      <label
        style={{
          fontSize: "0.78rem",
          fontWeight: 600,
          color: "var(--text-secondary)",
          display: "block",
          marginBottom: 8,
        }}
      >
        AI Generation Engine
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {PROVIDERS.map((p) => {
          const selected = value === p.id;
          const badge = BADGE_STYLES[p.badgeColor];
          return (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 9,
                border: `1px solid ${selected ? (p.badgeColor === "blue" ? "var(--brand-500)" : p.badgeColor === "green" ? "rgba(34,197,94,0.5)" : "var(--accent-500)") : "var(--border-default)"}`,
                background: selected ? badge.bg : "var(--bg-input)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
                position: "relative",
              }}
            >
              {/* Model icon */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 7,
                  background: selected ? badge.bg : "rgba(255,255,255,0.04)",
                  border: `1px solid ${selected ? badge.border : "var(--border-subtle)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "0.85rem",
                }}
              >
                {p.id === "gemini-2.5" ? "⚡" : p.id === "gemini-3.1" ? "✦" : "🎨"}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: selected ? "white" : "var(--text-primary)",
                    }}
                  >
                    {p.name}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 600,
                      padding: "1px 6px",
                      borderRadius: 99,
                      background: badge.bg,
                      border: `1px solid ${badge.border}`,
                      color: badge.color,
                    }}
                  >
                    {p.badge}
                  </span>
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.description}
                </div>
              </div>

              {/* Credits pill */}
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 99,
                  background: selected ? badge.bg : "rgba(255,255,255,0.05)",
                  border: `1px solid ${selected ? badge.border : "var(--border-subtle)"}`,
                  color: selected ? badge.color : "var(--text-muted)",
                  flexShrink: 0,
                }}
              >
                {p.credits}
              </span>

              {/* Selected indicator */}
              {selected && (
                <div
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: badge.color,
                    boxShadow: `0 0 8px ${badge.color}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
