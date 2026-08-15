"use client";

import { useRef, useState, useCallback } from "react";

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = "Before",
  afterLabel = "After",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(2, Math.min(98, pct)));
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging.current) updatePosition(e.clientX);
    },
    [updatePosition]
  );
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  return (
    <div
      ref={containerRef}
      className="comparison-slider"
      onMouseDown={() => (dragging.current = true)}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      style={{ position: "relative", userSelect: "none", borderRadius: 12, overflow: "hidden" }}
    >
      {/* After (full width, underneath) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterUrl}
        alt="After"
        style={{ display: "block", width: "100%", height: "auto" }}
        draggable={false}
      />

      {/* Before (clipped to left side) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(0 ${100 - position}% 0 0)`,
          transition: dragging.current ? "none" : "clip-path 0.05s",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeUrl}
          alt="Before"
          style={{ display: "block", width: "100%", height: "auto" }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${position}%`,
          width: 2,
          background: "white",
          transform: "translateX(-50%)",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />

      {/* Handle circle */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${position}%`,
          transform: "translate(-50%, -50%)",
          width: 40,
          height: 40,
          background: "white",
          borderRadius: "50%",
          zIndex: 11,
          boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          cursor: "ew-resize",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M5 4L1 8L5 12" stroke="#1a1a35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 4L15 8L11 12" stroke="#1a1a35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Labels */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          borderRadius: 6,
          padding: "3px 10px",
          fontSize: "0.72rem",
          fontWeight: 600,
          color: "white",
          pointerEvents: "none",
        }}
      >
        {beforeLabel}
      </div>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "rgba(26,95,248,0.7)",
          backdropFilter: "blur(6px)",
          borderRadius: 6,
          padding: "3px 10px",
          fontSize: "0.72rem",
          fontWeight: 600,
          color: "white",
          pointerEvents: "none",
        }}
      >
        {afterLabel}
      </div>
    </div>
  );
}
