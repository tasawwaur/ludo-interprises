import React from "react";

interface SnakeLadderTokenProps {
  color: "RED" | "GREEN";
  size?: number;
  tokenIndex?: number;
}

/**
 * Bright vivid SVG token that pops clearly on the dark Snake & Ladders board.
 * Uses radial gradients, white highlights, gold ring — no image dependency.
 */
export const SnakeLadderToken: React.FC<SnakeLadderTokenProps> = ({
  color,
  size = 24,
  tokenIndex = 0,
}) => {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.42;

  // Color palette per token color
  const palette = {
    RED: {
      top:    "#ff8a80",
      mid:    "#f44336",
      bot:    "#b71c1c",
      glow:   "#ff1744",
      ring1:  "#ffffff",
      ring2:  "#ffd740",
      ring3:  "#ff6d00",
      badge:  "#ff1744",
      label:  "R",
      shadow: "rgba(255,23,68,0.85)",
    },
    GREEN: {
      top:    "#b9f6ca",
      mid:    "#00e676",
      bot:    "#1b5e20",
      glow:   "#00e676",
      ring1:  "#ffffff",
      ring2:  "#ffd740",
      ring3:  "#00c853",
      badge:  "#00c853",
      label:  "G",
      shadow: "rgba(0,230,118,0.85)",
    },
  };

  const p = palette[color];
  const gradId  = `sg-body-${color}-${tokenIndex}`;
  const grad2Id = `sg-base-${color}-${tokenIndex}`;
  const filtId  = `sg-glow-${color}-${tokenIndex}`;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        overflow: "visible",
        filter: `drop-shadow(0 0 ${s * 0.25}px ${p.shadow}) drop-shadow(0 ${s * 0.1}px ${s * 0.15}px rgba(0,0,0,0.8))`,
        display: "block",
      }}
    >
      <defs>
        {/* Main sphere radial gradient — light source top-left */}
        <radialGradient id={gradId} cx="35%" cy="28%" r="70%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
          <stop offset="18%"  stopColor={p.top}   stopOpacity="1" />
          <stop offset="55%"  stopColor={p.mid}   stopOpacity="1" />
          <stop offset="100%" stopColor={p.bot}   stopOpacity="1" />
        </radialGradient>

        {/* Base oval gradient */}
        <linearGradient id={grad2Id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={p.bot} />
          <stop offset="50%"  stopColor={p.mid} />
          <stop offset="100%" stopColor={p.bot} />
        </linearGradient>
      </defs>

      {/* ── Ground shadow ellipse ── */}
      <ellipse
        cx={cx}
        cy={cy + r * 0.68}
        rx={r * 0.78}
        ry={r * 0.22}
        fill="rgba(0,0,0,0.55)"
      />

      {/* ── Base oval (3D depth) ── */}
      <ellipse
        cx={cx}
        cy={cy + r * 0.38}
        rx={r * 0.88}
        ry={r * 0.24}
        fill={`url(#${grad2Id})`}
      />

      {/* ── Gold outer ring (bottom arc for 3D base rim) ── */}
      <ellipse
        cx={cx}
        cy={cy + r * 0.38}
        rx={r * 0.88}
        ry={r * 0.24}
        stroke="#ffd740"
        strokeWidth={s * 0.03}
        fill="none"
      />

      {/* ── Main sphere ── */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={`url(#${gradId})`}
      />

      {/* ── Gold + white outer ring ── */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="#ffffff"
        strokeWidth={s * 0.025}
        fill="none"
        strokeOpacity="0.9"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r - s * 0.025}
        stroke="#ffd740"
        strokeWidth={s * 0.04}
        fill="none"
        strokeOpacity="0.95"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r - s * 0.065}
        stroke={p.ring3}
        strokeWidth={s * 0.025}
        fill="none"
        strokeOpacity="0.7"
      />

      {/* ── Glossy white shine highlight ── */}
      <ellipse
        cx={cx - r * 0.22}
        cy={cy - r * 0.28}
        rx={r * 0.32}
        ry={r * 0.18}
        fill="rgba(255,255,255,0.65)"
        transform={`rotate(-35, ${cx - r * 0.22}, ${cy - r * 0.28})`}
      />

      {/* ── Smaller secondary shine ── */}
      <circle
        cx={cx - r * 0.08}
        cy={cy - r * 0.46}
        r={r * 0.1}
        fill="rgba(255,255,255,0.5)"
      />

      {/* ── Token letter badge (R / G) ── */}
      <circle
        cx={cx + r * 0.38}
        cy={cy - r * 0.38}
        r={r * 0.36}
        fill="#0a0a1a"
        stroke="#ffd740"
        strokeWidth={s * 0.035}
      />
      <text
        x={cx + r * 0.38}
        y={cy - r * 0.38 + r * 0.13}
        textAnchor="middle"
        fontSize={r * 0.45}
        fontWeight="900"
        fontFamily="sans-serif"
        fill="#ffffff"
        letterSpacing="-0.5"
      >
        {p.label}{tokenIndex + 1}
      </text>
    </svg>
  );
};
