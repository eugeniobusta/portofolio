"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: "engine",  label: "world engine",     delay: 180  },
  { id: "ground",  label: "terrain · ground", delay: 520  },
  { id: "car",     label: "vehicle physics",  delay: 860  },
  { id: "dogs",    label: "companion units",  delay: 1180 },
  { id: "sign",    label: "sign board",       delay: 1460 },
  { id: "poster",  label: "poster canvas",    delay: 1720 },
  { id: "camera",  label: "camera system",    delay: 1980 },
];

const ALL_DONE_AT  = 2280;
const START_EXIT   = 2900;
const CALL_DONE_AT = 3460;

export function LabLoading({ onDone }: { onDone: () => void }) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [allDone, setAllDone]           = useState(false);
  const [visible, setVisible]           = useState(true);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach(({ id, delay }) => {
      timers.push(setTimeout(() => setCompletedIds(prev => [...prev, id]), delay));
    });

    timers.push(setTimeout(() => setAllDone(true),  ALL_DONE_AT));
    timers.push(setTimeout(() => setVisible(false), START_EXIT));
    timers.push(setTimeout(() => onDone(),          CALL_DONE_AT));

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)", scale: 1.03 }}
          transition={{ duration: 0.56, ease: [0.4, 0, 0.6, 1] }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 100,
            background: "#080808",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          {/* Scanlines */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.011) 3px, rgba(255,255,255,0.011) 4px)",
            pointerEvents: "none",
          }} />

          {/* Ambient glow — top */}
          <div style={{
            position: "absolute",
            top: "-120px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "300px",
            background: "radial-gradient(ellipse at center, rgba(245,158,11,0.055) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Content */}
          <div style={{ width: "min(440px, 88vw)", position: "relative" }}>

            {/* Header row */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "8px",
            }}>
              <span style={{ color: "#d4d4d4", fontSize: "12px", letterSpacing: "0.14em" }}>
                EUGENIO'S LAB
              </span>
              <span style={{ color: "#2e2e2e", fontSize: "10px", letterSpacing: "0.18em" }}>
                v2025.1
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "#1c1c1c", marginBottom: "32px" }} />

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {STEPS.map(({ id, label }) => (
                <Step key={id} label={label} done={completedIds.includes(id)} />
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "#1c1c1c", marginTop: "32px", marginBottom: "24px" }} />

            {/* World online */}
            <div style={{ textAlign: "center" }}>
              <motion.span
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                animate={{
                  opacity: allDone ? 1 : 0,
                  letterSpacing: allDone ? "0.28em" : "0.5em",
                }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  color: "#f59e0b",
                  fontSize: "11px",
                  display: "inline-block",
                }}
              >
                WORLD ONLINE
              </motion.span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Step({ label, done }: { label: string; done: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

      {/* Label */}
      <motion.span
        animate={{ color: done ? "#787878" : "#282828" }}
        transition={{ duration: 0.4 }}
        style={{ fontSize: "12px", width: "168px", flexShrink: 0, letterSpacing: "0.03em" }}
      >
        {label}
      </motion.span>

      {/* Dot leader */}
      <div style={{ flex: 1, height: "1px", background: "#161616" }} />

      {/* Bar track */}
      <div style={{
        width: "80px",
        height: "2px",
        background: "#141414",
        borderRadius: "2px",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: done ? "100%" : "0%" }}
          transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #b45309, #f59e0b)",
            borderRadius: "2px",
            boxShadow: "0 0 6px rgba(245,158,11,0.5)",
          }}
        />
      </div>

      {/* Checkmark */}
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.5 }}
        transition={{ duration: 0.22, delay: done ? 0.32 : 0 }}
        style={{
          color: "#f59e0b",
          fontSize: "10px",
          width: "14px",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        ✓
      </motion.span>
    </div>
  );
}
