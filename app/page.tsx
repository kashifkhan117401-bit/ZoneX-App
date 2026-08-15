import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Sparkles,
  Zap,
  Star,
  ArrowRight,
  Camera,
  Users,
  Layers,
} from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const features = [
    {
      icon: Camera,
      title: "AI Product Photography",
      desc: "Replace bland backgrounds with studio, lifestyle, or custom scenes. Photorealistic lighting, shadows, and reflections in seconds.",
      badge: "2 credits / image",
      color: "badge-blue",
    },
    {
      icon: Users,
      title: "AI Human Model Studio",
      desc: "Generate fully synthetic AI models wearing, holding, or using your products. Customize gender, age, ethnicity, pose, and scene.",
      badge: "3 credits / image",
      color: "badge-purple",
    },
    {
      icon: Layers,
      title: "Brand Consistency Mode",
      desc: "Lock in your virtual model's identity and reuse it across entire collections. One brand, one face, infinite shots.",
      badge: "Coming soon",
      color: "badge-green",
    },
  ];

  const plans = [
    { name: "Free", price: "$0", credits: "20 credits/mo", cta: "Get started", highlight: false },
    { name: "Starter", price: "$19", credits: "200 credits/mo", cta: "Start free trial", highlight: false },
    { name: "Pro", price: "$49", credits: "800 credits/mo", cta: "Go Pro", highlight: true },
    { name: "Business", price: "$149", credits: "3,000 credits/mo", cta: "Contact sales", highlight: false },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 40px",
          borderBottom: "1px solid var(--border-subtle)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(6,6,17,0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--brand-500), var(--accent-500))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "1.1rem" }}>
            Zone<span className="gradient-text">X</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <SignInButton mode="modal">
            <button className="btn-secondary" style={{ padding: "8px 18px" }}>Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn-primary" style={{ padding: "8px 18px" }}>Start Free →</button>
          </SignUpButton>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "100px 40px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background orbs */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(26,95,248,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="badge badge-blue" style={{ marginBottom: 24, display: "inline-flex" }}>
          <Sparkles size={12} />
          Powered by FLUX 1.1 Pro · No GPU required
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
            maxWidth: 900,
            margin: "0 auto 24px",
          }}
        >
          Professional product photos
          <br />
          <span className="gradient-text">without a photoshoot</span>
        </h1>

        <p
          style={{
            fontSize: "1.15rem",
            color: "var(--text-secondary)",
            maxWidth: 600,
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          Upload your product. Pick a scene. Get studio-quality images in seconds.
          Generate AI models wearing your clothing, holding your gadgets, using your cosmetics.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <SignUpButton mode="modal">
            <button
              className="btn-primary animate-pulse-glow"
              style={{ padding: "14px 32px", fontSize: "1rem" }}
            >
              Start for free — 20 credits included
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="btn-secondary" style={{ padding: "14px 24px", fontSize: "1rem" }}>
              Sign in <ArrowRight size={16} style={{ display: "inline", marginLeft: 4 }} />
            </button>
          </SignInButton>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 48,
            justifyContent: "center",
            marginTop: 64,
            flexWrap: "wrap",
          }}
        >
          {[["10,000+", "Images generated"], ["~3s", "Avg generation time"], ["6", "Output formats"], ["$0.04", "Per image"]].map(
            ([stat, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "white" }}>{stat}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: 48,
          }}
        >
          Everything you need to sell{" "}
          <span className="gradient-text">visually</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="card gradient-border animate-fade-in"
              style={{ padding: 28 }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, var(--brand-500), var(--accent-500))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <f.icon size={22} color="white" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>{f.title}</h3>
                <span className={`badge ${f.color}`} style={{ fontSize: "0.65rem" }}>{f.badge}</span>
              </div>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, fontSize: "0.9rem" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "80px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, marginBottom: 12 }}>
          Simple, <span className="gradient-text">credit-based</span> pricing
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: 48 }}>
          Pay only for what you generate. No surprise costs.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {plans.map((p) => (
            <div
              key={p.name}
              className={p.highlight ? "gradient-border" : ""}
              style={{
                background: p.highlight
                  ? "linear-gradient(160deg, rgba(26,95,248,0.12), rgba(139,92,246,0.08))"
                  : "var(--bg-raised)",
                border: p.highlight ? "none" : "1px solid var(--border-subtle)",
                borderRadius: 14,
                padding: 24,
                textAlign: "center",
                position: "relative",
              }}
            >
              {p.highlight && (
                <div
                  className="badge badge-purple"
                  style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}
                >
                  <Star size={10} /> Most Popular
                </div>
              )}
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 8, fontWeight: 600 }}>
                {p.name}
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 4 }}>
                {p.price}
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 400 }}>/mo</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 20 }}>{p.credits}</div>
              <SignUpButton mode="modal">
                <button
                  className={p.highlight ? "btn-primary" : "btn-secondary"}
                  style={{ width: "100%", padding: "10px" }}
                >
                  {p.cta}
                </button>
              </SignUpButton>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "32px 40px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
        }}
      >
        © 2025 ZoneX. All rights reserved. · AI-generated images are fully synthetic — no real people.
      </footer>
    </div>
  );
}
