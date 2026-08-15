"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  Camera,
  Download,
  Sparkles,
  RotateCcw,
  Loader2,
  Maximize2,
  FolderPlus,
  Layers,
  Sparkle,
} from "lucide-react";
import { UploadZone } from "@/components/shared/UploadZone";
import { BeforeAfterSlider } from "@/components/canvas/BeforeAfterSlider";
import { generateProductAction, type ImageProvider } from "@/lib/actions/generate-product";
import { upscaleAction } from "@/lib/actions/upscale";
import { ProviderSelector, PROVIDERS } from "@/components/canvas/ProviderSelector";
import { fileToBase64 } from "@/lib/gemini";
import { getProjectsAction, type ProjectItem } from "@/lib/actions/projects";

// ──────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────
const BACKGROUNDS = [
  { id: "marble-white", label: "White Marble", prompt: "white marble surface, bright studio lighting, soft reflections" },
  { id: "wood-oak", label: "Oak Wood", prompt: "warm oak wood table surface, natural side lighting" },
  { id: "minimalist-studio", label: "Studio White", prompt: "clean white studio backdrop, soft diffused lighting, professional" },
  { id: "gradient-dark", label: "Dark Gradient", prompt: "deep navy to black gradient background, dramatic lighting" },
  { id: "gradient-warm", label: "Warm Gradient", prompt: "warm peach to coral gradient background, soft glow" },
  { id: "outdoor-nature", label: "Outdoor Nature", prompt: "lush green outdoor setting, dappled sunlight, bokeh background" },
  { id: "cafe", label: "Café Scene", prompt: "cozy café table, warm ambient light, blurred background" },
  { id: "concrete", label: "Urban Concrete", prompt: "raw concrete surface, moody industrial lighting" },
  { id: "silk-draped", label: "Silk Fabric", prompt: "flowing luxurious white silk fabric backdrop, soft highlights" },
  { id: "podium-pastel", label: "Pastel Podium", prompt: "minimalist pastel geometric podium, soft shadows, modern aesthetic" },
  { id: "beach-sand", label: "Sunlit Sand", prompt: "golden beach sand surface, bright warm sunlight, coastal vibe" },
  { id: "custom", label: "Custom Prompt", prompt: "" },
];

const ANGLES = [
  { id: "front", label: "Front" },
  { id: "45-degree", label: "45° Angle" },
  { id: "top-down", label: "Top-Down (Flat Lay)" },
  { id: "close-up", label: "Detail Close-Up" },
  { id: "auto", label: "Auto Match" },
];

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1 Square", sub: "Instagram / Amazon" },
  { id: "4:5", label: "4:5 Portrait", sub: "Instagram Feed" },
  { id: "9:16", label: "9:16 Vertical", sub: "Reels / TikTok / Story" },
  { id: "16:9", label: "16:9 Landscape", sub: "Banners / Website" },
];

