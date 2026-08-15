"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  Users,
  Sparkles,
  Download,
  RotateCcw,
  Loader2,
  Lock,
  Shield,
  Maximize2,
  Sparkle,
  BookmarkCheck,
  FolderPlus,
} from "lucide-react";
import { UploadZone } from "@/components/shared/UploadZone";
import { generateModelAction, type ImageProvider } from "@/lib/actions/generate-model";
import { upscaleAction } from "@/lib/actions/upscale";
import { ProviderSelector, PROVIDERS } from "@/components/canvas/ProviderSelector";
import { fileToBase64 } from "@/lib/gemini";
import { getProjectsAction, type ProjectItem } from "@/lib/actions/projects";

// ──────────────────────────────────────────────────────────
// Configuration Options
// ──────────────────────────────────────────────────────────
const GENDERS = ["Female", "Male", "Non-binary"];
const AGE_RANGES = ["18–24", "25–34", "35–44", "45–55", "55+"];
const ETHNICITIES = [
  "East Asian", "South Asian", "Southeast Asian",
  "Black / African", "Hispanic / Latino",
  "Middle Eastern", "White / Caucasian", "Mixed",
];
const BODY_TYPES = ["Slim", "Athletic", "Average", "Curvy", "Plus-size"];
const HAIR_STYLES = ["Short", "Medium wavy", "Long straight", "Long curly", "Braids", "Buzz cut", "Natural afro"];
const POSES = ["Standing neutral", "Walking", "Sitting", "Arms crossed", "Hands on hips", "Casual lean", "Looking over shoulder"];
const EXPRESSIONS = ["Natural smile", "Editorial / Serious", "Warm & friendly", "Confident", "Candid laughter"];

const SCENES = [
  { id: "studio-white", label: "Studio White", desc: "Clean white cyclorama" },
  { id: "studio-dark", label: "Studio Dark", desc: "Moody dramatic lighting" },
  { id: "urban-street", label: "Urban Street", desc: "City sidewalk with soft bokeh" },
  { id: "modern-loft", label: "Modern Loft", desc: "Bright interior with natural light" },
  { id: "coffee-shop", label: "Coffee Shop", desc: "Warm cozy café atmosphere" },
  { id: "nature-park", label: "Nature / Park", desc: "Lush greenery & golden hour" },
  { id: "luxury-hotel", label: "Luxury Hotel", desc: "Opulent architecture backdrop" },
  { id: "gym-fitness", label: "Gym & Fitness", desc: "Modern aesthetic fitness studio" },
];

const PRODUCT_TYPES = [
  { id: "clothing", label: "Clothing / Apparel" },
  { id: "accessory", label: "Accessory / Jewelry" },
  { id: "cosmetic", label: "Cosmetics / Skincare" },
  { id: "gadget", label: "Gadget / Electronics" },
  { id: "general", label: "General Product" },
];

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1", sub: "Square" },
  { id: "4:5", label: "4:5", sub: "Portrait" },
  { id: "9:16", label: "9:16", sub: "Story / Reel" },
  { id: "16:9", label: "16:9", sub: "Landscape" },
];

