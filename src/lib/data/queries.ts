import { createStaticClient } from "@/lib/supabase/static";
import { placeholderProfile } from "@/lib/data/placeholder";
import type { Profile } from "@/lib/data/types";

// These all read public, RLS-gated content with the anon key. Using the
// cookie-free static client (instead of the request-scoped cookie client)
// keeps them out of Next's dynamic-rendering path, so the pages that use them
// — the homepage, root layout, detail routes — prerender to static HTML and
// serve with a near-zero TTFB. Freshness is handled on-demand: every admin
// mutation already calls revalidatePath("/") (and the relevant detail path),
// so edits go live immediately without paying a per-request Supabase roundtrip.

export async function getProfile(): Promise<Profile> {
  const supabase = createStaticClient();
  const { data } = await supabase.from("profile").select("*").limit(1).single();
  return data ?? placeholderProfile;
}

export async function getPublishedProjects() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return data ?? [];
}

/** @deprecated Kept as an alias — getPublishedProjects is now build-time safe too. */
export const getPublishedProjectsStatic = getPublishedProjects;

export async function getProjectBySlug(slug: string) {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data;
}

export async function getSkills() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getExperience() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("experience")
    .select("*")
    .order("start_date", { ascending: false });
  return data ?? [];
}

export async function getEducation() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("education")
    .select("*")
    .order("start_date", { ascending: false });
  return data ?? [];
}

export async function getPublications() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("publications")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("publication_date", { ascending: false });
  return data ?? [];
}

/** @deprecated Kept as an alias — getPublications is now build-time safe too. */
export const getPublicationsStatic = getPublications;

export async function getPublicationBySlug(slug: string) {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("publications")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getAchievements() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("achievements")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("date", { ascending: false });
  return data ?? [];
}

export async function getCertifications() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("certifications")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("date", { ascending: false });
  return data ?? [];
}
