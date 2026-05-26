"use client";

import { motion } from "framer-motion";
import { skills } from "@/data/projects";

/* Header blasts in from right */
const fromRight = {
  hidden:  { opacity: 0, x: 70, filter: "blur(8px)" },
  visible: { opacity: 1, x: 0,  filter: "blur(0px)",
    transition: { type: "spring" as const, damping: 12, stiffness: 180 } },
};

/* Rows slide from left with hard bounce */
const rowSlide = {
  hidden:  { opacity: 0, x: -55, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, x: 0, filter: "blur(0px)",
    transition: { type: "spring" as const, damping: 10, stiffness: 240, delay: i * 0.07 },
  }),
};

/* Tags pop in like bubbles — very bouncy */
const tagPop = {
  hidden:  { opacity: 0, scale: 0.5, y: 10 },
  visible: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring" as const, damping: 7, stiffness: 450, delay: i * 0.04 },
  }),
};

export default function Skills() {
  return (
    <section id="skills" className="section-pad border-t border-frame">
      <div className="container">

        <motion.div
          variants={fromRight}
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

        <div className="divide-y divide-frame">
          {skills.map((group, i) => (
            <motion.div
              key={group.category}
              custom={i}
              variants={rowSlide}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              className="flex flex-col sm:flex-row sm:items-center gap-3 py-5"
            >
              <div className="w-32 shrink-0">
                <span className="text-xs font-medium text-muted uppercase tracking-widest">
                  {group.category}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item, j) => (
                  <motion.span
                    key={item}
                    custom={j}
                    variants={tagPop}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-20px" }}
                    className={`tag tag-${group.color}`}
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ type: "spring", damping: 10, stiffness: 260, delay: 0.3 }}
          className="mt-8 text-xs text-muted font-mono"
        >
          + whatever is needed. I pick up tools fast.
        </motion.p>
      </div>
    </section>
  );
}
