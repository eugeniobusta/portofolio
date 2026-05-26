"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";

/*
 * fadeUp: a reusable animation variant.
 * In Framer Motion, "variants" are named animation states.
 * The parent can stagger children by setting `staggerChildren`.
 */
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 28, stiffness: 200, delay: i * 0.1 },
  }),
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

          {/* Name — Instrument Serif, large and tight */}
          <motion.h1
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-serif text-[clamp(3.5rem,10vw,7rem)] leading-[0.95] tracking-[-0.03em] text-ink mb-6"
          >
            Eugenio
            <br />
            Bustamante.
          </motion.h1>

          {/* Tagline */}
          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-lg text-muted leading-relaxed max-w-md mb-8"
          >
            I build things at the intersection of software and intelligence.
            Currently obsessed with what happens when AI meets real products.
          </motion.p>

          {/* Philosophy quote — the user specifically asked for this */}
          <motion.blockquote
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-10 px-5 py-4 rounded-lg text-sm text-muted italic leading-relaxed"
            style={{ background: "var(--surface)", maxWidth: "38rem" }}
          >
            Since AI can make crazy websites, I just want to represent myself
            in simple ways.
          </motion.blockquote>

          {/* CTAs */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-3"
          >
            {/* Primary CTA — scroll to projects */}
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ink text-paper text-sm font-medium
                         hover:opacity-85 active:scale-[0.98] transition-all duration-200"
            >
              View work
              <ArrowDown size={15} weight="bold" />
            </a>

            {/*
             * Game portal CTA — the special button.
             * Uses the "button-in-button" pattern: arrow is in its own
             * circular container to create internal kinetic tension on hover.
             * A subtle amber ring pulses around it to draw attention.
             */}
            <button
              onClick={onGameOpen}
              className="group inline-flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                         border border-frame text-ink bg-paper
                         hover:border-frame-strong hover:bg-surface
                         active:scale-[0.98] transition-all duration-200
                         relative"
              aria-label="Open the interactive lab"
            >
              {/* Pulsing ambient ring */}
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
            custom={4}
            variants={fadeUp}
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

      {/* Scroll indicator — subtle bouncing chevron */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted/50"
        aria-hidden
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}
