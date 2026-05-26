"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, GameController, Wrench } from "@phosphor-icons/react";

interface GamePortalProps {
  onClose: () => void;
}

export default function GamePortal({ onClose }: GamePortalProps) {
  /*
   * Lock body scroll while the portal is open.
   * The cleanup function (return) restores scroll when the portal closes.
   */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* Close on Escape key — accessibility requirement */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      /*
       * This is the slide-in animation.
       *
       * initial:  where the panel starts (off-screen right)
       * animate:  where it goes (fully visible)
       * exit:     where it goes when removed (back off-screen right)
       *
       * type: "spring" means Framer Motion uses physics simulation.
       * damping: resistance (higher = less bounce)
       * stiffness: spring tension (higher = faster snap)
       */
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{
        type: "spring",
        damping: 32,
        stiffness: 280,
        mass: 1,
      }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "oklch(12% 0.008 250)" }}
      role="dialog"
      aria-modal="true"
      aria-label="The Lab — interactive section"
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: "oklch(24% 0.008 250)" }}
      >
        {/* Back button */}
        <motion.button
          onClick={onClose}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="group inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
          style={{ color: "oklch(62% 0.005 85)" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "oklch(93% 0.005 85)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "oklch(62% 0.005 85)"}
          aria-label="Return to portfolio"
        >
          <ArrowLeft
            size={15}
            weight="bold"
            className="group-hover:-translate-x-0.5 transition-transform duration-200"
          />
          Back to portfolio
        </motion.button>

        {/* Lab logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2"
        >
          <GameController size={16} weight="duotone" style={{ color: "var(--accent)" }} />
          <span
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: "oklch(62% 0.005 85)" }}
          >
            The Lab
          </span>
        </motion.div>
      </div>

      {/* Content area — placeholder until the game is built */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 text-center">

        {/* Animated icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, type: "spring", damping: 20, stiffness: 200 }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "oklch(16% 0.008 250)", border: "1px solid oklch(24% 0.008 250)" }}
          >
            <Wrench size={36} weight="duotone" style={{ color: "var(--accent)" }} />
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-sm"
        >
          <h2
            className="font-serif text-3xl tracking-[-0.02em] mb-3"
            style={{ color: "oklch(93% 0.005 85)" }}
          >
            Under construction.
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "oklch(52% 0.006 250)" }}
          >
            Something interactive is being built here. Check back soon — or get
            in touch if you want to help build it.
          </p>
        </motion.div>

        {/* Subtle ambient glow behind the icon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute pointer-events-none"
          style={{
            width: "30rem",
            height: "30rem",
            borderRadius: "50%",
            background: "radial-gradient(circle, oklch(72% 0.155 68 / 0.04) 0%, transparent 70%)",
            zIndex: -1,
          }}
          aria-hidden
        />

        {/* Keyboard shortcut hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ color: "oklch(35% 0.005 250)" }}
          className="text-xs font-mono absolute bottom-8"
        >
          Press{" "}
          <kbd
            className="px-1.5 py-0.5 rounded text-xs"
            style={{
              background: "oklch(16% 0.008 250)",
              border: "1px solid oklch(28% 0.008 250)",
              color: "oklch(52% 0.006 250)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Esc
          </kbd>{" "}
          to return
        </motion.p>
      </div>
    </motion.div>
  );
}
