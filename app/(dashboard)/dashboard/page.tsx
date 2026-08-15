import Link from "next/link";
import {
  Camera,
  Users,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const recentGenerations = [
    { id: "1", type: "product", label: "Studio marble background", time: "2 min ago", url: "https://picsum.photos/seed/prod1/400/400" },
    { id: "2", type: "model", label: "AI model — streetwear", time: "15 min ago", url: "https://picsum.photos/seed/model1/400/400" },
    { id: "3", type: "product", label: "Outdoor lifestyle scene", time: "1 hr ago", url: "https://picsum.photos/seed/prod2/400/400" },
    { id: "4", type: "model", label: "AI model — cosmetics", time: "3 hrs ago", url: "https://picsum.photos/seed/model2/400/400" },
  ];

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 6 }}>
          Welcome to <span className="gradient-text">ZoneX</span> ✦
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Generate professional product photos and AI model shoots in seconds.
        </p>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
        <Link href="/dashboard/product" style={{ textDecoration: "none" }}>
          <div
            className="card gradient-border"
            style={{
              padding: 24,
              background: "linear-gradient(135deg, rgba(26,95,248,0.10), rgba(26,95,248,0.04))",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, var(--brand-500), #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Camera size={22} color="white" />
              </div>
              <ArrowRight size={18} color="var(--text-muted)" />
            </div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 6 }}>Product Photography</h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              Upload a product and swap backgrounds with studio, lifestyle, or custom scenes.
            </p>
            <div style={{ marginTop: 14 }}>
              <span className="badge badge-blue" style={{ fontSize: "0.65rem" }}><Zap size={10} /> 2 credits per image</span>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/model" style={{ textDecoration: "none" }}>
          <div
            className="card gradient-border"
            style={{
              padding: 24,
              background: "linear-gradient(135deg, rgba(139,92,246,0.10), rgba(139,92,246,0.04))",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, var(--accent-500), #c084fc)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users size={22} color="white" />
              </div>
              <ArrowRight size={18} color="var(--text-muted)" />
            </div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 6 }}>AI Model Studio</h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              Generate fully synthetic AI models wearing, holding, or using your products.
            </p>
            <div style={{ marginTop: 14 }}>
              <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}><Sparkles size={10} /> 3 credits per image</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { icon: ImageIcon, label: "Total Generated", value: "0", sub: "images this month" },
          { icon: TrendingUp, label: "Credits Used", value: "0", sub: "of 20 free credits" },
          { icon: Clock, label: "Last Generation", value: "—", sub: "no generations yet" },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <stat.icon size={15} color="var(--text-muted)" />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginBottom: 2 }}>{stat.value}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Generations */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Recent Generations</h2>
          <Link href="/dashboard/projects" style={{ fontSize: "0.8rem", color: "#60a5fa", textDecoration: "none" }}>
            View all →
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {recentGenerations.map((gen) => (
            <div key={gen.id} className="card" style={{ overflow: "hidden", cursor: "pointer" }}>
              <div style={{ position: "relative", aspectRatio: "1", background: "var(--bg-overlay)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gen.url}
                  alt={gen.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", top: 8, left: 8 }}>
                  <span className={`badge ${gen.type === "product" ? "badge-blue" : "badge-purple"}`} style={{ fontSize: "0.6rem" }}>
                    {gen.type === "product" ? "Product" : "Model"}
                  </span>
                </div>
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {gen.label}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{gen.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
