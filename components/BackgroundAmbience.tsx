"use client";

import { useEffect, useState } from "react";

/* ── Deterministic pseudo-random (no re-randomisation on re-render) ────── */
function prng(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/* ── DARK MODE: 58 stars ─────────────────────────────────────────────────── */
const TWINKLE_ANIMS = ["twinkle-a", "twinkle-b", "twinkle-c", "twinkle-d"];
const DRIFT_ANIMS   = ["star-drift-1", "star-drift-2", "star-drift-3"];

const STARS = Array.from({ length: 58 }, (_, i) => {
  const colorRoll = prng(i * 13.7);
  return {
    x:    prng(i * 3.1)  * 100,
    y:    prng(i * 5.7)  * 100,
    size: 0.8 + prng(i * 2.3) * 2.0,   // 0.8 – 2.8 px
    /* warm amber, cool blue, or near-white */
    color:
      colorRoll > 0.62
        ? "oklch(90% 0.10 68)"    // warm
        : colorRoll > 0.38
        ? "oklch(88% 0.08 250)"   // cool
        : "oklch(96% 0.01 85)",   // white
    twinkleAnim:  TWINKLE_ANIMS[Math.floor(prng(i * 17.3) * 4)],
    twinkleDur:   `${2.5 + prng(i * 7.1)  * 7}s`,
    twinkleDelay: `${-prng(i * 4.3)  * 10}s`,
    driftAnim:    DRIFT_ANIMS[Math.floor(prng(i * 19.1) * 3)],
    driftDur:     `${18 + prng(i * 11.3) * 52}s`,
    driftDelay:   `${-prng(i * 6.7)  * 30}s`,
  };
});

/* ── LIGHT MODE: 24 geometric shapes ────────────────────────────────────── */
const GEO_DRIFT = ["geo-drift-1", "geo-drift-2", "geo-drift-3"];

const GEO = Array.from({ length: 24 }, (_, i) => ({
  x:         prng((i + 100) * 3.7)  * 100,
  y:         prng((i + 100) * 6.3)  * 100,
  size:      5  + prng((i + 100) * 4.1)  * 13,   // 5 – 18 px
  opacity:   0.04 + prng((i + 100) * 8.3)  * 0.06, // 0.04 – 0.10
  driftAnim: GEO_DRIFT[Math.floor(prng((i + 100) * 21.1) * 3)],
  driftDur:  `${22 + prng((i + 100) * 12.7) * 44}s`,
  driftDelay:`${-prng((i + 100) * 5.9)  * 28}s`,
  /* rings = outlined circle; otherwise solid circle */
  isRing:    prng((i + 100) * 15.3) > 0.65,
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
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden
    >
      {/* ──────────────────── DARK MODE: STARFIELD ──────────────────────── */}
      {isDark && (
        <>
          {STARS.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left:       `${s.x}%`,
                top:        `${s.y}%`,
                width:      s.size,
                height:     s.size,
                background: s.color,
                /* both twinkle and drift run simultaneously */
                animation: [
                  `${s.twinkleAnim} ${s.twinkleDur} ease-in-out ${s.twinkleDelay} infinite`,
                  `${s.driftAnim}   ${s.driftDur}   ease-in-out ${s.driftDelay}   infinite`,
                ].join(", "),
              }}
            />
          ))}

          {/* Two large ambient glows — barely visible, just break the flat black */}
          <div
            className="absolute rounded-full"
            style={{
              top: "-12%", left: "-8%",
              width: 520, height: 520,
              background:
                "radial-gradient(circle, oklch(72% 0.14 68 / 0.06) 0%, transparent 70%)",
              animation: "orb-drift-1 38s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              bottom: "-18%", right: "-10%",
              width: 640, height: 640,
              background:
                "radial-gradient(circle, oklch(58% 0.08 250 / 0.05) 0%, transparent 70%)",
              animation: "orb-drift-2 48s ease-in-out infinite",
            }}
          />
        </>
      )}

      {/* ─────────────────── LIGHT MODE: GEOMETRY ───────────────────────── */}
      {!isDark && (
        <>
          {GEO.map((g, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left:       `${g.x}%`,
                top:        `${g.y}%`,
                width:      g.size,
                height:     g.size,
                background: g.isRing
                  ? "transparent"
                  : `oklch(65% 0 0 / ${g.opacity})`,
                border: g.isRing
                  ? `1px solid oklch(65% 0 0 / ${g.opacity})`
                  : "none",
                animation: `${g.driftAnim} ${g.driftDur} ease-in-out ${g.driftDelay} infinite`,
              }}
            />
          ))}

          {/* Soft tinted blobs — prevents the page feeling pure white */}
          <div
            className="absolute rounded-full"
            style={{
              top: "-18%", left: "-12%",
              width: 650, height: 650,
              background:
                "radial-gradient(circle, oklch(93% 0.012 85 / 0.55) 0%, transparent 70%)",
              animation: "orb-drift-1 36s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              bottom: "-20%", right: "-14%",
              width: 720, height: 720,
              background:
                "radial-gradient(circle, oklch(92% 0.010 250 / 0.40) 0%, transparent 70%)",
              animation: "orb-drift-3 44s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              top: "40%", left: "55%",
              width: 400, height: 400,
              background:
                "radial-gradient(circle, oklch(94% 0.008 68 / 0.30) 0%, transparent 70%)",
              animation: "orb-drift-2 52s ease-in-out infinite",
            }}
          />

          {/* Grain texture — very subtle, adds tactile depth */}
          <div
            className="absolute inset-0"
            style={{
              opacity: 0.022,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "256px 256px",
            }}
          />
        </>
      )}
    </div>
  );
}
