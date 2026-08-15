"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ImageIcon, X } from "lucide-react";

interface UploadZoneProps {
  onFile: (file: File, dataUrl: string) => void;
  accept?: Record<string, string[]>;
  maxSizeMB?: number;
  label?: string;
  sublabel?: string;
}

export function UploadZone({
  onFile,
  accept = { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
  maxSizeMB = 20,
  label = "Drop your product image here",
  sublabel = "JPG, PNG, WebP — up to 20 MB",
}: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [error, setError] = useState<string>("");

  const onDrop = useCallback(
    (accepted: File[], rejected: import("react-dropzone").FileRejection[]) => {
      setError("");
      if (rejected.length > 0) {
        setError(rejected[0].errors[0].message);
        return;
      }
      const file = accepted[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        setFilename(file.name);
        onFile(file, dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
  });

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFilename("");
  };

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          position: "relative",
          border: `2px dashed ${isDragActive ? "var(--brand-500)" : preview ? "var(--border-default)" : "rgba(255,255,255,0.12)"}`,
          borderRadius: 12,
          padding: preview ? 0 : 40,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          background: isDragActive
            ? "rgba(26,95,248,0.06)"
            : preview
            ? "transparent"
            : "var(--bg-input)",
          overflow: "hidden",
          aspectRatio: preview ? "1" : undefined,
          minHeight: preview ? 0 : 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <input {...getInputProps()} />
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Product preview"
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "rgba(0,0,0,0.3)" }}
            />
            <button
              onClick={clear}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "rgba(0,0,0,0.7)",
                border: "none",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
              }}
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: "rgba(26,95,248,0.12)",
                border: "1px solid rgba(26,95,248,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              {isDragActive ? (
                <ImageIcon size={24} color="var(--brand-400)" />
              ) : (
                <Upload size={24} color="var(--brand-400)" />
              )}
            </div>
            <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4, fontSize: "0.9rem" }}>
              {isDragActive ? "Drop it here!" : label}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", margin: 0 }}>{sublabel}</p>
          </div>
        )}
      </div>
      {error && (
        <p style={{ color: "var(--error)", fontSize: "0.78rem", marginTop: 6 }}>{error}</p>
      )}
      {filename && !error && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: 6 }}>
          ✓ {filename}
        </p>
      )}
    </div>
  );
}
