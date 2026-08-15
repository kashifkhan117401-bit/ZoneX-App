"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Camera,
  Users,
  FolderOpen,
  Settings,
  Zap,
  ChevronRight,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/dashboard/product", icon: Camera, label: "Product Photos", badge: "2 cr" },
  { href: "/dashboard/model", icon: Users, label: "AI Model Studio", badge: "3 cr" },
  { href: "/dashboard/projects", icon: FolderOpen, label: "Projects" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--brand-500), var(--accent-500))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Zap size={18} color="white" />
          </div>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "1.05rem",
              color: "white",
            }}
          >
            Zone<span style={{ background: "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>X</span>
          </span>
        </Link>
      </div>

      {/* Credits badge */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div
          style={{
            background: "linear-gradient(135deg, rgba(26,95,248,0.12), rgba(139,92,246,0.08))",
            border: "1px solid rgba(26,95,248,0.25)",
            borderRadius: 10,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 2 }}>Credits remaining</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "white" }}>20</div>
          </div>
          <Link href="/dashboard/settings#billing">
            <button
              style={{
                background: "rgba(26,95,248,0.2)",
                border: "1px solid rgba(26,95,248,0.35)",
                borderRadius: 7,
                color: "#60a5fa",
                fontSize: "0.72rem",
                fontWeight: 600,
                padding: "5px 10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <CreditCard size={11} /> Top up
            </button>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "8px 8px", overflowY: "auto" }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)", padding: "8px 8px 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Studio
        </div>
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none", display: "block", marginBottom: 2 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 8,
                  background: active
                    ? "linear-gradient(135deg, rgba(26,95,248,0.18), rgba(139,92,246,0.12))"
                    : "transparent",
                  border: active ? "1px solid rgba(26,95,248,0.25)" : "1px solid transparent",
                  color: active ? "white" : "var(--text-secondary)",
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}
                className={!active ? "sidebar-nav-item" : ""}
              >
                <item.icon size={16} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "0.875rem", fontWeight: active ? 600 : 400, flex: 1 }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: "0.62rem",
                      background: "rgba(139,92,246,0.15)",
                      border: "1px solid rgba(139,92,246,0.25)",
                      color: "#a78bfa",
                      borderRadius: 99,
                      padding: "1px 6px",
                      fontWeight: 600,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom user area */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <UserButton
          appearance={{
            elements: {
              avatarBox: { width: 32, height: 32 },
            },
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            My Account
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Free plan</div>
        </div>
        <Sparkles size={14} color="var(--text-muted)" />
      </div>

      <style>{`
        .sidebar-nav-item:hover {
          background: rgba(255,255,255,0.04) !important;
          color: white !important;
        }
      `}</style>
    </aside>
  );
}
