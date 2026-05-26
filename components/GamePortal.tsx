"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowLeft, GameController } from "@phosphor-icons/react";

const LabGame = dynamic(() => import("./lab/LabGame"), { ssr: false });

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
      /* Falls from the top, bounces on impact, shakes horizontally */
      variants={{
        hidden: { y: "-100%" },
        visible: {
          y: ["-100%", "0%", "-2.2%", "0.6%", "0%"],
          x: [0, 0, -7, 7, -4, 2, 0],
          transition: {
            y: {
              duration: 0.95,
              times: [0, 0.62, 0.77, 0.89, 1],
              ease: [[0.42, 0, 1, 1], [0, 0, 0.2, 1], "easeOut", "easeOut"] as never,
            },
            x: {
              duration: 0.95,
              times: [0, 0.61, 0.67, 0.74, 0.81, 0.91, 1],
              ease: "easeOut",
            },
          },
        },
        exit: {
          y: "108%",
          transition: { duration: 0.42, ease: [0.42, 0, 1, 1] as never },
        },
      }}
      initial="hidden"
      animate="visible"
      exit="exit"
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
          transition={{ delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
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
          transition={{ delay: 0.78 }}
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

      {/* Game canvas fills the remaining height */}
      <div className="flex-1 relative overflow-hidden">
        <LabGame />
      </div>
    </motion.div>
  );
}
