"use client";

import { motion } from "framer-motion";
import { skills } from "@/data/projects";

const reveal = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 28, stiffness: 200, delay: i * 0.06 },
  }),
};

export default function Skills() {
  return (
    <section id="skills" className="section-pad border-t border-frame">
      <div className="container">

        <motion.div
          variants={reveal}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-12"
        >
          <span className="eyebrow mb-4 block">Stack</span>
          <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.02em] text-ink">
            What I work with.
          </h2>
        </motion.div>

        {/*
         * Notion-style property rows.
         * Each row: category label (fixed width) + tag pills.
         * Much more scannable than a tag cloud — no visual hierarchy lost.
         */}
        <div className="divide-y divide-frame">
          {skills.map((group, i) => (
            <motion.div
              key={group.category}
              custom={i + 1}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="flex flex-col sm:flex-row sm:items-center gap-3 py-5"
            >
              {/* Category label — matches Notion's property name style */}
              <div className="w-32 shrink-0">
                <span className="text-xs font-medium text-muted uppercase tracking-widest">
                  {group.category}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <span key={item} className={`tag tag-${group.color}`}>
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          variants={reveal}
          custom={skills.length + 2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-8 text-xs text-muted font-mono"
        >
          + whatever is needed. I pick up tools fast.
        </motion.p>
      </div>
    </section>
  );
}
