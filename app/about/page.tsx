"use client";

import { useRef, useMemo } from "react";
import {
  motion, useScroll, useTransform, useInView, useSpring,
  type MotionValue,
} from "framer-motion";
import Link from "next/link";

/* ─── REVEAL ─────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── PHOTO ──────────────────────────────────────────────────────── */
function Photo({ src, alt, style = {} }: {
  src?: string; alt: string; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      borderRadius: 18, overflow: "hidden",
      background: "rgba(210,150,60,0.08)",
      border: "1px solid rgba(210,150,60,0.18)",
      display: "flex", alignItems: "center", justifyContent: "center",
      ...style,
    }}>
      {src
        ? <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(180,120,40,0.35)", letterSpacing: "0.1em" }}>photo soon</span>
      }
    </div>
  );
}

/* ─── SUN ────────────────────────────────────────────────────────── */
function Sun({ sp }: { sp: MotionValue<number> }) {
  const rawY     = useTransform(sp, [0, 1], [11, 73]);
  const y        = useSpring(rawY, { stiffness: 26, damping: 18 });
  const top      = useTransform(y, v => `${v}vh`);
  const opacity  = useTransform(sp, [0, 0.52, 0.76, 0.90, 1], [1, 1, 0.68, 0.08, 0]);
  const haloSize = useTransform(sp, [0, 0.75], [200, 350]);
  const haloPx   = useTransform(haloSize, v => `${v}px`);
  // sun deepens to red/crimson as it sinks
  const redTint  = useTransform(sp, [0.18, 0.68], [0, 0.72]);

  return (
    <motion.div style={{
      position: "absolute", left: "50%", top,
      translateX: "-50%", translateY: "-50%",
      opacity, pointerEvents: "none", zIndex: 2,
    }}>
      {/* spinning atmospheric halo */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", borderRadius: "50%",
          width: haloPx, height: haloPx,
          top: "50%", left: "50%",
          translateX: "-50%", translateY: "-50%",
          background: "conic-gradient(from 0deg, rgba(255,195,55,0.28), rgba(255,110,15,0.05), rgba(255,225,90,0.22), rgba(240,95,8,0.06), rgba(255,195,55,0.28))",
          filter: "blur(22px)",
        }}
      />
      {/* close glow */}
      <div style={{
        position: "absolute", borderRadius: "50%",
        width: 160, height: 160,
        top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        background: "radial-gradient(circle, rgba(255,215,80,0.52) 0%, transparent 70%)",
        filter: "blur(14px)",
      }} />
      {/* disk */}
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "relative", width: 84, height: 84 }}
      >
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "radial-gradient(circle at 36% 33%, #fffce0 0%, #ffe050 28%, #ffaa22 58%, #e06412 100%)",
          boxShadow: "0 0 32px rgba(255,178,35,0.78), 0 0 72px rgba(255,125,20,0.40), 0 0 140px rgba(255,80,5,0.18)",
        }} />
        {/* red sunset tint on the disk */}
        <motion.div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "radial-gradient(circle at 50% 60%, rgba(200,30,0,0.55) 0%, rgba(160,20,0,0.35) 55%, transparent 80%)",
          opacity: redTint,
        }} />
      </motion.div>
    </motion.div>
  );
}

/* ─── SUN WATER REFLECTION ───────────────────────────────────────── */
function SunReflection({ sp }: { sp: MotionValue<number> }) {
  const opacity = useTransform(sp, [0, 0.45, 0.82, 1], [0.5, 0.65, 0.2, 0]);
  return (
    <motion.div style={{
      position: "absolute", bottom: "3%", left: "50%",
      translateX: "-50%",
      width: 90, height: 180,
      opacity, pointerEvents: "none", zIndex: 3,
      background: "linear-gradient(180deg, rgba(255,190,50,0.55) 0%, rgba(255,145,25,0.25) 50%, transparent 100%)",
      filter: "blur(10px)",
      borderRadius: "0 0 50% 50%",
    }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ scaleX: [0.4, 1.2, 0.4], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.2 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
          style={{
            position: "absolute",
            top: `${25 + i * 22}%`,
            left: "50%", translateX: "-50%",
            width: 60 - i * 12, height: 3,
            borderRadius: 2,
            background: "rgba(255,215,80,0.7)",
          }}
        />
      ))}
    </motion.div>
  );
}

