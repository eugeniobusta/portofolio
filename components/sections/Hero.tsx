"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";

/* ─── PHYSICS HELPERS ───────────────────────────────────────────────────── */

/* Seeded PRNG — deterministic, no re-randomise on re-render */
const rng = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

/* Pre-computed fall params for each of the 18 name characters */
const FALL = Array.from({ length: 25 }, (_, i) => ({
  x:   (rng(i * 7.31)  - 0.5) * 520,   /* ±260 px horizontal drift  */
  rot: (rng(i * 11.73) - 0.5) * 760,   /* ±380 ° rotation           */
  dur: 0.50 + rng(i * 3.17) * 0.40,    /* 0.50 – 0.90 s             */
  del: rng(i * 5.41) * 0.08,           /* up to 80 ms extra jitter  */
}));

/* Gravity easing — hesitates then accelerates, like real freefall */
const GRAV = [0.42, 0, 1, 1] as const;

/* ─── ENTRANCE VARIANTS (unchanged feel) ───────────────────────────────── */

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

/* ─── COLLAPSE TARGETS ──────────────────────────────────────────────────── */
/* Each element flies to a different destination for a chaotic explosion feel */

const out = {
  /* tagline tips and falls hard to the lower-left */
  tagline:    { y: "70vh",   x: -70,  rotate: -9,  opacity: 0,
    transition: { duration: 0.70, delay: 0.40, ease: GRAV } },

  /* "simplicity" floats UP — gravity reversed, adds variety */
  simplicity: { y: "-60vh",  x: 40,   rotate: 5,   opacity: 0,
    transition: { duration: 0.55, delay: 0.28, ease: GRAV } },

  /* buttons fly hard in opposite horizontal directions */
  viewWork:   { x: "-110vw", y: 50,   rotate: -20, opacity: 0,
    transition: { duration: 0.60, delay: 0.46, ease: GRAV } },
  enterLab:   { x:  "110vw", y: -35,  rotate: 18,  opacity: 0,
    transition: { duration: 0.60, delay: 0.50, ease: GRAV } },

  /* social links drop straight down */
  social:     { y: "90vh",            rotate: 4,   opacity: 0,
    transition: { duration: 0.55, delay: 0.58, ease: GRAV } },

  /* scroll chevron disappears instantly */
  chevron:    { y: "50vh",                         opacity: 0,
    transition: { duration: 0.30, delay: 0.05, ease: GRAV } },
};

/* ─── LETTER-BY-LETTER NAME ─────────────────────────────────────────────── */
/*
 * Lines and their starting global-index offsets:
 *   "Eugenio"     → chars 0–6
 *   "Bustamante." → chars 7–17
 */
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
                    : { y: 0,       x: 0,   rotate: 0,      opacity: 1 }
                }
                transition={{
                  duration: f.dur,
                  /* second line starts slightly later for a cascade wave effect */
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

/* ─── COMPONENT ─────────────────────────────────────────────────────────── */

interface HeroProps {
  onGameOpen:   () => void;
  isCollapsing: boolean;
}

export default function Hero({ onGameOpen, isCollapsing }: HeroProps) {
  return (
    <section
      className="relative min-h-[100dvh] flex flex-col justify-center"
      aria-label="Introduction"
    >
      <div className="container">
        <div className="max-w-3xl pt-28 pb-16">

          {/* Name — letter-by-letter fall on collapse */}
          <FallingName isCollapsing={isCollapsing} />

          {/* Tagline */}
          <motion.p
            variants={enter.tagline as never}
            initial="hidden"
            animate={isCollapsing ? out.tagline : "visible"}
            className="text-lg text-muted leading-relaxed max-w-md mb-3"
          >
            I build things at the intersection of software and intelligence.
            Currently obsessed with what happens when AI meets real products.
          </motion.p>

          {/* Simplicity line — floats UP on collapse (against gravity for contrast) */}
          <motion.p
            variants={enter.simplicity as never}
            initial="hidden"
            animate={isCollapsing ? out.simplicity : "visible"}
            className="text-sm text-muted/60 italic font-serif mb-10"
          >
            Simplicity is key. I love simplicity.
          </motion.p>

          {/* CTAs — each button explodes in its own direction */}
          <motion.div
            variants={enter.ctas as never}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-3"
          >
            <motion.a
              href="#projects"
              initial={false}
              animate={isCollapsing ? out.viewWork : { x: 0, y: 0, rotate: 0, opacity: 1 }}
              transition={isCollapsing ? undefined : { duration: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ink text-paper text-sm font-medium
                         hover:opacity-85 active:scale-[0.98] transition-all duration-200"
            >
              View work
              <ArrowDown size={15} weight="bold" />
            </motion.a>

            <motion.button
              onClick={onGameOpen}
              initial={false}
              animate={isCollapsing ? out.enterLab : { x: 0, y: 0, rotate: 0, opacity: 1 }}
              transition={isCollapsing ? undefined : { duration: 0 }}
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
            </motion.button>
          </motion.div>

          {/* Social links */}
          <motion.div
            variants={enter.social as never}
            initial="hidden"
            animate={isCollapsing ? out.social : "visible"}
            className="mt-12 flex items-center gap-5"
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
            <span className="text-frame-strong text-xs" aria-hidden>·</span>
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
