"use client";

import { motion } from "framer-motion";
import { Brain, Code, Rocket } from "@phosphor-icons/react";

/* Header slams from left */
const fromLeft = {
  hidden:  { opacity: 0, x: -70, filter: "blur(8px)" },
  visible: { opacity: 1, x: 0,   filter: "blur(0px)",
    transition: { type: "spring" as const, damping: 12, stiffness: 180 } },
};

/* Paragraphs bounce up hard */
const bounceUp = {
  hidden:  { opacity: 0, y: 60, scale: 0.93 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, damping: 10, stiffness: 260, delay: i * 0.1 },
  }),
};

/* Stats fly in from the right */
const fromRight = {
  hidden:  { opacity: 0, x: 70 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { type: "spring" as const, damping: 10, stiffness: 240, delay: i * 0.12 },
  }),
};

const stats = [
  { icon: Code,   value: "5",    label: "projects shipped" },
  { icon: Brain,  value: "∞",    label: "AI rabbit holes"  },
  { icon: Rocket, value: "2025", label: "cohort"           },
];

export default function About() {
  return (
    <section id="about" className="section-pad border-t border-frame">
      <div className="container">

        <motion.div
          variants={fromLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-12"
        >
          <span className="eyebrow mb-4 block">About</span>
          <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.02em] text-ink max-w-2xl">
            CS student.
            <br />
            <span className="text-muted font-serif">AI obsessive.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-[3fr_2fr] gap-12 lg:gap-20 items-start">

          {/* Text column */}
          <div className="space-y-5">
            {[
              "I'm a Computer Science student with a deep interest in AI systems — not just as tools, but as a design medium. The way large language models reshape how we write software, build products, and communicate ideas is something I think about daily.",
              "My approach is simple: learn by building. Each project I start is an experiment in what's possible when you combine solid engineering with current AI capabilities. I move fast, I ship, I iterate.",
              "I believe the next decade belongs to people who can hold the full stack in their head — from the model weights to the UI pixel. That's the kind of engineer I'm becoming.",
            ].map((text, i) => (
              <motion.p
                key={i}
                custom={i}
                variants={bounceUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="text-base text-muted leading-relaxed"
              >
                {text}
              </motion.p>
            ))}

            <div className="divider my-6" />

            {/* Philosophy quote — pops in with scale */}
            <motion.figure
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ type: "spring", damping: 10, stiffness: 280, delay: 0.2 }}
              className="rounded-xl p-5"
              style={{ background: "var(--surface)" }}
            >
              <blockquote className="font-serif text-lg text-ink italic leading-snug tracking-[-0.01em]">
                "Since AI can make crazy websites, I just want to represent
                myself in simple ways."
              </blockquote>
              <figcaption className="mt-3 text-xs text-muted font-mono">
                — Eugenio Bustamante, on this very portfolio
              </figcaption>
            </motion.figure>
          </div>

          {/* Stats column — each card flies from right */}
          <div className="flex flex-col gap-4 md:sticky md:top-28">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <motion.div
                key={label}
                custom={i}
                variants={fromRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="flex items-center gap-4 p-4 rounded-xl border border-frame bg-surface"
              >
                <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "var(--paper)" }}>
                  <Icon size={18} weight="duotone" className="text-muted" />
                </span>
                <div>
                  <div className="font-serif text-2xl leading-none text-ink tracking-tight">{value}</div>
                  <div className="text-xs text-muted mt-0.5">{label}</div>
                </div>
              </motion.div>
            ))}

            <motion.div
              custom={3}
              variants={fromRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="p-4 rounded-xl border border-frame mt-2"
              style={{ background: "var(--surface)" }}
            >
              <div className="text-xs text-muted uppercase tracking-widest mb-2 font-medium">
                Currently studying
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Transformers", "RL", "Systems Design", "Rust"].map((t) => (
                  <span key={t} className="tag tag-amber">{t}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
