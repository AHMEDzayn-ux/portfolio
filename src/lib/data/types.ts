export type Profile = {
  full_name: string;
  title: string;
  bio: string;
  short_tagline: string;
  avatar_url: string | null;
  resume_url: string | null;
  email: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  telegram_url: string | null;
  twitter_url: string | null;
  location: string | null;
};

export type ProjectMedia = {
  url: string;
  type: "image" | "video";
  /** Small (~800px) variant for card thumbnails; falls back to `url`. */
  card_url?: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string | null;
  tags: string[];
  repo_url: string | null;
  live_url: string | null;
  image_url: string | null;
  media: ProjectMedia[];
  hero: ProjectMedia | null;
  featured: boolean;
};

export type Skill = {
  id: string;
  name: string;
  category: "design" | "engineering" | "tools" | "other";
  level: number | null;
};

export type ExperienceEntry = {
  id: string;
  org: string;
  role: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  type: "work" | "education";
  location: string | null;
};

export type EducationEntry = {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string | null;
  grade: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
};

export type Publication = {
  id: string;
  slug: string;
  title: string;
  authors: string;
  venue: string | null;
  publication_date: string;
  url: string | null;
  description: string | null;
};

export type Achievement = {
  id: string;
  title: string;
  issuer: string | null;
  description: string | null;
  url: string | null;
  date: string;
};
