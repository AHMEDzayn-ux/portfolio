import type { ExperienceEntry, Profile, Project, Skill } from "./types";

// Placeholder content used before Supabase is wired up (Phase 3 of the build).
// Shapes match the real database rows so swapping to live data is a drop-in change.

export const placeholderProfile: Profile = {
  full_name: "Ahmedh M.R.R",
  title: "Software Developer",
  short_tagline: "I build web apps and systems that hold up under real-world pressure.",
  bio: "I'm a software developer who likes turning messy, real-world problems — disaster response, logistics, bookings — into software that actually gets used. Comfortable across the stack, from React front ends to the data and AI systems behind them.",
  avatar_url: null,
  resume_url: null,
  email: "ruzainiahmedh0706@gmail.com",
  github_url: "https://github.com/AHMEDzayn-ux",
  linkedin_url: null,
  telegram_url: null,
  twitter_url: null,
  location: null,
};

export const placeholderProjects: Project[] = [
  {
    id: "1",
    title: "Disaster Management",
    slug: "disaster-management",
    description: "A system for coordinating and tracking disaster response efforts.",
    long_description: null,
    tags: ["JavaScript"],
    repo_url: "https://github.com/AHMEDzayn-ux/Disaster-management",
    live_url: null,
    image_url: null,
    media: [],
    hero: null,
    featured: true,
  },
  {
    id: "2",
    title: "Flood Report",
    slug: "flood-report",
    description: "A tool for reporting and tracking flood incidents in real time.",
    long_description: null,
    tags: ["TypeScript"],
    repo_url: "https://github.com/AHMEDzayn-ux/test",
    live_url: null,
    image_url: null,
    media: [],
    hero: null,
    featured: true,
  },
  {
    id: "3",
    title: "Ceylon Cab Tours",
    slug: "ceylon-cab-tours",
    description: "A cab booking and tour service platform.",
    long_description: null,
    tags: ["TypeScript"],
    repo_url: "https://github.com/AHMEDzayn-ux/ceyloncabtours",
    live_url: null,
    image_url: null,
    media: [],
    hero: null,
    featured: true,
  },
  {
    id: "4",
    title: "Court Booker",
    slug: "court-booker",
    description: "A booking system for reserving sports courts.",
    long_description: null,
    tags: ["JavaScript"],
    repo_url: "https://github.com/AHMEDzayn-ux/courtBooker",
    live_url: null,
    image_url: null,
    media: [],
    hero: null,
    featured: false,
  },
  {
    id: "5",
    title: "RAG System",
    slug: "rag-system",
    description: "A Retrieval-Augmented Generation system built in Python.",
    long_description: null,
    tags: ["Python"],
    repo_url: "https://github.com/AHMEDzayn-ux/RAG-new",
    live_url: null,
    image_url: null,
    media: [],
    hero: null,
    featured: false,
  },
];

export const placeholderSkills: Skill[] = [
  { id: "1", name: "TypeScript", category: "engineering", level: 85 },
  { id: "2", name: "JavaScript", category: "engineering", level: 90 },
  { id: "3", name: "React / Next.js", category: "engineering", level: 85 },
  { id: "4", name: "Python", category: "engineering", level: 75 },
  { id: "5", name: "Node.js", category: "engineering", level: 80 },
  { id: "6", name: "Supabase / Postgres", category: "engineering", level: 75 },
  { id: "7", name: "UI/UX Design", category: "design", level: 70 },
  { id: "8", name: "Figma", category: "design", level: 65 },
  { id: "9", name: "Git", category: "tools", level: 85 },
  { id: "10", name: "Vercel", category: "tools", level: 80 },
];

export const placeholderExperience: ExperienceEntry[] = [
  {
    id: "1",
    org: "Freelance / Independent Projects",
    role: "Software Developer",
    description:
      "Designed and built full-stack web applications including disaster-response tooling, booking platforms, and AI-backed systems.",
    start_date: "2023-01-01",
    end_date: null,
    type: "work",
    location: null,
  },
];
