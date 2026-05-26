"use client";

import { useEffect, useState } from "react";

function prng(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/* ─── DARK: stars (unchanged) ───────────────────────────────────────────── */
const TWINKLE   = ["twinkle-a", "twinkle-b", "twinkle-c", "twinkle-d"];
const STAR_DRIFT = ["star-drift-1", "star-drift-2", "star-drift-3"];

const STARS = Array.from({ length: 58 }, (_, i) => {
  const roll = prng(i * 13.7);
  return {
    x:    prng(i * 3.1)  * 100,
    y:    prng(i * 5.7)  * 100,
    size: 0.8 + prng(i * 2.3) * 2.0,
    color:
      roll > 0.62 ? "oklch(90% 0.10 68)"
      : roll > 0.38 ? "oklch(88% 0.08 250)"
      : "oklch(96% 0.01 85)",
    twinkleAnim:  TWINKLE[Math.floor(prng(i * 17.3) * 4)],
    twinkleDur:   `${2.5 + prng(i * 7.1) * 7}s`,
    twinkleDelay: `${-prng(i * 4.3) * 10}s`,
    driftAnim:    STAR_DRIFT[Math.floor(prng(i * 19.1) * 3)],
    driftDur:     `${18 + prng(i * 11.3) * 50}s`,
    driftDelay:   `${-prng(i * 6.7) * 30}s`,
  };
});

/* ─── LIGHT: floating lines ─────────────────────────────────────────────── */
const GEO_DRIFT = ["geo-drift-1", "geo-drift-2", "geo-drift-3"];

const LINES = Array.from({ length: 14 }, (_, i) => ({
  x:       prng((i + 10) * 7.3)  * 95,
  y:       prng((i + 10) * 13.1) * 95,
  length:  36 + prng((i + 10) * 5.9) * 90,  // 36 – 126 px
  angle:   prng((i + 10) * 11.7) * 180,      // 0 – 180°
  opacity: 0.07 + prng((i + 10) * 3.3) * 0.07, // 0.07 – 0.14
  driftAnim:  GEO_DRIFT[Math.floor(prng((i + 10) * 19.3) * 3)],
  driftDur:   `${24 + prng((i + 10) * 8.1) * 46}s`,
  driftDelay: `${-prng((i + 10) * 6.7) * 28}s`,
}));

/* ─── LIGHT: floating diamond outlines ──────────────────────────────────── */
const DIAMONDS = Array.from({ length: 10 }, (_, i) => ({
  x:       prng((i + 50) * 9.1)  * 92,
  y:       prng((i + 50) * 4.7)  * 92,
  size:    12 + prng((i + 50) * 6.3) * 22,   // 12 – 34 px
  opacity: 0.07 + prng((i + 50) * 7.1) * 0.07, // 0.07 – 0.14
  driftAnim:  GEO_DRIFT[Math.floor(prng((i + 50) * 21.7) * 3)],
  driftDur:   `${28 + prng((i + 50) * 11.3) * 42}s`,
  driftDelay: `${-prng((i + 50) * 5.3) * 30}s`,
}));

/* ─── LIGHT: small crosses / plus signs ─────────────────────────────────── */
const CROSSES = Array.from({ length: 8 }, (_, i) => ({
  x:       prng((i + 80) * 6.7)  * 93,
  y:       prng((i + 80) * 14.3) * 93,
  arm:     6 + prng((i + 80) * 3.7) * 10,    // half-arm 6 – 16 px
  opacity: 0.07 + prng((i + 80) * 9.1) * 0.06,
  driftAnim:  GEO_DRIFT[Math.floor(prng((i + 80) * 17.1) * 3)],
  driftDur:   `${22 + prng((i + 80) * 7.9) * 50}s`,
  driftDelay: `${-prng((i + 80) * 4.1) * 25}s`,
}));

export default function BackgroundAmbience() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const sync = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  /* Shared grey color token for light mode shapes */
  const grey = (opacity: number) => `oklch(48% 0 0 / ${opacity})`;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>

      {/* ══════════════════ DARK MODE: STARFIELD ══════════════════ */}
      {isDark && (
        <>
          {STARS.map((s, i) => (
            <div key={i} className="absolute rounded-full" style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.size, height: s.size,
              background: s.color,
              animation: [
                `${s.twinkleAnim} ${s.twinkleDur} ease-in-out ${s.twinkleDelay} infinite`,
                `${s.driftAnim}   ${s.driftDur}   ease-in-out ${s.driftDelay}   infinite`,
              ].join(", "),
            }} />
          ))}
          <div className="absolute rounded-full" style={{
            top: "-12%", left: "-8%", width: 520, height: 520,
            background: "radial-gradient(circle, oklch(72% 0.14 68 / 0.06) 0%, transparent 70%)",
            animation: "orb-drift-1 38s ease-in-out infinite",
          }} />
          <div className="absolute rounded-full" style={{
            bottom: "-18%", right: "-10%", width: 640, height: 640,
            background: "radial-gradient(circle, oklch(58% 0.08 250 / 0.05) 0%, transparent 70%)",
            animation: "orb-drift-2 48s ease-in-out infinite",
          }} />
        </>
      )}

      {/* ══════════════════ LIGHT MODE: GEOMETRY ══════════════════ */}
      {!isDark && (
        <>
          {/*
           * Dot grid — repeating 1 px dots on a 30 px grid.
           * Barely visible but adds structure; doesn't interfere with text
           * because the dots are 1 px (single pixel, never spans a glyph).
           */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, oklch(48% 0 0 / 0.10) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }} />

          {/*
           * Floating lines — thin, angled.
           * filter: blur(0.8px) gives them a slightly soft "difuminado" edge
           * so they don't look harsh when they happen to sit near text.
           */}
          {LINES.map((l, i) => (
            <div key={`line-${i}`} className="absolute" style={{
              left:            `${l.x}%`,
              top:             `${l.y}%`,
              width:           l.length,
              height:          1,
              background:      grey(l.opacity),
              transform:       `rotate(${l.angle}deg)`,
              transformOrigin: "left center",
              filter:          "blur(0.6px)",
              animation:       `${l.driftAnim} ${l.driftDur} ease-in-out ${l.driftDelay} infinite`,
            }} />
          ))}

          {/* Diamond outlines — bordered squares rotated 45° */}
          {DIAMONDS.map((d, i) => (
            <div key={`diamond-${i}`} className="absolute" style={{
              left:            `${d.x}%`,
              top:             `${d.y}%`,
              width:           d.size,
              height:          d.size,
              border:          `1px solid ${grey(d.opacity)}`,
              transform:       "rotate(45deg)",
              filter:          "blur(0.5px)",
              animation:       `${d.driftAnim} ${d.driftDur} ease-in-out ${d.driftDelay} infinite`,
            }} />
          ))}

          {/* Plus / cross signs — two tiny crossing lines per element (SVG) */}
          {CROSSES.map((c, i) => (
            <svg key={`cross-${i}`} className="absolute overflow-visible" style={{
              left:      `${c.x}%`,
              top:       `${c.y}%`,
              width:     0,
              height:    0,
              filter:    "blur(0.4px)",
              animation: `${c.driftAnim} ${c.driftDur} ease-in-out ${c.driftDelay} infinite`,
            }}>
              {/* horizontal arm */}
              <line x1={-c.arm} y1={0} x2={c.arm} y2={0}
                stroke={grey(c.opacity)} strokeWidth={1} />
              {/* vertical arm */}
              <line x1={0} y1={-c.arm} x2={0} y2={c.arm}
                stroke={grey(c.opacity)} strokeWidth={1} />
            </svg>
          ))}

          {/*
           * Three large soft blobs — these are what actually prevent pure white.
           * Warm cream top-left, cool grey-blue bottom-right, amber accent center.
           * They live UNDER everything so text is never affected.
           */}
          <div className="absolute rounded-full" style={{
            top: "-18%", left: "-12%", width: 700, height: 700,
            background: "radial-gradient(circle, oklch(86% 0.018 85 / 0.60) 0%, transparent 65%)",
            animation: "orb-drift-1 36s ease-in-out infinite",
          }} />
          <div className="absolute rounded-full" style={{
            bottom: "-22%", right: "-14%", width: 750, height: 750,
            background: "radial-gradient(circle, oklch(87% 0.014 250 / 0.55) 0%, transparent 65%)",
            animation: "orb-drift-3 44s ease-in-out infinite",
          }} />
          <div className="absolute rounded-full" style={{
            top: "38%", left: "52%", width: 480, height: 480,
            background: "radial-gradient(circle, oklch(88% 0.012 68 / 0.40) 0%, transparent 65%)",
            animation: "orb-drift-2 52s ease-in-out infinite",
          }} />

          {/* Grain — micro-texture, keeps the surface from feeling plasticky */}
          <div className="absolute inset-0" style={{
            opacity: 0.022,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }} />
        </>
      )}
    </div>
  );
}
