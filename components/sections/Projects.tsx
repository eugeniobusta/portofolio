"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, GithubLogo, Lightbulb } from "@phosphor-icons/react";
import { projects, ideas, statusLabel, statusColor, type Project, type Idea } from "@/data/projects";
import ProjectVisual from "@/components/ui/ProjectVisual";

/* Header slides from left */
const fromLeft = {
  hidden:  { opacity: 0, x: -50, filter: "blur(6px)" },
  visible: { opacity: 1, x: 0,   filter: "blur(0px)",
    transition: { type: "spring" as const, damping: 20, stiffness: 180 } },
};

/* Featured card — slides from left with slight bounce */
const fromLeftCard = {
  hidden:  { opacity: 0, x: -55, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, x: 0, scale: 1,
    transition: { type: "spring" as const, damping: 18, stiffness: 200, delay: i * 0.1 },
  }),
};

/* Right column — slides from right */
const fromRight = {
  hidden:  { opacity: 0, x: 55, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, x: 0, scale: 1,
    transition: { type: "spring" as const, damping: 18, stiffness: 200, delay: i * 0.08 },
  }),
};

/* Bottom row — pops up from below */
const popUp = {
  hidden:  { opacity: 0, y: 50, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, damping: 18, stiffness: 220, delay: i * 0.1 },
  }),
};

function StatusBadge({ status }: { status: Project["status"] }) {
  return <span className={`tag tag-${statusColor[status]}`}>{statusLabel[status]}</span>;
}

function ProjectCard({
  project, index, direction = "up",
}: {
  project: Project;
  index: number;
  direction?: "left" | "right" | "up";
}) {
  const variants = direction === "left" ? fromLeftCard : direction === "right" ? fromRight : popUp;

  return (
    <motion.article
      custom={index}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={[
        "project-card flex flex-col overflow-hidden p-0",
        project.featured ? "md:col-span-2" : "",
      ].join(" ")}
      style={{ borderRadius: 12 }}
    >
      {/* Animated visual preview */}
      <ProjectVisual id={project.id} featured={project.featured} />

      {/* Card content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status={project.status} />
              <span className="text-xs text-muted font-mono">{project.year}</span>
            </div>

            {/* Title — links to GitHub if available */}
            {project.github ? (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif text-xl tracking-[-0.02em] text-ink hover:text-accent transition-colors duration-200 group/title block"
              >
                {project.title}
                <ArrowUpRight size={14} weight="bold" className="inline ml-1 opacity-0 group-hover/title:opacity-100 transition-opacity" />
              </a>
            ) : (
              <h3 className="font-serif text-xl tracking-[-0.02em] text-ink">
                {project.title}
              </h3>
            )}
          </div>
        </div>

        <p className="text-sm text-muted leading-relaxed flex-1 mb-4">
          {project.description}
        </p>

        {/* Tags + action buttons row */}
        <div className="flex items-end justify-between gap-3 mt-auto">
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <span key={tech.name} className={`tag tag-${tech.color}`}>{tech.name}</span>
            ))}
          </div>

          {/* GitHub + Live buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {project.github ? (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-frame text-xs text-muted hover:text-ink hover:border-frame-strong transition-all duration-200"
                aria-label={`${project.title} on GitHub`}
              >
                <GithubLogo size={12} weight="bold" />
                GitHub
              </a>
            ) : (
              <span className="text-[10px] text-muted/40 font-mono italic">private</span>
            )}

            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-ink text-paper text-xs hover:opacity-85 transition-all duration-200"
                aria-label={`${project.title} live site`}
              >
                <ArrowUpRight size={12} weight="bold" />
                Live
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function IdeaCard({ idea, index }: { idea: Idea; index: number }) {
  return (
    <motion.article
      custom={index}
      variants={popUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="rounded-xl p-5 border border-dashed border-frame flex flex-col gap-3 opacity-80 hover:opacity-100 transition-opacity duration-300"
      style={{ background: "var(--surface)" }}
    >
      <div className="flex items-center gap-2">
        <Lightbulb size={14} weight="duotone" className="text-muted" />
        <span className="eyebrow" style={{ fontSize: "0.6rem" }}>Upcoming</span>
      </div>
      <h4 className="font-serif text-base text-ink tracking-[-0.01em]">{idea.title}</h4>
      <p className="text-xs text-muted leading-relaxed">{idea.description}</p>
      <div className="flex flex-wrap gap-1 mt-auto">
        {idea.tags.map((t) => (
          <span key={t} className="tag tag-plain">{t}</span>
        ))}
      </div>
    </motion.article>
  );
}

export default function Projects() {
  const featured = projects.find((p) => p.featured)!;
  const rest      = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="section-pad border-t border-frame">
      <div className="container">

        <motion.div
          variants={fromLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-12"
        >
          <span className="eyebrow mb-4 block">Work</span>
          <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.02em] text-ink">
            Things I've built.
          </h2>
        </motion.div>

        {/* Row 1: Featured (2 cols) + CosmosBusta (1 col) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <ProjectCard project={featured} index={0} direction="left" />
          <ProjectCard project={rest[0]}  index={1} direction="right" />
        </div>

        {/* Row 2: 2×2 grid — more breathing room per card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {rest.slice(1).map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i + 2} direction="up" />
          ))}
        </div>

        <div className="divider mb-10" />

        {/* Ideas lab */}
        <motion.div
          variants={fromLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-8"
        >
          <span className="eyebrow">Ideas Lab</span>
          <p className="mt-3 text-sm text-muted max-w-md">
            Things I want to build. Writing them down keeps me honest.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ideas.map((idea, i) => (
            <IdeaCard key={idea.id} idea={idea} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
