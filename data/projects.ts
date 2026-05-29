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
      "A React Native app for founders and investors to find each other. Swipe through profiles, chat in real time, get matched based on what you're actually building.",
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
      "3D solar system you can actually fly around in. Built with React Three Fiber and real NASA orbital data. Zoom in on any planet and read what it's made of.",
    stack: [
      { name: "Next.js", color: "plain" },
      { name: "React Three Fiber", color: "blue" },
      { name: "Three.js", color: "blue" },
      { name: "TypeScript", color: "blue" },
    ],
    github: "https://github.com/eugeniobusta/cosmosbusta",
    live: null,
    status: "dev",
    year: "2025",
    visual: "cosmosbusta",
  },
  {
    id: "voice-calendar",
    title: "VoiceCalendar",
    description:
      "Talk to your calendar. Say what you want to schedule, it transcribes it with Whisper, pulls out the details with Groq, and adds the event to Google Calendar. Works from the web, CLI, or Telegram.",
    stack: [
      { name: "Python", color: "green" },
      { name: "Flask", color: "green" },
      { name: "Groq", color: "amber" },
      { name: "Whisper", color: "amber" },
      { name: "Google API", color: "red" },
    ],
    github: "https://github.com/eugeniobusta/voice-calendar-ai",
    live: "https://voice-calendar-ai.onrender.com/",
    status: "complete",
    year: "2025",
    visual: "voice",
  },
  {
    id: "startup-match",
    title: "StartupMatch",
    description:
      "Live video matchmaking for startups. You queue up, get paired with someone relevant, jump on a video call. Built with Daily.co for the video rooms and Supabase for the backend.",
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
      "Website for DCU's social tennis club. Session listings, gallery, announcements. The committee can update everything through Sanity CMS without touching code.",
    stack: [
      { name: "React", color: "blue" },
      { name: "Vite", color: "amber" },
      { name: "Sanity CMS", color: "red" },
      { name: "JavaScript", color: "amber" },
    ],
    github: "https://github.com/eugeniobusta/dcu-tennis-website",
    live: "https://dcu-tennis-website.vercel.app/",
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
      "Run the same prompt through a few different models at once, compare the outputs, and track which model does better at what over time.",
    tags: ["Python", "Next.js", "Claude API"],
  },
  {
    id: "pr-critic",
    title: "PRCritic",
    description:
      "A GitHub App that leaves inline comments on your PRs like an actual reviewer would. Points out issues, asks questions, flags anything that looks wrong.",
    tags: ["Node.js", "GitHub API", "Claude"],
  },
  {
    id: "local-voice",
    title: "Local Voice Dev",
    description:
      "A coding assistant you talk to. It knows what file you have open and answers questions about it. Runs completely offline.",
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
