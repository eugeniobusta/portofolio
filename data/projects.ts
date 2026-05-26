/*
 * Single source of truth for portfolio content.
 * Edit here — nothing else needs to change.
 *
 * `status`:  "live" | "dev" | "complete" | "idea"
 * `tagColor`: controls which pastel tag style is applied
 */

export type TagColor = "amber" | "blue" | "green" | "red" | "plain";

export interface Project {
  id: string;
  title: string;
  description: string;
  stack: { name: string; color: TagColor }[];
  github: string | null;
  live: string | null;
  status: "live" | "dev" | "complete";
  year: string;
  featured?: boolean;
  visual: "pitch" | "cosmosbusta" | "voice" | "startup" | "tennis";
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    id: "pitch",
    title: "Pitch",
    description:
      "A React Native networking app for early-stage founders and investors. Swipe-based discovery, real-time messaging, and AI-powered match scoring that ranks connections by strategic fit.",
    stack: [
      { name: "React Native", color: "blue" },
      { name: "Expo", color: "blue" },
      { name: "Supabase", color: "green" },
      { name: "Zustand", color: "amber" },
      { name: "TypeScript", color: "blue" },
    ],
    github: null,
    live: null,
    status: "dev",
    year: "2025",
    featured: true,
    visual: "pitch",
  },
  {
    id: "cosmosbusta",
    title: "CosmosBusta",
    description:
      "Interactive 3D solar system in the browser. Built with React Three Fiber and real NASA orbital data. Zoom to any planet, read its properties, watch it orbit in real time.",
    stack: [
      { name: "Next.js", color: "plain" },
      { name: "React Three Fiber", color: "blue" },
      { name: "Three.js", color: "blue" },
      { name: "TypeScript", color: "blue" },
    ],
    github: null,
    live: null,
    status: "dev",
    year: "2025",
    visual: "cosmosbusta",
  },
  {
    id: "voice-calendar",
    title: "VoiceCalendar AI",
    description:
      "Talk to your calendar. Transcribes speech with Whisper, extracts structured event data with Groq, then writes directly to Google Calendar. Available via web, CLI, and Telegram.",
    stack: [
      { name: "Python", color: "green" },
      { name: "Flask", color: "green" },
      { name: "Groq", color: "amber" },
      { name: "Whisper", color: "amber" },
      { name: "Google API", color: "red" },
    ],
    github: null,
    live: null,
    status: "complete",
    year: "2025",
    visual: "voice",
  },
  {
    id: "startup-match",
    title: "StartupMatch",
    description:
      "AI-powered live video matchmaking for startups. Queue-based pairing algorithm, Daily.co embedded video rooms, and a Supabase backend that tracks every connection made.",
    stack: [
      { name: "Next.js", color: "plain" },
      { name: "Supabase", color: "green" },
      { name: "Daily.co", color: "blue" },
      { name: "TypeScript", color: "blue" },
    ],
    github: null,
    live: null,
    status: "dev",
    year: "2025",
    visual: "startup",
  },
  {
    id: "social-tennis",
    title: "Social Tennis",
    description:
      "Marketing and community website for DCU's social tennis club. Built with Sanity CMS for content updates, session listings, gallery, and announcements — all manageable by the committee without code.",
    stack: [
      { name: "React", color: "blue" },
      { name: "Vite", color: "amber" },
      { name: "Sanity CMS", color: "red" },
      { name: "JavaScript", color: "amber" },
    ],
    github: null,
    live: null,
    status: "complete",
    year: "2025",
    visual: "tennis",
  },
];

export const ideas: Idea[] = [
  {
    id: "llm-arena",
    title: "LLM Arena",
    description:
      "Run the same prompt through multiple LLMs simultaneously, score responses with a judge model, and visualize quality drift over time.",
    tags: ["Python", "Next.js", "Claude API"],
  },
  {
    id: "codereview-ai",
    title: "CodeReview AI",
    description:
      "A GitHub App that reviews PRs like a senior engineer — with inline comments, architectural feedback, and a severity score per diff.",
    tags: ["Node.js", "GitHub API", "Claude"],
  },
  {
    id: "local-voice",
    title: "Local Voice Dev",
    description:
      "Voice-activated coding assistant that reads your editor buffer and answers questions about the current file, running fully offline.",
    tags: ["Rust", "Whisper.cpp", "Ollama"],
  },
];

export const skills = [
  {
    category: "Languages",
    color: "blue" as TagColor,
    items: ["Python", "TypeScript", "JavaScript", "SQL", "Bash"],
  },
  {
    category: "Frameworks",
    color: "green" as TagColor,
    items: ["Next.js", "React", "React Native", "Expo", "Flask"],
  },
  {
    category: "AI / ML",
    color: "amber" as TagColor,
    items: ["Groq", "Whisper", "OpenRouter", "Claude API", "Supabase Vectors"],
  },
  {
    category: "Databases",
    color: "plain" as TagColor,
    items: ["PostgreSQL", "SQLite", "Supabase"],
  },
  {
    category: "Tools",
    color: "plain" as TagColor,
    items: ["Git", "Docker", "Vercel", "GitHub Actions", "Daily.co"],
  },
];

export const statusLabel: Record<Project["status"], string> = {
  live: "Live",
  dev: "In development",
  complete: "Complete",
};

export const statusColor: Record<Project["status"], TagColor> = {
  live: "green",
  dev: "amber",
  complete: "blue",
};
