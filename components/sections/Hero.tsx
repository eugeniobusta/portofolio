"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowRight, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";

/* ─── PHYSICS HELPERS ───────────────────────────────────────────────────── */

const rng = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const FALL = Array.from({ length: 25 }, (_, i) => ({
  x:   (rng(i * 7.31)  - 0.5) * 520,
  rot: (rng(i * 11.73) - 0.5) * 760,
  dur: 0.50 + rng(i * 3.17) * 0.40,
  del: rng(i * 5.41) * 0.08,
}));

const GRAV = [0.42, 0, 1, 1] as const;

/* Secondary sparks that radiate from the explosion origin */
const SPARKS = [
  { ox: -220, oy:  -80, delay: 0.06, sz: 22, sc: 22 },
  { ox:  190, oy: -140, delay: 0.10, sz: 16, sc: 18 },
  { ox:  270, oy:   65, delay: 0.08, sz: 20, sc: 20 },
  { ox: -170, oy:  150, delay: 0.13, sz: 14, sc: 16 },
  { ox:   90, oy: -210, delay: 0.05, sz: 12, sc: 14 },
  { ox: -300, oy:   30, delay: 0.11, sz: 10, sc: 12 },
];

/* ─── ENTRANCE VARIANTS ─────────────────────────────────────────────────── */

const enter = {
  name: {
    hidden:  { opacity: 0, x: -60, filter: "blur(8px)" },
    visible: { opacity: 1, x: 0,   filter: "blur(0px)",
      transition: { type: "spring" as const, damping: 20, stiffness: 180 } },
  },
  tagline: {
    hidden:  { opacity: 0, x: 45, filter: "blur(5px)" },
    visible: { opacity: 1, x: 0,  filter: "blur(0px)",
      transition: { type: "spring" as const, damping: 20, stiffness: 180, delay: 0.08 } },
  },
  simplicity: {
    hidden:  { opacity: 0, y: 24, scale: 0.93 },
    visible: { opacity: 1, y: 0,  scale: 1,
      transition: { type: "spring" as const, damping: 18, stiffness: 220, delay: 0.18 } },
  },
  ctas: {
    hidden:  { opacity: 0, y: 36, scale: 0.95 },
    visible: { opacity: 1, y: 0,  scale: 1,
      transition: { type: "spring" as const, damping: 18, stiffness: 220, delay: 0.28 } },
  },
  social: {
    hidden:  { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0,
      transition: { type: "spring" as const, damping: 20, stiffness: 200, delay: 0.42 } },
  },
};

/* Collapse for block-level elements that don't use BreakableElement */
const out = {
  tagline:    { y: "70vh",  x: -70,  rotate: -9, opacity: 0,
    transition: { duration: 0.70, delay: 0.40, ease: GRAV } },
  simplicity: { y: "-60vh", x:  40,  rotate:  5, opacity: 0,
    transition: { duration: 0.55, delay: 0.28, ease: GRAV } },
  chevron:    { y: "50vh",                        opacity: 0,
    transition: { duration: 0.30, delay: 0.05, ease: GRAV } },
};

/* ─── BREAKABLE ELEMENT ─────────────────────────────────────────────────── */
/*
 * Renders children three times:
 *   1. Original  — visible normally, snaps to opacity:0 the instant collapsing starts
 *   2. Top shard — clip-path shows only the top half; flies up+away
 *   3. Bot shard — clip-path shows only the bottom half; falls down+away
 *
 * The keyframe syntax [start, end] on each shard guarantees the shard SNAPS
 * to position=0 the frame collapse begins (regardless of prior animation state),
 * so there's no visible gap between "original disappears" and "halves appear".
 *
 * A neon crack-flash at the seam runs for ~80 ms right before the halves separate.
 */
interface SplitExit {
  x: number;
  y: number;
  rotate: number;
  delay: number;
  dur?: number;
}

