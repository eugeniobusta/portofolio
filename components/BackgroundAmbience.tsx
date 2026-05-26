"use client";

/*
 * Floating gradient orbs + grain texture that sit behind all page content.
 * Gives the page subtle depth without competing with the typography.
 * All animation is pure CSS — no JS, no layout jank.
 */

const PARTICLES = [
  { x: "12%",  y: "18%",  size: 6,  dur: "18s", delay: "0s"   },
  { x: "78%",  y: "8%",   size: 4,  dur: "24s", delay: "3s"   },
  { x: "55%",  y: "32%",  size: 5,  dur: "20s", delay: "7s"   },
  { x: "30%",  y: "60%",  size: 4,  dur: "22s", delay: "11s"  },
  { x: "88%",  y: "50%",  size: 6,  dur: "19s", delay: "5s"   },
  { x: "20%",  y: "80%",  size: 3,  dur: "26s", delay: "9s"   },
  { x: "65%",  y: "75%",  size: 5,  dur: "17s", delay: "14s"  },
  { x: "45%",  y: "90%",  size: 4,  dur: "23s", delay: "2s"   },
];

export default function BackgroundAmbience() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>

      {/* Orb 1 — warm amber glow, top-left */}
      <div
        className="absolute rounded-full"
        style={{
          top: "-20%", left: "-15%",
          width: 700, height: 700,
          background: "radial-gradient(circle, oklch(72% 0.155 68 / 0.07) 0%, transparent 70%)",
          animation: "orb-drift-1 28s ease-in-out infinite",
        }}
      />

      {/* Orb 2 — cool blue, center-right */}
      <div
        className="absolute rounded-full"
        style={{
          top: "35%", right: "-20%",
          width: 600, height: 600,
          background: "radial-gradient(circle, oklch(60% 0.07 250 / 0.06) 0%, transparent 70%)",
          animation: "orb-drift-2 38s ease-in-out infinite",
        }}
      />

      {/* Orb 3 — neutral warm, bottom-center */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: "-25%", left: "25%",
          width: 800, height: 800,
          background: "radial-gradient(circle, oklch(55% 0.04 85 / 0.04) 0%, transparent 70%)",
          animation: "orb-drift-3 45s ease-in-out infinite",
        }}
      />

      {/* Floating dot particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.x, top: p.y,
            width: p.size, height: p.size,
            background: "var(--frame-strong)",
            animation: `particle-float ${p.dur} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Grain texture — adds tactile depth */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />
    </div>
  );
}
