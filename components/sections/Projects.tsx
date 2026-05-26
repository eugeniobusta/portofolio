"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  GithubLogo,
  Lightbulb,
} from "@phosphor-icons/react";
import {
  projects,
  ideas,
  statusLabel,
  statusColor,
  type Project,
  type Idea,
} from "@/data/projects";

const reveal = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 28, stiffness: 200, delay: i * 0.07 },
  }),
};

function StatusBadge({ status }: { status: Project["status"] }) {
  const color = statusColor[status];
  return (
    <span className={`tag tag-${color}`}>{statusLabel[status]}</span>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.article
      custom={index}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={[
        "project-card flex flex-col",
        project.featured ? "md:col-span-2" : "",
      ].join(" ")}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <StatusBadge status={project.status} />
            <span className="text-xs text-muted font-mono">{project.year}</span>
          </div>
          <h3 className="font-serif text-xl tracking-[-0.02em] text-ink">
            {project.title}
          </h3>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg border border-frame flex items-center justify-center text-muted hover:text-ink hover:border-frame-strong transition-all duration-200"
              aria-label={`${project.title} GitHub`}
            >
              <GithubLogo size={14} weight="bold" />
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg border border-frame flex items-center justify-center text-muted hover:text-ink hover:border-frame-strong transition-all duration-200"
              aria-label={`${project.title} live site`}
            >
              <ArrowUpRight size={14} weight="bold" />
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted leading-relaxed flex-1 mb-5">
        {project.description}
      </p>

      {/* Tech stack tags */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {project.stack.map((tech) => (
          <span key={tech.name} className={`tag tag-${tech.color}`}>
            {tech.name}
          </span>
        ))}
      </div>
    </motion.article>
  );
}

function IdeaCard({ idea, index }: { idea: Idea; index: number }) {
  return (
    <motion.article
      custom={index}
      variants={reveal}
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
      <h4 className="font-serif text-base text-ink tracking-[-0.01em]">
        {idea.title}
      </h4>
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
          variants={reveal}
          custom={0}
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

        {/*
         * Asymmetric bento grid — 3 columns on desktop.
         * Featured card spans 2 columns (gets more visual weight).
         * On mobile: all cards stack in a single column.
         */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <ProjectCard project={featured} index={1} />
          <div className="flex flex-col gap-4">
            {rest.slice(0, 2).map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i + 2} />
            ))}
          </div>
        </div>

        {/* Fourth project — full width on its own row */}
        {rest[2] && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <ProjectCard project={rest[2]} index={5} />
          </div>
        )}

        {/* Divider before ideas */}
        <div className="divider mb-10" />

        {/* Upcoming ideas */}
        <motion.div
          variants={reveal}
          custom={0}
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