/* ─── CLOUD ──────────────────────────────────────────────────────── */
function Cloud({ sp, topPct, leftPct, speed, size = 1 }: {
  sp: MotionValue<number>; topPct: number; leftPct: number; speed: number; size?: number;
}) {
  const rawX = useTransform(sp, [0, 1], [0, -110 * speed]);
  const x    = useSpring(rawX, { stiffness: 20, damping: 18 });
  const fade = useTransform(sp, [0.48, 0.75], [0.86, 0]);
  const W = 175 * size, H = 62 * size;

  return (
    <motion.div style={{
      position: "absolute", top: `${topPct}%`, left: `${leftPct}%`,
      x, opacity: fade, pointerEvents: "none", zIndex: 2,
    }}>
      <motion.div
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 13 + speed * 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div style={{ position: "relative", width: W, height: H }}>
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: H * 0.5, borderRadius: H * 0.5,
            background: "rgba(255,248,228,0.65)", filter: "blur(3px)",
          }} />
          {([
            { l: 0.10, b: 0.30, r: 0.36 },
            { l: 0.34, b: 0.36, r: 0.31 },
            { l: 0.57, b: 0.24, r: 0.27 },
          ] as { l: number; b: number; r: number }[]).map((p, i) => (
            <div key={i} style={{
              position: "absolute",
              bottom: H * p.b, left: W * p.l,
              width: W * p.r, height: W * p.r,
              borderRadius: "50%",
              background: "rgba(255,248,228,0.70)",
              filter: "blur(4px)",
            }} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── SEAGULL ────────────────────────────────────────────────────── */
function Seagull({ top, left, scale = 1, delay = 0, sp }: {
  top: string; left: string; scale?: number; delay?: number; sp: MotionValue<number>;
}) {
  const fade = useTransform(sp, [0.42, 0.68], [0.46, 0]);
  return (
    <motion.svg viewBox="0 0 40 20"
      style={{
        position: "absolute", top, left, overflow: "visible",
        width: 40 * scale, height: 20 * scale,
        opacity: fade, pointerEvents: "none", zIndex: 3,
      }}
      animate={{ y: [0, -8, 0], x: [0, 11, 0] }}
      transition={{ duration: 6.5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <motion.path fill="none" stroke="rgba(38,18,4,0.6)" strokeWidth="2.2" strokeLinecap="round"
        animate={{ d: ["M20,10 Q10,1 0,10", "M20,10 Q10,6 0,10", "M20,10 Q10,1 0,10"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay }}
      />
      <motion.path fill="none" stroke="rgba(38,18,4,0.6)" strokeWidth="2.2" strokeLinecap="round"
        animate={{ d: ["M20,10 Q30,1 40,10", "M20,10 Q30,6 40,10", "M20,10 Q30,1 40,10"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay }}
      />
    </motion.svg>
  );
}

/* ─── WAVES ──────────────────────────────────────────────────────── */
function WaveLayer({ sp }: { sp: MotionValue<number> }) {
  const rise = useTransform(sp, [0.35, 1], ["0%", "-9%"]);
  // wave color deepens to dark at night
  const waveDeep = useTransform(sp, [0.60, 0.92], [0, 1]);

  return (
    <motion.div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: "36%", overflow: "hidden", zIndex: 3, pointerEvents: "none",
      y: rise,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, transparent 0%, rgba(200,100,18,0.20) 28%, rgba(168,68,12,0.36) 68%, rgba(138,52,8,0.50) 100%)",
      }} />
      {/* night water darkening */}
      <motion.div style={{
        position: "absolute", inset: 0, opacity: waveDeep,
        background: "linear-gradient(180deg, transparent 0%, rgba(4,6,22,0.55) 35%, rgba(3,5,18,0.72) 100%)",
      }} />

      {/* wave 1 */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 70, overflow: "hidden" }}>
        <motion.div style={{ display: "flex", position: "absolute", top: 0 }}
          animate={{ x: [0, "-50%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          {[0, 1].map(i => (
            <svg key={i} viewBox="0 0 1440 70" style={{ width: "100vw", flexShrink: 0 }} preserveAspectRatio="none">
              <path d="M0,36 Q180,6 360,36 Q540,66 720,36 Q900,6 1080,36 Q1260,66 1440,36 L1440,70 L0,70 Z" fill="rgba(192,100,18,0.22)" />
            </svg>
          ))}
        </motion.div>
      </div>
      {/* wave 2 */}
      <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 62, overflow: "hidden" }}>
        <motion.div style={{ display: "flex", position: "absolute", top: 0 }}
          animate={{ x: ["-25%", "-75%"] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        >
          {[0, 1].map(i => (
            <svg key={i} viewBox="0 0 1440 62" style={{ width: "100vw", flexShrink: 0 }} preserveAspectRatio="none">
              <path d="M0,31 Q180,7 360,31 Q540,55 720,31 Q900,7 1080,31 Q1260,55 1440,31 L1440,62 L0,62 Z" fill="rgba(172,76,12,0.17)" />
            </svg>
          ))}
        </motion.div>
      </div>
      <motion.div
        animate={{ opacity: [0.45, 0.85, 0.45], scaleX: [0.8, 1.1, 0.8] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "28%", left: "50%", translateX: "-50%",
          width: 100, height: 18,
          background: "rgba(255,205,70,0.38)",
          filter: "blur(8px)", borderRadius: 12,
        }}
      />
    </motion.div>
  );
}

/* ─── PALM SILHOUETTE ────────────────────────────────────────────── */
function Palm({ side }: { side: "left" | "right" }) {
  const posStyle: React.CSSProperties = side === "left"
    ? { left: -8 } : { right: -8, transform: "scaleX(-1)" };
  return (
    <motion.svg viewBox="0 0 120 290"
      style={{
        position: "absolute", bottom: "32%", ...posStyle,
        width: 110, height: 270, opacity: 0.52, pointerEvents: "none", zIndex: 4,
      }}
      animate={{ rotate: [0, 1.5, 0, -1, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M60,290 Q65,225 70,165 Q74,120 66,82 Q63,52 60,22"
        stroke="rgba(55,30,8,0.72)" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M60,28 Q28,-8 -8,18" stroke="rgba(45,65,15,0.62)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M60,28 Q92,-8 128,18" stroke="rgba(45,65,15,0.62)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M60,44 Q18,26 -14,48" stroke="rgba(45,65,15,0.58)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M60,44 Q102,26 134,48" stroke="rgba(45,65,15,0.58)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M60,58 Q32,84 6,74" stroke="rgba(45,65,15,0.52)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M60,58 Q88,84 114,74" stroke="rgba(45,65,15,0.52)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M62,22 Q57,-2 48,-12" stroke="rgba(45,65,15,0.58)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </motion.svg>
  );
}

/* ─── DUSK LAYERS ────────────────────────────────────────────────── */
/* Three-phase sky: golden hour → twilight purple → full night */
function DuskLayers({ sp }: { sp: MotionValue<number> }) {
  const goldenOp   = useTransform(sp, [0.12, 0.42, 0.68], [0, 1, 0]);
  const twilightOp = useTransform(sp, [0.40, 0.68], [0, 1]);
  const nightOp    = useTransform(sp, [0.63, 0.90], [0, 1]);

  return (
    <>
      {/* golden hour — deep orange bleeding up from horizon */}
      <motion.div style={{
        position: "absolute", inset: 0, opacity: goldenOp, pointerEvents: "none", zIndex: 1,
        background: "linear-gradient(180deg, rgba(255,165,80,0) 0%, rgba(255,125,38,0.22) 38%, rgba(230,78,12,0.58) 74%, rgba(195,48,4,0.52) 100%)",
      }} />
      {/* twilight — purple and indigo pour in from the top */}
      <motion.div style={{
        position: "absolute", inset: 0, opacity: twilightOp, pointerEvents: "none", zIndex: 1,
        background: "linear-gradient(180deg, rgba(62,18,90,0.74) 0%, rgba(122,30,78,0.48) 30%, rgba(185,60,18,0.22) 62%, transparent 82%)",
      }} />
      {/* full night — deep blue-black blanket */}
      <motion.div style={{
        position: "absolute", inset: 0, opacity: nightOp, pointerEvents: "none", zIndex: 1,
        background: "linear-gradient(180deg, rgba(4,4,22,0.94) 0%, rgba(8,6,26,0.91) 44%, rgba(12,7,21,0.78) 78%, rgba(18,8,15,0.58) 100%)",
      }} />
    </>
  );
}

/* ─── STARS ──────────────────────────────────────────────────────── */
function Stars({ sp }: { sp: MotionValue<number> }) {
  const opacity = useTransform(sp, [0.60, 0.90], [0, 1]);
  const dots = useMemo(() =>
    Array.from({ length: 32 }, (_, i) => ({
      x: (i * 137 % 94) + 3,
      y: (i * 97  % 54) + 2,
      r: (i % 3) * 0.5 + 0.6,
      d: (i % 7) * 0.35,
    })),
  []);

  return (
    <motion.div style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none", zIndex: 1 }}>
      {dots.map((s, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.8 + s.d, repeat: Infinity, ease: "easeInOut", delay: s.d }}
          style={{
            position: "absolute", borderRadius: "50%",
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.r * 2, height: s.r * 2,
            background: "rgba(255,245,210,0.95)",
            boxShadow: `0 0 ${s.r * 3}px rgba(255,240,200,0.55)`,
          }}
        />
      ))}
    </motion.div>
  );
}

/* ─── CITY LIGHTS ────────────────────────────────────────────────── */
function CityLights({ sp }: { sp: MotionValue<number> }) {
  const opacity = useTransform(sp, [0.56, 0.82], [0, 1]);

  // Deterministic skyline SVG path
  const skylinePath = useMemo(() => {
    let seed = 54321;
    const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const W = 1440, H = 60;
    let p = `M0,${H}`;
    let x = 0;
    while (x < W) {
      const bw = Math.round(rand() * 26) + 9;
      const bh = Math.round(rand() * 42) + 10;
      p += ` L${x},${H - bh} L${Math.min(x + bw, W)},${H - bh}`;
      x += bw;
      if (rand() > 0.82 && x < W - 8) {
        const gap = Math.round(rand() * 4) + 1;
        p += ` L${x},${H} L${x + gap},${H}`;
        x += gap;
      }
    }
    p += ` L${W},${H} Z`;
    return p;
  }, []);

  // Deterministic window lights
  const windows = useMemo(() => {
    let seed = 98765;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0xffffffff; };
    return Array.from({ length: 58 }, (_, i) => {
      const x = rand() * 97 + 1.5;
      const y = rand() * 62 + 14; // % from bottom, inside building band
      const warm = i % 5 === 0;
      const cool = i % 7 === 0;
      const c = cool
        ? "rgba(175,215,255,0.95)"
        : warm ? "rgba(255,255,195,0.92)"
        : "rgba(255,210,110,0.88)";
      return { x, y, c, d: rand() * 2.8 };
    });
  }, []);

  return (
    <motion.div style={{
      position: "absolute", top: "57%", left: 0, right: 0,
      height: "13%", opacity, pointerEvents: "none", zIndex: 5,
    }}>
      {/* city light pollution haze */}
      <div style={{
        position: "absolute", bottom: "46%", left: 0, right: 0, height: 32,
        background: "linear-gradient(180deg, transparent, rgba(255,160,55,0.16), rgba(255,130,35,0.09), transparent)",
        filter: "blur(12px)",
      }} />

      {/* building silhouettes */}
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none"
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "100%" }}>
        <path d={skylinePath} fill="rgba(4,2,14,0.92)" />
      </svg>

      {/* window lights */}
      {windows.map((w, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 2.4 + w.d, repeat: Infinity, ease: "easeInOut", delay: w.d }}
          style={{
            position: "absolute",
            left: `${w.x}%`,
            bottom: `${w.y * 0.55}%`,
            width: 3, height: 3,
            background: w.c,
            borderRadius: 0.5,
            boxShadow: `0 0 6px ${w.c}, 0 0 10px ${w.c}`,
          }}
        />
      ))}

      {/* reflection in water below */}
      <div style={{
        position: "absolute", top: "98%", left: "10%", right: "10%", height: 24,
        background: "linear-gradient(180deg, rgba(255,165,55,0.14), transparent)",
        filter: "blur(14px)",
      }} />
    </motion.div>
  );
}

