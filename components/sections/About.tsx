"use client";

import { motion } from "framer-motion";
import { Brain, Code, Rocket } from "@phosphor-icons/react";

const reveal = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 28, stiffness: 200, delay: i * 0.08 },
  }),
};

const stats = [
  { icon: Code,   value: "4",      label: "projects shipped" },
  { icon: Brain,  value: "∞",      label: "AI rabbit holes"  },
  { icon: Rocket, value: "2025",   label: "cohort"           },
];

export default function About() {
  return (
    <section id="about" className="section-pad border-t border-frame">
      <div className="container">

        {/* Section header */}
        <motion.div
          variants={reveal}
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

        {/* Two-column layout: text left, stats right */}
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
                custom={i + 1}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="text-base text-muted leading-relaxed"
              >
                {text}
              </motion.p>
            ))}

            {/* Divider with a horizontal rule that looks intentional */}
            <div className="divider my-6" />

            {/* The philosophy statement the user asked for, styled as a figure */}
            <motion.figure
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
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

          {/* Stats column */}
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="flex flex-col gap-4 md:sticky md:top-28"
          >
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex items-center gap-4 p-4 rounded-xl border border-frame bg-surface"
              >
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "var(--paper)" }}
                >
                  <Icon size={18} weight="duotone" className="text-muted" />
                </span>
                <div>
                  <div className="font-serif text-2xl leading-none text-ink tracking-tight">
                    {value}
                  </div>
                  <div className="text-xs text-muted mt-0.5">{label}</div>
                </div>
              </div>
            ))}

            {/* Currently learning card */}
            <div
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
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
