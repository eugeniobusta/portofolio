"use client";

import React from "react";
import Image from "next/image";

/* Animated preview visuals for each project card. */

function PitchVisual({ featured }: { featured?: boolean }) {
  const h = featured ? "h-52" : "h-36";
  return (
    <div className={`relative ${h} w-full overflow-hidden rounded-t-xl`}
      style={{ background: "linear-gradient(135deg, oklch(20% 0.02 250) 0%, oklch(25% 0.04 230) 100%)" }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 120%, oklch(58% 0.18 255 / 0.25), transparent)" }} />

      {/* Back card */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ animation: "float-card-back 4s ease-in-out infinite", transformOrigin: "center" }}>
        <div className="w-36 h-24 rounded-2xl border border-white/10 flex flex-col justify-end p-3 gap-1"
          style={{ background: "linear-gradient(160deg, oklch(35% 0.08 220), oklch(28% 0.04 240))" }}>
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20" />
          <div className="h-1.5 w-16 rounded-full bg-white/20" />
          <div className="h-1 w-10 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Front card */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%]"
        style={{ animation: "float-card 3.5s ease-in-out infinite", transformOrigin: "center" }}>
        <div className="w-40 h-28 rounded-2xl border border-white/20 shadow-2xl flex flex-col p-3 gap-2"
          style={{ background: "linear-gradient(160deg, oklch(40% 0.12 250), oklch(32% 0.06 240))" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white/80"
              style={{ background: "oklch(55% 0.18 255 / 0.6)" }}>A</div>
            <div className="flex flex-col gap-1">
              <div className="h-1.5 w-16 rounded-full bg-white/40" />
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>
          </div>
          <div className="text-[9px] text-white/50 leading-snug">Founder @ AI Startup · Dublin</div>
          <div className="flex items-center justify-between mt-auto">
            <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-xs text-red-400">✕</div>
            <div className="text-[8px] text-white/30 font-mono">94% match</div>
            <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-xs text-green-400">♥</div>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-3 left-4 text-[9px] font-mono text-white/25 uppercase tracking-widest">
        React Native · Expo
      </div>
    </div>
  );
}

function CosmosVisual({ featured }: { featured?: boolean }) {
  const size = featured ? 160 : 110;
  return (
    <div className={`relative ${featured ? "h-52" : "h-36"} w-full overflow-hidden rounded-t-xl flex items-center justify-center`}
      style={{ background: "radial-gradient(ellipse at 50% 60%, oklch(14% 0.01 250) 0%, oklch(10% 0.005 250) 100%)" }}>

      {/* Stars */}
      {[[15,20],[45,8],[70,25],[85,15],[25,45],[90,40],[10,65],[55,60],[80,70],[35,80],[60,85],[20,90]].map(([x, y], i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{ left: `${x}%`, top: `${y}%`, width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1, opacity: 0.3 + (i % 4) * 0.15 }} />
      ))}

      {/* Solar system SVG */}
      <svg width={size} height={size} viewBox="0 0 160 160" style={{ overflow: "visible" }}>
        {/* Orbital rings */}
        <circle cx="80" cy="80" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 5" />
        <circle cx="80" cy="80" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 7" />
        <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="2 8" />

        {/* Sun glow */}
        <circle cx="80" cy="80" r="16" fill="oklch(72% 0.155 68 / 0.2)" />
        {/* Sun */}
        <circle cx="80" cy="80" r="10" fill="oklch(78% 0.155 68)" />

        {/* Planet 1 — inner orbit, fast */}
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 80 80" to="360 80 80" dur="4s" repeatCount="indefinite" />
          <circle cx="112" cy="80" r="5" fill="oklch(62% 0.14 255)" />
        </g>

        {/* Planet 2 — mid orbit, medium */}
        <g>
          <animateTransform attributeName="transform" type="rotate" from="120 80 80" to="480 80 80" dur="8s" repeatCount="indefinite" />
          <circle cx="132" cy="80" r="7" fill="oklch(52% 0.09 145)" />
          {/* Saturn-like ring on planet 2 */}
          <ellipse cx="132" cy="80" rx="11" ry="3" fill="none" stroke="oklch(52% 0.09 145 / 0.5)" strokeWidth="1">
            <animateTransform attributeName="transform" type="rotate" from="120 80 80" to="480 80 80" dur="8s" repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* Planet 3 — outer orbit, slow */}
        <g>
          <animateTransform attributeName="transform" type="rotate" from="240 80 80" to="600 80 80" dur="14s" repeatCount="indefinite" />
          <circle cx="150" cy="80" r="4" fill="oklch(70% 0.06 30)" />
        </g>
      </svg>

      <div className="absolute bottom-3 left-4 text-[9px] font-mono text-white/25 uppercase tracking-widest">
        Three.js · R3F
      </div>
    </div>
  );
}