/* ─── MOON ───────────────────────────────────────────────────────── */
function Moon({ sp }: { sp: MotionValue<number> }) {
  const opacity = useTransform(sp, [0.70, 0.90], [0, 1]);
  return (
    <motion.div style={{
      position: "absolute", top: "8%", right: "12%",
      opacity, pointerEvents: "none", zIndex: 2,
    }}>
      <motion.div
        animate={{ scale: [1, 1.025, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "relative", width: 46, height: 46 }}
      >
        {/* glow */}
        <div style={{
          position: "absolute", inset: -20, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(220,235,255,0.22) 0%, transparent 70%)",
          filter: "blur(10px)",
        }} />
        {/* disk */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "radial-gradient(circle at 38% 35%, #f8f4e8 0%, #e8e0c8 55%, #c8c0a8 100%)",
          boxShadow: "0 0 18px rgba(200,215,255,0.55), 0 0 40px rgba(200,215,255,0.22)",
        }} />
        {/* crescent shadow */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "radial-gradient(circle at 68% 38%, rgba(4,4,22,0.72) 28%, transparent 62%)",
        }} />
      </motion.div>
    </motion.div>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────── */
export default function AboutPage() {
  const { scrollYProgress } = useScroll();

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ══ FIXED BACKGROUND ═══════════════════════════════════════ */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>

        {/* base sky — warm cream-to-amber */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, #f7f3ec 0%, #fdefd2 35%, #fcd993 57%, #f4a94c 76%, #de7722 91%, #b65616 100%)",
        }} />

        <DuskLayers sp={scrollYProgress} />
        <Stars       sp={scrollYProgress} />
        <Moon        sp={scrollYProgress} />
        <Sun         sp={scrollYProgress} />
        <SunReflection sp={scrollYProgress} />

        <Cloud sp={scrollYProgress} topPct={9}  leftPct={8}  speed={0.7} size={1.1} />
        <Cloud sp={scrollYProgress} topPct={18} leftPct={55} speed={1.0} size={0.8} />
        <Cloud sp={scrollYProgress} topPct={28} leftPct={22} speed={0.5} size={0.95} />

        <Seagull sp={scrollYProgress} top="14%"  left="28%" scale={0.9} delay={0}   />
        <Seagull sp={scrollYProgress} top="20%"  left="62%" scale={0.7} delay={1.2} />
        <Seagull sp={scrollYProgress} top="10%"  left="75%" scale={1.0} delay={0.5} />
        <Seagull sp={scrollYProgress} top="25%"  left="42%" scale={0.75} delay={2.1} />

        <Palm side="left"  />
        <Palm side="right" />

        <CityLights sp={scrollYProgress} />
        <WaveLayer  sp={scrollYProgress} />
      </div>

      {/* ══ ENTRANCE fade from orange portal ══════════════════════ */}
      <motion.div
        initial={{ opacity: 1 }} animate={{ opacity: 0 }}
        transition={{ duration: 1.1, delay: 0.05 }}
        style={{
          position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none",
          background: "radial-gradient(circle at 72% 72%, #ff8822 0%, #ffcc66 45%, #fff8ee 100%)",
        }}
      />

      {/* ══ CONTENT ════════════════════════════════════════════════ */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "0 22px 88px" }}>

        {/* back */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{ paddingTop: 36 }}>
          <Link href="/" style={{
            fontSize: 11, fontFamily: "monospace", letterSpacing: "0.07em",
            color: "rgba(160,95,20,0.55)", textDecoration: "none",
          }}>← portfolio</Link>
        </motion.div>

        {/* ── OPENING ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginTop: 44, marginBottom: 20,
            padding: "28px 30px",
            background: "rgba(255,253,248,0.84)",
            backdropFilter: "blur(18px)",
            borderRadius: 20,
            border: "1px solid rgba(210,150,50,0.18)",
            boxShadow: "0 2px 28px rgba(180,100,20,0.07)",
          }}
        >
          <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(170,95,20,0.5)" }}>
            you found the corner
          </span>
          <h1 style={{
            fontFamily: "var(--font-instrument)",
            fontSize: "clamp(2.4rem, 8vw, 3.6rem)",
            lineHeight: 1.06, letterSpacing: "-0.025em",
            color: "#1a1008", margin: "10px 0 14px", fontWeight: 400,
          }}>
            This is the real page.
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.72, color: "#7a6248", margin: 0 }}>
            Most people scroll the portfolio and move on. You drove a jeep to a corner to find this. That already tells me something.
          </p>
        </motion.div>

        {/* ── PHOTO + ID ───────────────────────────────────────── */}
        <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <Photo alt="Eugenio" style={{ minHeight: 300 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                flex: 1, padding: "20px 22px",
                background: "rgba(255,253,248,0.86)", backdropFilter: "blur(14px)",
                borderRadius: 16, border: "1px solid rgba(210,150,50,0.16)",
              }}>
                <div style={{ fontFamily: "var(--font-instrument)", fontSize: "1.55rem", lineHeight: 1.15, letterSpacing: "-0.015em", color: "#1a1008" }}>
                  Eugenio<br />Bustamante
                </div>
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                  {[
                    { k: "From", v: "Málaga, Spain" },
                    { k: "Now",  v: "Dublin, Ireland" },
                    { k: "CS",   v: "2nd year, DCU" },
                  ].map(({ k, v }) => (
                    <div key={k} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      <span style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.09em", color: "rgba(170,95,20,0.5)", minWidth: 28 }}>{k}</span>
                      <span style={{ fontSize: 13, color: "#5a4030" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                padding: "14px 18px",
                background: "rgba(215,145,40,0.1)", backdropFilter: "blur(10px)",
                borderRadius: 14, border: "1px solid rgba(210,150,50,0.22)",
              }}>
                <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(160,90,20,0.55)", marginBottom: 8 }}>Languages</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["🇪🇸","ES"],["🇬🇧","EN"],["🇫🇷","FR"]].map(([flag, code]) => (
                    <span key={code} style={{
                      display: "flex", alignItems: "center", gap: 4,
                      fontSize: 12, padding: "4px 10px", borderRadius: 20,
                      background: "rgba(255,253,248,0.82)",
                      border: "1px solid rgba(210,155,55,0.28)",
                      color: "#5a4030",
                    }}><span style={{ fontSize: 14 }}>{flag}</span>{code}</span>
                  ))}
                </div>
                <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(160,90,20,0.4)", marginTop: 7 }}>all native</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── STORY + CODING ───────────────────────────────────── */}
        <Reveal delay={0.05}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            {[
              { label: "The story", text: "Grew up in Málaga, went to a French school. Moved to England at seven — English became part of me. Madrid at twelve. A few months in Paris. Now Dublin for CS." },
              { label: "How coding started", text: "First computer I just wanted to know what it could do. Python at twelve. Then HTML, then everything else. My only advice: just fidget with it." },
            ].map(({ label, text }) => (
              <div key={label} style={{
                padding: "22px 24px",
                background: "rgba(255,253,248,0.84)", backdropFilter: "blur(14px)",
                borderRadius: 16, border: "1px solid rgba(210,150,50,0.14)",
              }}>
                <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(170,95,20,0.5)", marginBottom: 10 }}>{label}</div>
                <p style={{ fontSize: 14, lineHeight: 1.78, color: "#5a4030", margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── OUTSIDE CODE ─────────────────────────────────────── */}
        <Reveal delay={0.04}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{
              padding: "22px 24px",
              background: "rgba(255,253,248,0.84)", backdropFilter: "blur(14px)",
              borderRadius: 16, border: "1px solid rgba(210,150,50,0.14)",
            }}>
              <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(170,95,20,0.5)", marginBottom: 12 }}>Outside code</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {["Tennis daily", "Gym daily", "Piano", "Guitar", "Ukulele", "Drums"].map(t => (
                  <span key={t} style={{
                    fontSize: 11, padding: "4px 11px", borderRadius: 20,
                    background: "rgba(215,145,40,0.1)", border: "1px solid rgba(210,150,50,0.2)",
                    color: "#5a4020",
                  }}>{t}</span>
                ))}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "#7a6248", margin: 0 }}>
                Tennis I would play every day for the rest of my life. I compose too, have my own music made with software. Both music and code are about building something from nothing.
              </p>
            </div>
            <Photo alt="Life" style={{ minHeight: 220 }} />
          </div>
        </Reveal>

        {/* ── AI TAKE — dark card ───────────────────────────────── */}
        <Reveal delay={0.04}>
          <div style={{
            padding: "26px 28px", marginBottom: 14,
            background: "rgba(18,10,3,0.87)", backdropFilter: "blur(18px)",
            borderRadius: 18, border: "1px solid rgba(220,140,40,0.14)",
          }}>
            <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(220,140,40,0.45)", marginBottom: 12 }}>
              An honest take
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.76, color: "rgba(248,242,232,0.72)", margin: 0 }}>
              AI is just the next layer of abstraction. Assembly, then C, then Python, now this. We adapt and go further. What I actually think: in a few years websites won't be browsed by people. They will be endpoints for AI agents. No hero sections, no animations. Just structure and speed. I find that exciting.
            </p>
          </div>
        </Reveal>

        {/* ── PITCH CTA ────────────────────────────────────────── */}
        <Reveal delay={0.04}>
          <div style={{
            padding: "28px 30px", marginBottom: 14,
            background: "linear-gradient(135deg, rgba(205,125,30,0.13) 0%, rgba(220,165,45,0.07) 100%)",
            backdropFilter: "blur(14px)",
            borderRadius: 20,
            border: "1px solid rgba(205,125,30,0.28)",
          }}>
            <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(170,95,20,0.55)", marginBottom: 10 }}>The adventure</div>
            <h2 style={{
              fontFamily: "var(--font-instrument)", fontSize: "clamp(1.35rem, 4vw, 1.8rem)",
              lineHeight: 1.2, letterSpacing: "-0.015em", color: "#1a1008",
              margin: "0 0 12px", fontWeight: 400,
            }}>
              Building Pitch. Join if you want.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "#5a4020", marginBottom: 20 }}>
              A networking platform for founders and investors. Something premium that people actually need. If you want to help build it, reach out. No formalities.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Email",    value: "eugeniobrb@icloud.com", href: "mailto:eugeniobrb@icloud.com" },
                { label: "WhatsApp", value: "+34 697 476 663",        href: "https://wa.me/34697476663" },
              ].map(({ label, value, href }) => (
                <a key={label} href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", flexDirection: "column", gap: 5,
                    padding: "14px 16px", borderRadius: 12, textDecoration: "none",
                    background: "rgba(255,253,248,0.78)", border: "1px solid rgba(205,145,45,0.22)",
                    transition: "border-color 0.18s, background 0.18s",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(205,125,30,0.5)";
                    el.style.background = "rgba(255,253,248,0.95)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(205,145,45,0.22)";
                    el.style.background = "rgba(255,253,248,0.78)";
                  }}
                >
                  <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(160,90,20,0.5)" }}>{label}</span>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: "#3a2808" }}>{value}</span>
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── SIGN OFF ─────────────────────────────────────────── */}
        <Reveal delay={0.04}>
          <div style={{
            textAlign: "center", paddingTop: 36, marginTop: 12,
            borderTop: "1px solid rgba(205,145,45,0.14)",
          }}>
            <p style={{
              fontFamily: "var(--font-instrument)", fontSize: "1.15rem",
              color: "rgba(90,64,32,0.5)", fontStyle: "italic", margin: "0 0 8px",
            }}>
              "Thanks for coming this far."
            </p>
            <p style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(160,100,30,0.4)", marginBottom: 24 }}>
              — Eugenio
            </p>
            <Link href="/" style={{
              fontSize: 11, fontFamily: "monospace", letterSpacing: "0.06em",
              color: "rgba(160,100,30,0.45)", textDecoration: "none",
            }}>
              ← back to the portfolio
            </Link>
          </div>
        </Reveal>

      </div>
    </div>
  );
}
