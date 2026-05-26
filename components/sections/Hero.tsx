"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";

/* Each element enters from a different direction — spring values tuned for bounce */
const heroAnim: Record<number, object> = {
  0: { // Name — slides in from left
    hidden:  { opacity: 0, x: -60, filter: "blur(8px)" },
    visible: { opacity: 1, x: 0,   filter: "blur(0px)",
      transition: { type: "spring" as const, damping: 20, stiffness: 180 } },
  },
  1: { // Tagline — slides from right
    hidden:  { opacity: 0, x: 45, filter: "blur(5px)" },
    visible: { opacity: 1, x: 0,  filter: "blur(0px)",
      transition: { type: "spring" as const, damping: 20, stiffness: 180, delay: 0.08 } },
  },
  2: { // "Simplicity" line — pops from below
    hidden:  { opacity: 0, y: 24, scale: 0.93 },
    visible: { opacity: 1, y: 0,  scale: 1,
      transition: { type: "spring" as const, damping: 18, stiffness: 220, delay: 0.18 } },
  },
  3: { // CTAs — bouncy up
    hidden:  { opacity: 0, y: 36, scale: 0.95 },
    visible: { opacity: 1, y: 0,  scale: 1,
      transition: { type: "spring" as const, damping: 18, stiffness: 220, delay: 0.28 } },
  },
  4: { // Social links — fade up
    hidden:  { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0,
      transition: { type: "spring" as const, damping: 20, stiffness: 200, delay: 0.42 } },
  },
};

interface HeroProps {
  onGameOpen: () => void;
}

export default function Hero({ onGameOpen }: HeroProps) {
  return (
    <section
      className="relative min-h-[100dvh] flex flex-col justify-center"
      aria-label="Introduction"
    >
      <div className="container">
        <div className="max-w-3xl pt-28 pb-16">

          {/* Name — slams in from left */}
          <motion.h1
            variants={heroAnim[0] as never}
            initial="hidden"
            animate="visible"
            className="font-serif text-[clamp(3.5rem,10vw,7rem)] leading-[0.95] tracking-[-0.03em] text-ink mb-6"
          >
            Eugenio
            <br />
            Bustamante.
          </motion.h1>

          {/* Tagline — slides from right */}
          <motion.p
            variants={heroAnim[1] as never}
            initial="hidden"
            animate="visible"
            className="text-lg text-muted leading-relaxed max-w-md mb-3"
          >
            I build things at the intersection of software and intelligence.
            Currently obsessed with what happens when AI meets real products.
          </motion.p>

          {/* Simplicity line — pops in */}
          <motion.p
            variants={heroAnim[2] as never}
            initial="hidden"
            animate="visible"
            className="text-sm text-muted/60 italic font-serif mb-10"
          >
            Simplicity is key. I love simplicity.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={heroAnim[3] as never}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-3"
          >
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ink text-paper text-sm font-medium
                         hover:opacity-85 active:scale-[0.98] transition-all duration-200"
            >
              View work
              <ArrowDown size={15} weight="bold" />
            </a>

            <button
              onClick={onGameOpen}
              className="group inline-flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                         border border-frame text-ink bg-paper
                         hover:border-frame-strong hover:bg-surface
                         active:scale-[0.98] transition-all duration-200
                         relative"
              aria-label="Open the interactive lab"
            >
              <span
                className="absolute inset-0 rounded-lg animate-ping opacity-[0.15] pointer-events-none"
                style={{ background: "var(--accent)" }}
                aria-hidden
              />
              Enter the Lab
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-paper text-xs
                           group-hover:translate-x-0.5 group-hover:-translate-y-px transition-transform duration-200"
                style={{ background: "var(--ink)" }}
              >
                <ArrowRight size={11} weight="bold" />
              </span>
            </button>
          </motion.div>

          {/* Social links */}
          <motion.div
            variants={heroAnim[4] as never}
            initial="hidden"
            animate="visible"
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

      {/* Bouncing scroll chevron */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted/50"
        aria-hidden
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ArrowDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}