function VoiceVisual({ featured }: { featured?: boolean }) {
  const bars = [
    { anim: "wave-1", h: "60%", delay: "0s" },
    { anim: "wave-2", h: "30%", delay: "0.1s" },
    { anim: "wave-3", h: "80%", delay: "0.2s" },
    { anim: "wave-4", h: "50%", delay: "0.05s" },
    { anim: "wave-5", h: "40%", delay: "0.15s" },
    { anim: "wave-6", h: "70%", delay: "0.08s" },
    { anim: "wave-7", h: "35%", delay: "0.25s" },
  ];

  return (
    <div className={`relative ${featured ? "h-52" : "h-36"} w-full overflow-hidden rounded-t-xl flex items-center`}
      style={{ background: "linear-gradient(135deg, oklch(18% 0.01 145) 0%, oklch(22% 0.02 160) 100%)" }}>

      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 30% 50%, oklch(55% 0.12 145 / 0.12), transparent)" }} />

      {/* Left: mic + waveform */}
      <div className="flex flex-col items-center gap-3 pl-8 pr-4">
        {/* Mic icon (SVG) */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10"
          style={{ background: "oklch(40% 0.1 145 / 0.4)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3" width="6" height="11" rx="3" fill="oklch(70% 0.1 145)" />
            <path d="M5 11a7 7 0 0 0 14 0" stroke="oklch(70% 0.1 145)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <line x1="12" y1="18" x2="12" y2="22" stroke="oklch(70% 0.1 145)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Waveform bars */}
        <div className="flex items-center gap-0.5" style={{ height: 28 }}>
          {bars.map((b, i) => (
            <div key={i} className="w-1 rounded-full origin-center"
              style={{
                background: "oklch(65% 0.12 145)",
                height: b.h,
                animation: `${b.anim} 1.4s ease-in-out infinite`,
                animationDelay: b.delay,
              }} />
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex flex-col items-center gap-1 px-2">
        <div className="text-white/20 text-sm">→</div>
        <div className="text-[8px] text-white/20 font-mono">Groq</div>
      </div>

      {/* Right: mini calendar */}
      <div className="flex flex-col gap-1 pr-8">
        <div className="text-[8px] text-white/30 font-mono mb-1 uppercase tracking-widest">Calendar</div>
        <div className="grid grid-cols-5 gap-0.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-4 h-3 rounded-sm"
              style={{
                background: [2, 7, 8, 13].includes(i)
                  ? "oklch(58% 0.12 145 / 0.9)"
                  : "oklch(100% 0 0 / 0.06)",
              }} />
          ))}
        </div>
        <div className="mt-1.5 px-1.5 py-0.5 rounded text-[7px] text-white/60 border border-white/10"
          style={{ background: "oklch(40% 0.1 145 / 0.3)" }}>
          + 3 events added
        </div>
      </div>
    </div>
  );
}

function StartupVisual({ featured }: { featured?: boolean }) {
  const tiles = [
    { color: "oklch(40% 0.08 255)", label: "Alex", initials: "AC" },
    { color: "oklch(38% 0.08 30)",  label: "Maria", initials: "MG" },
    { color: "oklch(35% 0.06 145)", label: "You", initials: "EB" },
    { color: "oklch(36% 0.07 300)", label: "Jake", initials: "JK" },
  ];

  return (
    <div className={`relative ${featured ? "h-52" : "h-36"} w-full overflow-hidden rounded-t-xl flex flex-col items-center justify-center gap-2`}
      style={{ background: "linear-gradient(135deg, oklch(15% 0.01 250) 0%, oklch(20% 0.02 260) 100%)" }}>

      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(45% 0.15 255 / 0.08), transparent)" }} />

      {/* 2x2 video grid */}
      <div className="grid grid-cols-2 gap-1.5 z-10">
        {tiles.map((tile, i) => (
          <div key={i} className="w-20 h-14 rounded-xl flex flex-col items-start justify-end p-1.5 relative overflow-hidden border"
            style={{
              background: tile.color,
              borderColor: i === 2 ? "oklch(65% 0.15 145 / 0.8)" : "rgba(255,255,255,0.07)",
              animation: i === 2 ? "match-blink 2s ease-in-out infinite" : "none",
            }}>
            {/* "Video" gradient overlay */}
            <div className="absolute inset-0 rounded-xl"
              style={{ background: `radial-gradient(ellipse 60% 70% at 50% 30%, ${tile.color} 0%, rgba(0,0,0,0.4) 100%)` }} />
            {/* Avatar silhouette */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[6px] font-bold text-white/70">
                {tile.initials}
              </div>
            </div>
            <div className="relative text-[7px] text-white/50 z-10">{tile.label}</div>
          </div>
        ))}
      </div>

      {/* Match score bar */}
      <div className="flex items-center gap-2 z-10 mt-1">
        <div className="relative w-2 h-2">
          <div className="absolute inset-0 rounded-full bg-green-400" />
          <div className="absolute inset-0 rounded-full bg-green-400"
            style={{ animation: "ping-soft 1.5s ease-out infinite" }} />
        </div>
        <span className="text-[9px] text-white/40 font-mono">Match score · 94%</span>
      </div>
    </div>
  );
}

function SweatShotVisual({ featured }: { featured?: boolean }) {
  const [idx, setIdx] = React.useState(0);
  const slides = [
    "/projects/sweatshot/show-work.png",
    "/projects/sweatshot/3.png",
    "/projects/sweatshot/1.png",
    "/projects/sweatshot/2.png",
    "/projects/sweatshot/5.png",
  ];

  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`relative ${featured ? "h-80" : "h-36"} w-full overflow-hidden rounded-t-xl`}>
      {slides.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === idx ? 1 : 0 }}
        >
          <Image src={src} alt="SweatShot" fill className="object-cover object-top" sizes="(max-width: 768px) 100vw, 66vw" />
        </div>
      ))}
      {/* bottom gradient so card content reads cleanly */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent 55%, oklch(12% 0.005 250 / 0.85) 100%)" }} />
      {/* dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{ background: i === idx ? "#fbbf24" : "rgba(255,255,255,0.3)" }}
          />
        ))}
      </div>
    </div>
  );
}

function TennisVisual({ featured }: { featured?: boolean }) {
  return (
    <div className={`relative ${featured ? "h-52" : "h-36"} w-full overflow-hidden rounded-t-xl`}>
      <Image
        src="/projects/social-tennis.png"
        alt="DCU Social Tennis"
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      {/* Gradient overlay so card text reads cleanly below */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, transparent 40%, oklch(18% 0.01 145 / 0.7) 100%)" }} />
      <div className="absolute bottom-3 left-4 text-[9px] font-mono text-white/60 uppercase tracking-widest">
        DCU Tennis · 2025
      </div>
    </div>
  );
}

export default function ProjectVisual({ id, featured }: { id: string; featured?: boolean }) {
  switch (id) {
    case "pitch":         return <PitchVisual  featured={featured} />;
    case "cosmosbusta":   return <CosmosVisual  featured={featured} />;
    case "voice-calendar":return <VoiceVisual   featured={featured} />;
    case "startup-match": return <StartupVisual featured={featured} />;
    case "social-tennis": return <TennisVisual    featured={featured} />;
    case "sweatshot":     return <SweatShotVisual featured={featured} />;
    default:              return null;
  }
}
