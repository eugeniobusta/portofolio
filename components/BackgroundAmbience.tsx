"use client";

import { useEffect, useState } from "react";

function prng(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/* ── DARK MODE: 58 stars ─────────────────────────────────────────────────── */
const TWINKLE = ["twinkle-a", "twinkle-b", "twinkle-c", "twinkle-d"];
const STAR_DRIFT = ["star-drift-1", "star-drift-2", "star-drift-3"];

const STARS = Array.from({ length: 58 }, (_, i) => {
  const roll = prng(i * 13.7);
  return {
    x:    prng(i * 3.1)  * 100,
    y:    prng(i * 5.7)  * 100,
    size: 0.8 + prng(i * 2.3) * 2.0,
    color:
      roll > 0.62 ? "oklch(90% 0.10 68)"   // warm amber
      : roll > 0.38 ? "oklch(88% 0.08 250)" // cool blue
      : "oklch(96% 0.01 85)",               // near-white
    twinkleAnim:  TWINKLE[Math.floor(prng(i * 17.3) * 4)],
    twinkleDur:   `${2.5 + prng(i * 7.1) * 7}s`,
    twinkleDelay: `${-prng(i * 4.3) * 10}s`,
    driftAnim:    STAR_DRIFT[Math.floor(prng(i * 19.1) * 3)],
    driftDur:     `${18 + prng(i * 11.3) * 50}s`,
    driftDelay:   `${-prng(i * 6.7) * 30}s`,
  };
});

/* ── LIGHT MODE shapes ───────────────────────────────────────────────────── */
const GEO_DRIFT = ["geo-drift-1", "geo-drift-2", "geo-drift-3"];

/* Small solid dots */
const DOTS = Array.from({ length: 16 }, (_, i) => ({
  x:    prng((i + 200) * 3.7) * 100,
  y:    prng((i + 200) * 6.3) * 100,
  size: 5 + prng((i + 200) * 4.1) * 9,        // 5 – 14 px
  opacity: 0.14 + prng((i + 200) * 8.3) * 0.12, // 0.14 – 0.26
  driftAnim:  GEO_DRIFT[Math.floor(prng((i + 200) * 21.1) * 3)],
  driftDur:   `${20 + prng((i + 200) * 12.7) * 42}s`,
  driftDelay: `${-prng((i + 200) * 5.9) * 26}s`,
}));

/* Rings — circular outlines of various sizes */
const RINGS = Array.from({ length: 14 }, (_, i) => ({
  x:    prng((i + 300) * 5.3) * 100,
  y:    prng((i + 300) * 8.1) * 100,
  size: 18 + prng((i + 300) * 6.7) * 90,      // 18 – 108 px
  opacity: 0.08 + prng((i + 300) * 4.9) * 0.10, // 0.08 – 0.18
  stroke:  prng((i + 300) * 11.3) > 0.5 ? 1 : 2,
  driftAnim:  GEO_DRIFT[Math.floor(prng((i + 300) * 17.7) * 3)],
  driftDur:   `${26 + prng((i + 300) * 9.3) * 46}s`,
  driftDelay: `${-prng((i + 300) * 7.1) * 30}s`,
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

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>

      {/* ══════════════ DARK MODE: STARFIELD ══════════════ */}
      {isDark && (
        <>
          {STARS.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${s.x}%`, top: `${s.y}%`,
                width: s.size, height: s.size,
                background: s.color,
                animation: [
                  `${s.twinkleAnim} ${s.twinkleDur} ease-in-out ${s.twinkleDelay} infinite`,
                  `${s.driftAnim}   ${s.driftDur}   ease-in-out ${s.driftDelay}   infinite`,
                ].join(", "),
              }}
            />
          ))}

          {/* Ambient glows */}
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

      {/* ══════════════ LIGHT MODE: GEOMETRY ══════════════ */}
      {!isDark && (
        <>
          {/* Solid dots */}
          {DOTS.map((d, i) => (
            <div
              key={`dot-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${d.x}%`, top: `${d.y}%`,
                width: d.size, height: d.size,
                background: `oklch(55% 0 0 / ${d.opacity})`,
                animation: `${d.driftAnim} ${d.driftDur} ease-in-out ${d.driftDelay} infinite`,
              }}
            />
          ))}

          {/* Rings */}
          {RINGS.map((r, i) => (
            <div
              key={`ring-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${r.x}%`, top: `${r.y}%`,
                width: r.size, height: r.size,
                border: `${r.stroke}px solid oklch(52% 0 0 / ${r.opacity})`,
                animation: `${r.driftAnim} ${r.driftDur} ease-in-out ${r.driftDelay} infinite`,
              }}
            />
          ))}

          {/* Large tinted blobs — warm cream + cool grey break the pure white */}
          <div className="absolute rounded-full" style={{
            top: "-18%", left: "-12%", width: 700, height: 700,
            background: "radial-gradient(circle, oklch(87% 0.016 85 / 0.55) 0%, transparent 65%)",
            animation: "orb-drift-1 36s ease-in-out infinite",
          }} />
          <div className="absolute rounded-full" style={{
            bottom: "-22%", right: "-14%", width: 750, height: 750,
            background: "radial-gradient(circle, oklch(88% 0.012 250 / 0.50) 0%, transparent 65%)",
            animation: "orb-drift-3 44s ease-in-out infinite",
          }} />
          <div className="absolute rounded-full" style={{
            top: "38%", left: "52%", width: 480, height: 480,
            background: "radial-gradient(circle, oklch(89% 0.010 68 / 0.40) 0%, transparent 65%)",
            animation: "orb-drift-2 52s ease-in-out infinite",
          }} />

          {/* Grain */}
          <div className="absolute inset-0" style={{
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }} />
        </>
      )}
    </div>
  );
}