export default function ModelPage() {
  const [productFile, setProductFile] = useState<File | null>(null);
  const [productPreviewUrl, setProductPreviewUrl] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [lockedConfig, setLockedConfig] = useState(false);
  const [provider, setProvider] = useState<ImageProvider>("gemini-2.5");
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isUpscaled, setIsUpscaled] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");

  // Model config
  const [gender, setGender] = useState("Female");
  const [ageRange, setAgeRange] = useState("25–34");
  const [ethnicity, setEthnicity] = useState("East Asian");
  const [bodyType, setBodyType] = useState("Athletic");
  const [hairStyle, setHairStyle] = useState("Long straight");
  const [pose, setPose] = useState("Standing neutral");
  const [expression, setExpression] = useState("Natural smile");
  const [scene, setScene] = useState("studio-white");
  const [productType, setProductType] = useState("clothing");
  const [aspectRatio, setAspectRatio] = useState("4:5");

  useEffect(() => {
    getProjectsAction().then((res) => {
      if (res.data) setProjects(res.data);
    });

    const saved = localStorage.getItem("zonex_brand_model");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.ethnicity) setEthnicity(parsed.ethnicity);
        if (parsed.ageRange) setAgeRange(parsed.ageRange);
        if (parsed.bodyType) setBodyType(parsed.bodyType);
        if (parsed.hairStyle) setHairStyle(parsed.hairStyle);
        setLockedConfig(true);
      } catch {
        // ignore
      }
    }
  }, []);

  const handleFile = useCallback((file: File, url: string) => {
    setProductFile(file);
    setProductPreviewUrl(url);
    setGeneratedUrl("");
    setIsUpscaled(false);
  }, []);

  const handleGenerate = () => {
    if (!productPreviewUrl) {
      toast.error("Please upload your product image first.");
      return;
    }
    const providerInfo = PROVIDERS.find((p) => p.id === provider)!;
    startTransition(async () => {
      let base64: string | undefined;
      let mime: string | undefined;
      if (provider.startsWith("gemini") && productFile) {
        try {
          const encoded = await fileToBase64(productFile);
          base64 = encoded.base64;
          mime = encoded.mimeType;
        } catch { /* non-fatal */ }
      }

      const toastId = toast.loading(`Creating model photoshoot with ${providerInfo.name}...`, { duration: 40000 });
      const result = await generateModelAction({
        productImageUrl: productPreviewUrl,
        gender,
        ageRange,
        ethnicity,
        bodyType,
        hairStyle,
        pose,
        expression,
        scene,
        productType,
        aspectRatio,
        provider,
        productImageBase64: base64,
        productImageMime: mime,
      });
      toast.dismiss(toastId);
      if (result.success && result.imageUrl) {
        setGeneratedUrl(result.imageUrl);
        setIsUpscaled(false);
        toast.success(`AI model photoshoot created! (${result.creditsUsed} credits used)`);
      } else {
        toast.error(result.error ?? "Generation failed. Please try another provider.");
      }
    });
  };

  const handleUpscale = async () => {
    if (!generatedUrl || isUpscaling) return;
    setIsUpscaling(true);
    const toastId = toast.loading("Upscaling to 4K ultra high resolution...");
    try {
      const res = await upscaleAction(generatedUrl);
      toast.dismiss(toastId);
      if (res.success && res.imageUrl) {
        setGeneratedUrl(res.imageUrl);
        setIsUpscaled(true);
        toast.success("Image upscaled to 4K ultra-sharp!");
      } else {
        toast.error(res.error ?? "Upscaling failed.");
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("Upscaling failed.");
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleLockModel = () => {
    const nextLocked = !lockedConfig;
    setLockedConfig(nextLocked);
    if (nextLocked) {
      localStorage.setItem("zonex_brand_model", JSON.stringify({ gender, ethnicity, ageRange, bodyType, hairStyle }));
      toast.success("AI Model locked as Brand Model! Future shoots will maintain this model.");
    } else {
      localStorage.removeItem("zonex_brand_model");
      toast.info("Brand model unlocked.");
    }
  };

  const handleDownload = (format: "jpg" | "png" = "jpg") => {
    if (!generatedUrl) return;
    const a = document.createElement("a");
    a.href = generatedUrl;
    a.download = `zonex-model-${Date.now()}.${format}`;
    a.target = "_blank";
    a.click();
    toast.success(`Downloaded as ${format.toUpperCase()}`);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* ── Main Canvas ── */}
      <div style={{ flex: 1, overflow: "auto", padding: 32 }}>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <Users size={22} color="var(--accent-400)" />
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>AI Human Model Studio</h1>
                <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>
                  {PROVIDERS.find((p) => p.id === provider)?.credits} / render
                </span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>
                Generate photorealistic synthetic human models wearing or showcasing your product.
              </p>
            </div>

            {projects.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <FolderPlus size={14} />
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  style={{
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-default)",
                    borderRadius: 6,
                    padding: "3px 8px",
                    fontSize: "0.75rem",
                  }}
                >
                  <option value="">No project folder</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Ethics / Safety banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 10,
              marginBottom: 24,
            }}
          >
            <Shield size={16} color="#4ade80" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              <strong style={{ color: "#4ade80" }}>100% Synthetic AI Models:</strong> Generated faces are fully composite AI humans — never based on real identifiable individuals. Safe for full commercial advertising.
            </span>
          </div>

          {/* Upload product */}
          {!generatedUrl && !isPending && (
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
                STEP 1 — Upload your product (clothing, jewelry, cosmetic, or gadget)
              </div>
              <UploadZone onFile={handleFile} />
            </div>
          )}

          {/* Loading */}
          {isPending && (
            <div
              className="card"
              style={{
                padding: 60,
                textAlign: "center",
                marginBottom: 24,
                background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(26,95,248,0.04))",
              }}
            >
              <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    border: "2px solid rgba(139,92,246,0.2)",
                    borderTop: "2px solid var(--accent-500)",
                    borderRadius: "50%",
                    animation: "spin-slow 1s linear infinite",
                  }}
                />
                <Sparkles
                  size={22}
                  color="var(--accent-400)"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 6 }}>
                Synthesizing AI model photoshoot with {PROVIDERS.find((p) => p.id === provider)?.name}...
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                Generating synthetic model · Fitting product apparel & accessories · Rendering skin texture & studio lighting
              </div>
              <div className="shimmer" style={{ height: 4, borderRadius: 99, marginTop: 24, width: "60%", margin: "24px auto 0" }} />
            </div>
          )}

          {/* Result */}
          {generatedUrl && !isPending && (
            <div className="animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div className="badge badge-purple" style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 5 }}>
                  <Users size={12} /> {gender} · {ethnicity} · {scene}
                </div>
                {isUpscaled && (
                  <span className="badge badge-blue" style={{ fontSize: "0.7rem", display: "flex", alignItems: "center", gap: 4 }}>
                    <Sparkle size={11} /> 4K Ultra High-Res
                  </span>
                )}
              </div>

              <div className="card" style={{ overflow: "hidden", marginBottom: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generatedUrl}
                  alt="Generated model"
                  style={{ width: "100%", maxHeight: "620px", objectFit: "contain", display: "block", borderRadius: 12 }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button onClick={() => handleDownload("jpg")} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Download size={15} /> Download JPG
                </button>
                <button onClick={() => handleDownload("png")} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Download size={15} /> PNG
                </button>
                <button
                  onClick={handleUpscale}
                  disabled={isUpscaling || isUpscaled}
                  className="btn-secondary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    border: isUpscaled ? "1px solid rgba(139,92,246,0.4)" : undefined,
                    color: isUpscaled ? "#a78bfa" : undefined,
                  }}
                >
                  {isUpscaling ? <Loader2 size={15} className="animate-spin" /> : <Maximize2 size={15} />}
                  {isUpscaled ? "4K Enhanced ✓" : "Upscale 4×"}
                </button>
                <button
                  onClick={handleLockModel}
                  className="btn-secondary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: lockedConfig ? "#4ade80" : undefined,
                  }}
                >
                  {lockedConfig ? <BookmarkCheck size={15} /> : <Lock size={15} />}
                  {lockedConfig ? "Brand Model Locked" : "Save as Brand Model"}
                </button>
                <button
                  onClick={() => setGeneratedUrl("")}
                  className="btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <RotateCcw size={15} /> New Model
                </button>
                <button
                  onClick={handleGenerate}
                  className="btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Sparkles size={15} /> Re-shoot Pose
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Configurator Sidebar ── */}
      <aside
        style={{
          width: 390,
          background: "var(--bg-card)",
          borderLeft: "1px solid var(--border-subtle)",
          padding: 24,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 2px" }}>Model & Scene Studio</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>Configure human traits & surroundings</p>
          </div>
          <button
            onClick={handleLockModel}
            title={lockedConfig ? "Unlock model" : "Lock this model across shoots"}
            style={{
              padding: "5px 10px",
              borderRadius: 7,
              border: `1px solid ${lockedConfig ? "rgba(34,197,94,0.4)" : "var(--border-default)"}`,
              background: lockedConfig ? "rgba(34,197,94,0.1)" : "var(--bg-input)",
              color: lockedConfig ? "#4ade80" : "var(--text-muted)",
              fontSize: "0.72rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Lock size={12} />
            {lockedConfig ? "Locked" : "Lock"}
          </button>
        </div>

        {/* AI Provider Selector */}
        <div>
          <ProviderSelector value={provider} onChange={setProvider} />
        </div>

        {/* Product Type */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
            Product Category
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PRODUCT_TYPES.map((pt) => (
              <button
                key={pt.id}
                onClick={() => setProductType(pt.id)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 7,
                  border: `1px solid ${productType === pt.id ? "var(--accent-500)" : "var(--border-default)"}`,
                  background: productType === pt.id ? "rgba(139,92,246,0.12)" : "var(--bg-input)",
                  color: productType === pt.id ? "#a78bfa" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                {pt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
            Gender
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {GENDERS.map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  borderRadius: 7,
                  border: `1px solid ${gender === g ? "var(--accent-500)" : "var(--border-default)"}`,
                  background: gender === g ? "rgba(139,92,246,0.12)" : "var(--bg-input)",
                  color: gender === g ? "#a78bfa" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Age Range */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
            Age Range
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {AGE_RANGES.map((a) => (
              <button
                key={a}
                onClick={() => setAgeRange(a)}
                style={{
                  flex: 1,
                  padding: "6px 4px",
                  borderRadius: 7,
                  border: `1px solid ${ageRange === a ? "var(--accent-500)" : "var(--border-default)"}`,
                  background: ageRange === a ? "rgba(139,92,246,0.12)" : "var(--bg-input)",
                  color: ageRange === a ? "#a78bfa" : "var(--text-secondary)",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Ethnicity */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
            Ethnicity
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {ETHNICITIES.map((e) => (
              <button
                key={e}
                onClick={() => setEthnicity(e)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 7,
                  border: `1px solid ${ethnicity === e ? "var(--accent-500)" : "var(--border-default)"}`,
                  background: ethnicity === e ? "rgba(139,92,246,0.12)" : "var(--bg-input)",
                  color: ethnicity === e ? "#a78bfa" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Scene */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
            Environment / Scene
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {SCENES.map((s) => (
              <button
                key={s.id}
                onClick={() => setScene(s.id)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 7,
                  border: `1px solid ${scene === s.id ? "var(--accent-500)" : "var(--border-default)"}`,
                  background: scene === s.id ? "rgba(139,92,246,0.12)" : "var(--bg-input)",
                  color: scene === s.id ? "#a78bfa" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pose & Expression */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Pose
            </label>
            <select
              className="input-base"
              value={pose}
              onChange={(e) => setPose(e.target.value)}
              style={{ fontSize: "0.75rem", padding: "6px 8px" }}
            >
              {POSES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Expression
            </label>
            <select
              className="input-base"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              style={{ fontSize: "0.75rem", padding: "6px 8px" }}
            >
              {EXPRESSIONS.map((ex) => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
            Output Format
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r.id}
                onClick={() => setAspectRatio(r.id)}
                style={{
                  flex: 1,
                  padding: "6px",
                  borderRadius: 7,
                  border: `1px solid ${aspectRatio === r.id ? "var(--accent-500)" : "var(--border-default)"}`,
                  background: aspectRatio === r.id ? "rgba(139,92,246,0.12)" : "var(--bg-input)",
                  color: aspectRatio === r.id ? "#a78bfa" : "var(--text-secondary)",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 700 }}>{r.id}</div>
                <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{r.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate action */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 16 }}>
          <button
            onClick={handleGenerate}
            disabled={isPending || !productPreviewUrl}
            className="btn-primary"
            style={{
              width: "100%",
              padding: "13px",
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "linear-gradient(135deg, var(--accent-500), var(--brand-500))",
            }}
          >
            {isPending ? (
              <><Loader2 size={16} style={{ animation: "spin-slow 1s linear infinite" }} /> Generating Model Shoot...</>
            ) : (
              <><Sparkles size={16} /> Generate Model Shoot</>
            )}
          </button>
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.72rem", marginTop: 8 }}>
            {PROVIDERS.find((p) => p.id === provider)?.credits} per render · 100% Synthetic AI
          </p>
        </div>
      </aside>
    </div>
  );
}
