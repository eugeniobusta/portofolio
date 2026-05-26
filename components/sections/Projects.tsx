"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, GithubLogo, Lightbulb } from "@phosphor-icons/react";
import { projects, ideas, statusLabel, statusColor, type Project, type Idea } from "@/data/projects";
import ProjectVisual from "@/components/ui/ProjectVisual";

/* Slide from left — header and featured card */
const fromLeft = {
  hidden:  { opacity: 0, x: -48, filter: "blur(6px)" },
  visible: { opacity: 1, x: 0, filter: "blur(0px)",
    transition: { type: "spring" as const, damping: 22, stiffness: 160 } },
};

/* Slide from left with stagger (for cards) */
const fromLeftCard = {
  hidden:  { opacity: 0, x: -56, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, x: 0, scale: 1,
    transition: { type: "spring" as const, damping: 20, stiffness: 170, delay: i * 0.1 },
  }),
};

/* Pop up from below with spring bounce */
const popUp = {
  hidden:  { opacity: 0, y: 60, scale: 0.94 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, damping: 18, stiffness: 200, delay: i * 0.1 },
  }),
};

/* Slide from right for secondary column */
const fromRight = {
  hidden:  { opacity: 0, x: 48, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1, x: 0, filter: "blur(0px)",
    transition: { type: "spring" as const, damping: 22, stiffness: 160, delay: i * 0.08 },
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
  const Wrapper = project.live ? "a" : project.github ? "a" : "article";
  const linkProps = project.live
    ? { href: project.live, target: "_blank", rel: "noopener noreferrer" }
    : project.github
    ? { href: project.github, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <motion.div
      custom={index}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={project.featured ? "md:col-span-2" : ""}
    >
      <Wrapper
        {...linkProps}
        className="project-card flex flex-col group cursor-default overflow-hidden p-0 block"
        style={{ borderRadius: 12 }}
      >
        {/* Visual preview */}
        <ProjectVisual id={project.id} featured={project.featured} />

        {/* Card content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <StatusBadge status={project.status} />
                <span className="text-xs text-muted font-mono">{project.year}</span>
              </div>
              <h3 className="font-serif text-xl tracking-[-0.02em] text-ink group-hover:text-accent transition-colors duration-200">
                {project.title}
              </h3>
            </div>

            {/* Action icons */}
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg border border-frame flex items-center justify-center text-muted hover:text-ink hover:border-frame-strong transition-all duration-200"
                  aria-label={`${project.title} GitHub`}>
                  <GithubLogo size={14} weight="bold" />
                </a>
              )}
              {project.live && (
                <a href={project.live} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg border border-frame flex items-center justify-center text-muted hover:text-ink hover:border-frame-strong transition-all duration-200"
                  aria-label={`${project.title} live site`}>
                  <ArrowUpRight size={14} weight="bold" />
                </a>
              )}
              {!project.github && !project.live && (
                <div className="w-8 h-8 rounded-lg border border-frame flex items-center justify-center text-muted/40"
                  title="Private / in development">
                  <ArrowUpRight size={14} weight="bold" />
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-muted leading-relaxed flex-1 mb-4">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-auto">
            {project.stack.map((tech) => (
              <span key={tech.name} className={`tag tag-${tech.color}`}>{tech.name}</span>
            ))}
          </div>
        </div>
      </Wrapper>
    </motion.div>
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

        {/* Header */}
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

        {/*
         * Row 1: Featured (spans 2 cols) + CosmosBusta (1 col)
         * Row 2: 3 equal cards (VoiceCalendar, StartupMatch, SocialTennis)
         */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <ProjectCard project={featured} index={0} direction="left" />
          <ProjectCard project={rest[0]} index={1} direction="right" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
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
