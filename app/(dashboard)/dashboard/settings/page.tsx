"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  User,
  Palette,
  CreditCard,
  Save,
  Shield,
  Zap,
  Star,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { saveBrandPresetAction, getBrandPresetsAction } from "@/lib/actions/presets";

const PLANS = [
  { id: "free", name: "Free", price: "$0", credits: 20, current: true, features: ["20 free starter credits", "Gemini 2.0 Flash generation", "Standard resolution exports"] },
  { id: "starter", name: "Starter", price: "$19", credits: 200, current: false, features: ["200 credits/mo", "FLUX 1.1 Pro & Imagen 3", "No watermark", "High resolution", "Priority queue"] },
  { id: "pro", name: "Pro", price: "$49", credits: 800, current: false, highlight: true, features: ["800 credits/mo", "4× ESRGAN upscaling", "Brand Model locking", "All AI providers", "Priority queue"] },
  { id: "business", name: "Business", price: "$149", credits: 3000, current: false, features: ["3,000 credits/mo", "4× ESRGAN upscaling", "Unlimited Brand Presets", "Batch generation", "API access"] },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "brand" | "billing">("billing");
  const [presetName, setPresetName] = useState("My Brand Defaults");
  const [bgStyle, setBgStyle] = useState("marble-white");
  const [modelGender, setModelGender] = useState("Female");
  const [defaultRatio, setDefaultRatio] = useState("1:1");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);

  const tabs = [
    { id: "billing" as const, label: "Billing & Credits", icon: CreditCard },
    { id: "brand" as const, label: "Brand Presets", icon: Palette },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  useEffect(() => {
    getBrandPresetsAction().then((res) => {
      if (res.presets && res.presets.length > 0) {
        const p = res.presets[0].presetJson as Record<string, string>;
        if (p.name) setPresetName(p.name);
        if (p.defaultBg) setBgStyle(p.defaultBg);
        if (p.defaultGender) setModelGender(p.defaultGender);
        if (p.defaultRatio) setDefaultRatio(p.defaultRatio);
      }
    });
  }, []);

  const handleSavePreset = async () => {
    setIsSavingPreset(true);
    const res = await saveBrandPresetAction({
      name: presetName,
      defaultBg: bgStyle,
      defaultGender: modelGender,
      defaultRatio,
      customPrompt,
    });
    setIsSavingPreset(false);
    if (res.success) {
      localStorage.setItem("zonex_default_bg", bgStyle);
      localStorage.setItem("zonex_default_gender", modelGender);
      localStorage.setItem("zonex_default_ratio", defaultRatio);
      toast.success("Brand preset saved and applied!");
    } else {
      toast.error(res.error ?? "Failed to save preset");
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") return;
    setIsCheckingOut(planId);
    const toastId = toast.loading("Redirecting to secure Stripe Checkout...");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      toast.dismiss(toastId);
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Could not initiate checkout session.");
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("Stripe checkout request failed.");
    } finally {
      setIsCheckingOut(null);
    }
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 840, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 24 }}>Settings & Billing</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 0 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              border: "none",
              background: "transparent",
              color: activeTab === t.id ? "white" : "var(--text-secondary)",
              fontWeight: activeTab === t.id ? 600 : 400,
              fontSize: "0.87rem",
              cursor: "pointer",
              borderBottom: activeTab === t.id ? "2px solid var(--brand-500)" : "2px solid transparent",
              marginBottom: -1,
              transition: "all 0.15s",
            }}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <div>
          {/* Credits summary */}
          <div
            className="card"
            style={{
              padding: 24,
              marginBottom: 28,
              background: "linear-gradient(135deg, rgba(26,95,248,0.12), rgba(139,92,246,0.08))",
              border: "1px solid rgba(26,95,248,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, var(--brand-500), var(--accent-500))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Zap size={26} color="white" />
              </div>
              <div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 2 }}>Current balance</div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "white" }}>
                  20 <span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--text-secondary)" }}>credits</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Free plan · resets monthly</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleUpgrade("credits_100")}
                className="btn-secondary"
                style={{ fontSize: "0.8rem", padding: "8px 14px" }}
              >
                +100 Credits ($10)
              </button>
            </div>
          </div>

          {/* Plans */}
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Upgrade Subscription</h2>
          <div id="billing" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: plan.highlight
                    ? "linear-gradient(160deg, rgba(26,95,248,0.14), rgba(139,92,246,0.10))"
                    : "var(--bg-raised)",
                  border: `1px solid ${plan.highlight ? "rgba(26,95,248,0.4)" : plan.current ? "rgba(34,197,94,0.4)" : "var(--border-subtle)"}`,
                  borderRadius: 12,
                  padding: 20,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {plan.highlight && (
                    <div
                      className="badge badge-purple"
                      style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: "0.62rem" }}
                    >
                      <Star size={9} /> Most Popular
                    </div>
                  )}
                  {plan.current && (
                    <div
                      className="badge badge-green"
                      style={{ position: "absolute", top: -10, right: 12, fontSize: "0.62rem" }}
                    >
                      <Check size={9} /> Current
                    </div>
                  )}
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ fontSize: "1.7rem", fontWeight: 800, marginBottom: 2 }}>
                    {plan.price}
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 400 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 14 }}>{plan.credits.toLocaleString()} credits</div>
                  <ul style={{ margin: "0 0 16px", padding: "0 0 0 14px", fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                    {plan.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className={plan.highlight ? "btn-primary" : "btn-secondary"}
                  disabled={plan.current || isCheckingOut === plan.id}
                  style={{
                    width: "100%",
                    padding: "9px",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    opacity: plan.current ? 0.6 : 1,
                  }}
                >
                  {isCheckingOut === plan.id ? (
                    <><Loader2 size={13} className="animate-spin" /> Redirecting...</>
                  ) : plan.current ? (
                    "Active Plan"
                  ) : (
                    <>{plan.name === "Business" ? "Get Business" : "Upgrade"} <ExternalLink size={12} /></>
                  )}
                </button>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 16, textAlign: "center" }}>
            Payments are securely encrypted and handled via Stripe · Cancel or switch plans anytime
          </p>
        </div>
      )}

      {/* Brand Presets Tab */}
      {activeTab === "brand" && (
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>Brand Design Presets</h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 20 }}>
            Save default scenes, models, and dimensions so every team generation adheres to your brand aesthetic.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Preset Title</label>
              <input
                className="input-base"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Default Product Background</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["marble-white", "minimalist-studio", "gradient-dark", "outdoor-nature", "wood-oak", "concrete"].map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setBgStyle(bg)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 7,
                      border: `1px solid ${bgStyle === bg ? "var(--brand-500)" : "var(--border-default)"}`,
                      background: bgStyle === bg ? "rgba(26,95,248,0.12)" : "var(--bg-input)",
                      color: bgStyle === bg ? "#60a5fa" : "var(--text-secondary)",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    {bg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Default AI Model Gender</label>
              <div style={{ display: "flex", gap: 6 }}>
                {["Female", "Male", "Non-binary"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setModelGender(g)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 7,
                      border: `1px solid ${modelGender === g ? "var(--accent-500)" : "var(--border-default)"}`,
                      background: modelGender === g ? "rgba(139,92,246,0.12)" : "var(--bg-input)",
                      color: modelGender === g ? "#a78bfa" : "var(--text-secondary)",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Default Aspect Ratio</label>
              <div style={{ display: "flex", gap: 6 }}>
                {["1:1", "4:5", "9:16", "16:9"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setDefaultRatio(r)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 7,
                      border: `1px solid ${defaultRatio === r ? "var(--brand-500)" : "var(--border-default)"}`,
                      background: defaultRatio === r ? "rgba(26,95,248,0.12)" : "var(--bg-input)",
                      color: defaultRatio === r ? "#60a5fa" : "var(--text-secondary)",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Persistent Brand Style Prompt</label>
              <textarea
                className="input-base"
                rows={2}
                placeholder="e.g. ultra luxury minimalism, soft diffused natural daylight, commercial catalog finish"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </div>
            <button
              onClick={handleSavePreset}
              disabled={isSavingPreset}
              className="btn-primary"
              style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6 }}
            >
              {isSavingPreset ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Brand Preset
            </button>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 20 }}>Account Details</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Display Name</label>
              <input className="input-base" defaultValue="Store Owner" />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Email</label>
              <input className="input-base" defaultValue="seller@zonex.ai" disabled style={{ opacity: 0.6 }} />
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>Managed securely by your Clerk authentication session</p>
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  padding: "10px 14px",
                  background: "rgba(34,197,94,0.06)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: 8,
                }}
              >
                <Shield size={14} color="#4ade80" />
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  Account protected with <strong style={{ color: "white" }}>Clerk Auth</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