export default function ProductPage() {
  const [productFile, setProductFile] = useState<File | null>(null);
  const [productPreviewUrl, setProductPreviewUrl] = useState<string>("");
  const [selectedBg, setSelectedBg] = useState("marble-white");
  const [customBgPrompt, setCustomBgPrompt] = useState("");
  const [selectedAngle, setSelectedAngle] = useState("front");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [showComparison, setShowComparison] = useState(false);
  const [provider, setProvider] = useState<ImageProvider>("gemini-2.5");
  const [isPending, startTransition] = useTransition();
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isUpscaled, setIsUpscaled] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  useEffect(() => {
    getProjectsAction().then((res) => {
      if (res.data) setProjects(res.data);
    });
  }, []);

  const handleFile = useCallback((file: File, url: string) => {
    setProductFile(file);
    setProductPreviewUrl(url);
    setGeneratedUrl("");
    setShowComparison(false);
    setIsUpscaled(false);
  }, []);

  const handleGenerate = () => {
    if (!productPreviewUrl) {
      toast.error("Please upload a product image first.");
      return;
    }

    const bg = BACKGROUNDS.find((b) => b.id === selectedBg)!;
    const prompt = selectedBg === "custom" ? customBgPrompt : bg.prompt;
    const providerInfo = PROVIDERS.find((p) => p.id === provider)!;

    startTransition(async () => {
      let base64: string | undefined;
      let mime: string | undefined;
      if (provider.startsWith("gemini") && productFile) {
        try {
          const encoded = await fileToBase64(productFile);
          base64 = encoded.base64;
          mime = encoded.mimeType;
        } catch {
          // non-fatal
        }
      }

      const toastId = toast.loading(
        `Generating with ${providerInfo.name}...`,
        { duration: 40000 }
      );
      const result = await generateProductAction({
        productImageUrl: productPreviewUrl,
        background: prompt,
        backgroundId: selectedBg,
        angle: selectedAngle,
        aspectRatio: selectedRatio,
        customPrompt: selectedBg === "custom" ? customBgPrompt : undefined,
        provider,
        productImageBase64: base64,
        productImageMime: mime,
      });
      toast.dismiss(toastId);
      if (result.success && result.imageUrl) {
        setGeneratedUrl(result.imageUrl);
        setShowComparison(false);
        setIsUpscaled(false);
        toast.success(`Photo created successfully! (${result.creditsUsed} credits used)`);
      } else {
        toast.error(result.error ?? "Generation failed. Please try another provider or check your API key.");
      }
    });
  };

  const handleUpscale = async () => {
    if (!generatedUrl || isUpscaling) return;
    setIsUpscaling(true);
    const toastId = toast.loading("Upscaling to 4K high resolution (ESRGAN 4×)...");
    try {
      const res = await upscaleAction(generatedUrl);
      toast.dismiss(toastId);
      if (res.success && res.imageUrl) {
        setGeneratedUrl(res.imageUrl);
        setIsUpscaled(true);
        toast.success("Image upscaled to 4K ultra-sharp resolution!");
      } else {
        toast.error(res.error ?? "Upscaling failed.");
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("Upscale request failed.");
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleDownload = (format: "jpg" | "png" = "jpg") => {
    if (!generatedUrl) return;
    const a = document.createElement("a");
    a.href = generatedUrl;
    a.download = `zonex-product-${Date.now()}.${format}`;
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
                <Camera size={22} color="var(--brand-400)" />
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Product Photography</h1>
                <span className="badge badge-blue" style={{ fontSize: "0.65rem" }}>
                  {PROVIDERS.find((p) => p.id === provider)?.credits} / image
                </span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>
                Transform raw product images into studio-grade commercial catalog photos.
              </p>
            </div>

            {/* Mode toggle */}
            <div style={{ display: "flex", gap: 6, background: "var(--bg-card)", padding: 4, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
              <button
                onClick={() => setIsBatchMode(false)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: !isBatchMode ? "var(--brand-500)" : "transparent",
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Single Image
              </button>
              <button
                onClick={() => setIsBatchMode(true)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: isBatchMode ? "var(--brand-500)" : "transparent",
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Layers size={13} /> Batch Mode
              </button>
            </div>
          </div>

          {/* Upload area */}
          {!generatedUrl && !isPending && (
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {isBatchMode ? "STEP 1 — Upload multiple product photos" : "STEP 1 — Upload your raw product photo"}
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
              <UploadZone onFile={handleFile} />
            </div>
          )}

          {/* Loading state */}
          {isPending && (
            <div
              className="card"
              style={{
                padding: 60,
                textAlign: "center",
                marginBottom: 24,
                background: "linear-gradient(135deg, rgba(26,95,248,0.06), rgba(139,92,246,0.04))",
              }}
            >
              <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    border: "2px solid rgba(26,95,248,0.2)",
                    borderTop: "2px solid var(--brand-500)",
                    borderRadius: "50%",
                    animation: "spin-slow 1s linear infinite",
                  }}
                />
                <Sparkles
                  size={22}
                  color="var(--brand-400)"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 6 }}>
                Generating with {PROVIDERS.find((p) => p.id === provider)?.name}...
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                Removing background · Compositing scene · Simulating optical reflections & studio lighting
              </div>
              <div className="shimmer" style={{ height: 4, borderRadius: 99, marginTop: 24, width: "60%", margin: "24px auto 0" }} />
            </div>
          )}

          {/* Result */}
          {generatedUrl && !isPending && (
            <div className="animate-fade-in">
              {/* Toggle */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setShowComparison(false)}
                    className={!showComparison ? "btn-primary" : "btn-secondary"}
                    style={{ padding: "7px 16px", fontSize: "0.8rem" }}
                  >
                    AI Result
                  </button>
                  {productPreviewUrl && (
                    <button
                      onClick={() => setShowComparison(true)}
                      className={showComparison ? "btn-primary" : "btn-secondary"}
                      style={{ padding: "7px 16px", fontSize: "0.8rem" }}
                    >
                      Before / After Comparison
                    </button>
                  )}
                </div>

                {isUpscaled && (
                  <span className="badge badge-purple" style={{ fontSize: "0.7rem", display: "flex", alignItems: "center", gap: 4 }}>
                    <Sparkle size={11} /> 4K Upscaled
                  </span>
                )}
              </div>

              <div className="card" style={{ overflow: "hidden", marginBottom: 16 }}>
                {showComparison && productPreviewUrl ? (
                  <BeforeAfterSlider beforeUrl={productPreviewUrl} afterUrl={generatedUrl} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={generatedUrl}
                    alt="Generated product"
                    style={{ width: "100%", maxHeight: "600px", objectFit: "contain", display: "block", borderRadius: 12 }}
                  />
                )}
              </div>

              {/* Action bar */}
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
                  onClick={() => { setGeneratedUrl(""); setShowComparison(false); }}
                  className="btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <RotateCcw size={15} /> Upload New
                </button>
                <button
                  onClick={handleGenerate}
                  className="btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Sparkles size={15} /> Re-render
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Control Sidebar ── */}
      <aside
        style={{
          width: 380,
          background: "var(--bg-card)",
          borderLeft: "1px solid var(--border-subtle)",
          padding: 24,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 4px" }}>Scene & Styling</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
            Configure environment, camera angle, and AI model provider.
          </p>
        </div>

        {/* AI Provider Selector */}
        <div>
          <ProviderSelector value={provider} onChange={setProvider} />
        </div>

        {/* Background Picker */}
        <div>
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 10 }}>
            Background & Environment
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setSelectedBg(bg.id)}
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: `1px solid ${selectedBg === bg.id ? "var(--brand-500)" : "var(--border-default)"}`,
                  background: selectedBg === bg.id ? "rgba(26,95,248,0.12)" : "var(--bg-input)",
                  color: selectedBg === bg.id ? "#60a5fa" : "var(--text-secondary)",
                  fontSize: "0.78rem",
                  fontWeight: selectedBg === bg.id ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                {bg.label}
              </button>
            ))}
          </div>

          {selectedBg === "custom" && (
            <textarea
              className="input-base"
              rows={3}
              placeholder="Describe your custom background scene (e.g. on a wet black slate tile with neon magenta side rim lighting)..."
              value={customBgPrompt}
              onChange={(e) => setCustomBgPrompt(e.target.value)}
              style={{ marginTop: 10, fontSize: "0.78rem" }}
            />
          )}
        </div>

        {/* Angle */}
        <div>
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 10 }}>
            Camera Angle
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ANGLES.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAngle(a.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 7,
                  border: `1px solid ${selectedAngle === a.id ? "var(--brand-500)" : "var(--border-default)"}`,
                  background: selectedAngle === a.id ? "rgba(26,95,248,0.12)" : "var(--bg-input)",
                  color: selectedAngle === a.id ? "#60a5fa" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  fontWeight: selectedAngle === a.id ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 10 }}>
            Output Format & Aspect Ratio
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRatio(r.id)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 7,
                  border: `1px solid ${selectedRatio === r.id ? "var(--brand-500)" : "var(--border-default)"}`,
                  background: selectedRatio === r.id ? "rgba(26,95,248,0.12)" : "var(--bg-input)",
                  color: selectedRatio === r.id ? "#60a5fa" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  fontWeight: selectedRatio === r.id ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 1 }}>{r.id}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{r.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border-subtle)" }} />

        {/* Generate button */}
        <div>
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
            }}
          >
            {isPending ? (
              <><Loader2 size={16} style={{ animation: "spin-slow 1s linear infinite" }} /> Rendering Photo...</>
            ) : (
              <><Sparkles size={16} /> Generate Product Photo</>
            )}
          </button>

          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.72rem", marginTop: 8 }}>
            {PROVIDERS.find((p) => p.id === provider)?.credits} per render · {PROVIDERS.find((p) => p.id === provider)?.name}
          </p>
        </div>
      </aside>
    </div>
  );
}
