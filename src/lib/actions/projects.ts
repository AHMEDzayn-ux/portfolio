"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validations/project";
import { nullifyKeys } from "@/lib/validations/shared";
import type { Database } from "@/types/database.types";

type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];

// Nullable columns only — title/slug/description are NOT NULL in the DB.
const NULLABLE_PROJECT_KEYS = [
  "long_description",
  "repo_url",
  "live_url",
  "image_url",
] as const;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return supabase;
}

function nullifyEmpty(data: Record<string, unknown>): ProjectInsert {
  return nullifyKeys(data, NULLABLE_PROJECT_KEYS) as ProjectInsert;
}

function revalidatePublic(slug?: string) {
  revalidatePath("/");
  if (slug) revalidatePath(`/projects/${slug}`);
}

export async function listProjects() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createProject(input: unknown) {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase.from("projects").insert(nullifyEmpty(parsed.data));

  if (error) {
    return {
      ok: false as const,
      error: error.code === "23505" ? "That slug is already in use." : error.message,
    };
  }

  revalidatePath("/admin/projects");
  revalidatePublic(parsed.data.slug);
  return { ok: true as const };
}

export async function updateProject(id: string, input: unknown) {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("projects")
    .update(nullifyEmpty(parsed.data))
    .eq("id", id);

  if (error) {
    return {
      ok: false as const,
      error: error.code === "23505" ? "That slug is already in use." : error.message,
    };
  }

  revalidatePath("/admin/projects");
  revalidatePublic(parsed.data.slug);
  return { ok: true as const };
}

export async function reorderProjects(orderedIds: string[]) {
  const supabase = await requireAdmin();

  // Normalize sort_order to contiguous indices so the ordering is deterministic
  // and free of ties (all rows default to 0 otherwise).
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("projects").update({ sort_order: index }).eq("id", id)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return { ok: false as const, error: failed.error.message };
  }

  revalidatePath("/admin/projects");
  revalidatePublic();
  return { ok: true as const };
}

export async function deleteProject(id: string, slug: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/admin/projects");
  revalidatePublic(slug);
  return { ok: true as const };
}