function BreakableElement({
  isCollapsing,
  top,
  bot,
  children,
}: {
  isCollapsing: boolean;
  top: SplitExit;
  bot: SplitExit;
  children: ReactNode;
}) {
  const CLIP_TOP = "polygon(0% 0%, 100% 0%, 100% 46%, 0% 54%)";
  const CLIP_BOT = "polygon(0% 54%, 100% 46%, 100% 100%, 0% 100%)";
  const crackDelay = Math.min(top.delay, bot.delay);

  return (
    <div className="relative inline-flex">

      {/* ── ORIGINAL ── */}
      <motion.div
        initial={false}
        animate={{ opacity: isCollapsing ? 0 : 1 }}
        transition={{ duration: 0 }}
      >
        {children}
      </motion.div>

      {/* ── CRACK FLASH — neon line that strobes at the seam right before split ── */}
      <AnimatePresence>
        {isCollapsing && (
          <motion.div
            key="crack"
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: "50%",
              height: 2,
              zIndex: 10,
              background:
                "linear-gradient(90deg, transparent 0%, oklch(92% 0.42 145) 20%, oklch(98% 0.44 145) 50%, oklch(92% 0.42 145) 80%, transparent 100%)",
            }}
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1.3, opacity: 0 }}
            transition={{ duration: 0.09, delay: crackDelay }}
          />
        )}
      </AnimatePresence>

      {/* ── TOP SHARD ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ clipPath: CLIP_TOP }}
        aria-hidden
      >
        <motion.div
          initial={false}
          animate={
            isCollapsing
              ? { y: [0, top.y], x: [0, top.x], rotate: [0, top.rotate], opacity: [1, 1, 0] }
              : { y: 0, x: 0, rotate: 0, opacity: 0 }
          }
          transition={
            isCollapsing
              ? {
                  y:       { duration: top.dur ?? 0.60, delay: top.delay, ease: GRAV },
                  x:       { duration: top.dur ?? 0.60, delay: top.delay, ease: GRAV },
                  rotate:  { duration: top.dur ?? 0.60, delay: top.delay, ease: GRAV },
                  opacity: { duration: top.dur ?? 0.60, delay: top.delay, times: [0, 0.65, 1] },
                }
              : { duration: 0 }
          }
        >
          {children}
        </motion.div>
      </div>

      {/* ── BOTTOM SHARD ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ clipPath: CLIP_BOT }}
        aria-hidden
      >
        <motion.div
          initial={false}
          animate={
            isCollapsing
              ? { y: [0, bot.y], x: [0, bot.x], rotate: [0, bot.rotate], opacity: [1, 1, 0] }
              : { y: 0, x: 0, rotate: 0, opacity: 0 }
          }
          transition={
            isCollapsing
              ? {
                  y:       { duration: bot.dur ?? 0.65, delay: bot.delay, ease: GRAV },
                  x:       { duration: bot.dur ?? 0.65, delay: bot.delay, ease: GRAV },
                  rotate:  { duration: bot.dur ?? 0.65, delay: bot.delay, ease: GRAV },
                  opacity: { duration: bot.dur ?? 0.65, delay: bot.delay, times: [0, 0.65, 1] },
                }
              : { duration: 0 }
          }
        >
          {children}
        </motion.div>
      </div>

    </div>
  );
}

/* ─── LETTER-BY-LETTER NAME ─────────────────────────────────────────────── */

const NAME_LINES: [string, number][] = [
  ["Eugenio",     0],
  ["Bustamante.", 7],
];

function FallingName({ isCollapsing }: { isCollapsing: boolean }) {
  return (
    <motion.h1
      variants={enter.name as never}
      initial="hidden"
      animate="visible"
      className="font-serif text-[clamp(3.5rem,10vw,7rem)] leading-[0.95] tracking-[-0.03em] text-ink mb-6"
    >
      {NAME_LINES.map(([line, offset]) => (
        <span key={offset} style={{ display: "block" }}>
          {line.split("").map((char, ci) => {
            const gi = offset + ci;
            const f  = FALL[gi] ?? FALL[0];
            return (
              <motion.span
                key={gi}
                initial={false}
                style={{ display: "inline-block" }}
                animate={
                  isCollapsing
                    ? { y: "145vh", x: f.x, rotate: f.rot, opacity: 0 }
                    : { y: 0, x: 0, rotate: 0, opacity: 1 }
                }
                transition={{
                  duration: f.dur,
                  delay:    gi * 0.042 + f.del + (offset > 0 ? 0.10 : 0),
                  ease:     GRAV,
                }}
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </motion.h1>
  );
}

/* ─── HERO ──────────────────────────────────────────────────────────────── */

interface HeroProps {
  onGameOpen:   () => void;
  isCollapsing: boolean;
}

export default function Hero({ onGameOpen, isCollapsing }: HeroProps) {
  const [exploding, setExploding] = useState(false);
  const [origin,    setOrigin]    = useState({ x: 0, y: 0 });
  const btnWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCollapsing) setExploding(false);
  }, [isCollapsing]);

  const handleEnterLab = () => {
    if (isCollapsing || exploding) return;
    if (btnWrapRef.current) {
      const r = btnWrapRef.current.getBoundingClientRect();
      setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }
    setExploding(true);
    setTimeout(onGameOpen, 200);
  };

  return (
    <section
      className="relative min-h-[100dvh] flex flex-col justify-center"
      aria-label="Introduction"
    >
      {/* ══════════════════════════════════════════════════════════════════
          EXPLOSION OVERLAY
          Main neon ring + secondary sparks — all fixed, z-999, pointer-none.
          Keyframe ease [0.05, 0.35, 0.8, 1] = fast initial expansion then eases.
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {exploding && (
          <>
            {/* Main ring — expands from button center to fill viewport */}
            <motion.div
              key="main-explosion"
              className="fixed rounded-full pointer-events-none"
              style={{
                zIndex:     999,
                left:       origin.x,
                top:        origin.y,
                width:      60,
                height:     60,
                marginLeft: -30,
                marginTop:  -30,
                background: "radial-gradient(circle, oklch(96% 0.44 145) 0%, oklch(86% 0.36 145 / 0.6) 45%, transparent 70%)",
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 70, opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.05, 0.35, 0.80, 1] }}
            />

            {/* Secondary sparks — smaller rings at offset positions */}
            {SPARKS.map((s, i) => (
              <motion.div
                key={`spark-${i}`}
                className="fixed rounded-full pointer-events-none"
                style={{
                  zIndex:     998,
                  left:       origin.x + s.ox,
                  top:        origin.y + s.oy,
                  width:      s.sz,
                  height:     s.sz,
                  marginLeft: -s.sz / 2,
                  marginTop:  -s.sz / 2,
                  background: "oklch(88% 0.38 145)",
                }}
                initial={{ scale: 0, opacity: 0.9 }}
                animate={{ scale: s.sc, opacity: 0 }}
                transition={{ duration: 0.38, delay: s.delay, ease: [0.1, 0.5, 0.9, 1] }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <div className="container">
        <div className="max-w-3xl pt-28 pb-16">

          {/* Name */}
          <FallingName isCollapsing={isCollapsing} />

          {/* Tagline — falls as block */}
          <motion.p
            variants={enter.tagline as never}
            initial="hidden"
            animate={isCollapsing ? out.tagline : "visible"}
            className="text-lg text-muted leading-relaxed max-w-md mb-3"
          >
            I build things at the intersection of software and intelligence.
            Currently obsessed with what happens when AI meets real products.
          </motion.p>

          {/* Simplicity — floats up against gravity */}
          <motion.p
            variants={enter.simplicity as never}
            initial="hidden"
            animate={isCollapsing ? out.simplicity : "visible"}
            className="text-sm text-muted/60 italic font-serif mb-10"
          >
            Simplicity is key. I love simplicity.
          </motion.p>

          {/* ── CTAs ── */}
          <motion.div
            variants={enter.ctas as never}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-3"
          >

            {/* "View work" — breaks: top-half upper-left, bottom-half lower-right */}
            <BreakableElement
              isCollapsing={isCollapsing}
              top={{ x: -120, y: -200, rotate: -55, delay: 0.44 }}
              bot={{ x:   60, y:  280, rotate:  28, delay: 0.47 }}
            >
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ink text-paper text-sm font-medium
                           hover:opacity-85 active:scale-[0.98] transition-all duration-200"
              >
                View work
                <ArrowDown size={15} weight="bold" />
              </a>
            </BreakableElement>

            {/* "Enter the Lab" — breaks: top-half upper-right (explosion kick),
                 bottom-half lower-left; this is the piece that caused everything */}
            <div ref={btnWrapRef}>
              <BreakableElement
                isCollapsing={isCollapsing}
                top={{ x:  110, y: -280, rotate:  55, delay: 0.50 }}
                bot={{ x:  -80, y:  320, rotate: -38, delay: 0.53 }}
              >
                <button
                  onClick={handleEnterLab}
                  className="group inline-flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                             border border-frame text-ink bg-paper
                             hover:border-frame-strong hover:bg-surface
                             active:scale-[0.98] transition-all duration-200
                             relative"
                  aria-label="Open the interactive lab"
                >
                  <span className="neon-ring opacity-60" style={{ filter: "blur(5px)" }} aria-hidden />
                  <span className="neon-ring" aria-hidden />
                  Enter the Lab
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-paper text-xs
                               group-hover:translate-x-0.5 group-hover:-translate-y-px transition-transform duration-200"
                    style={{ background: "var(--ink)" }}
                  >
                    <ArrowRight size={11} weight="bold" />
                  </span>
                </button>
              </BreakableElement>
            </div>
          </motion.div>

          {/* ── Social links ── each breaks independently */}
          <motion.div
            variants={enter.social as never}
            initial="hidden"
            animate="visible"
            className="mt-12 flex items-center gap-5"
          >
            {/* GitHub — top goes upper-right, bottom falls lower-left */}
            <BreakableElement
              isCollapsing={isCollapsing}
              top={{ x:  90, y: -180, rotate:  42, delay: 0.56 }}
              bot={{ x: -60, y:  240, rotate: -28, delay: 0.59 }}
            >
              <a
                href="https://github.com/eugeniobusta"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors duration-200"
                aria-label="GitHub profile"
              >
                <GithubLogo size={16} weight="bold" />
                GitHub
              </a>
            </BreakableElement>

            <span className="text-frame-strong text-xs" aria-hidden>·</span>

            {/* LinkedIn — top goes upper-left, bottom falls lower-right */}
            <BreakableElement
              isCollapsing={isCollapsing}
              top={{ x: -100, y: -200, rotate: -48, delay: 0.62 }}
              bot={{ x:   70, y:  260, rotate:  33, delay: 0.65 }}
            >
              <a
                href="https://linkedin.com/in/eugenio-bustamante-4018522ba"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors duration-200"
                aria-label="LinkedIn profile"
              >
                <LinkedinLogo size={16} weight="bold" />
                LinkedIn
              </a>
            </BreakableElement>
          </motion.div>

        </div>
      </div>

      {/* Scroll chevron */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isCollapsing ? out.chevron : { opacity: 1, y: 0 }}
        transition={isCollapsing ? undefined : { delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted/50"
        aria-hidden
      >
        <motion.div
          animate={isCollapsing ? {} : { y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ArrowDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}
