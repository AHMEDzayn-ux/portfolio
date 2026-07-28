"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolveSkillGroup } from "@/lib/skill-groups";
import { skillGroupSchema } from "@/lib/validations/skill";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return supabase;
}

export async function listSkills() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Replaces one group's skills with exactly the names given, in the order given.
 *
 * Editing a whole group as one comma-separated list is the point — adding five
 * skills used to mean five dialogs. Diffing rather than delete-then-reinsert
 * keeps ids (and each row's level) stable for names that survive the edit, and
 * a name already filed under another group is *moved* here rather than
 * duplicated, so moving one between groups works by retyping it.
 */
export async function saveSkillGroup(input: unknown) {
  const parsed = skillGroupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const { group, names } = parsed.data;

  const supabase = await requireAdmin();
  const { data: all, error: readError } = await supabase.from("skills").select("*");
  if (readError) return { ok: false as const, error: readError.message };

  const rows = all ?? [];
  const byName = new Map(rows.map((row) => [row.name.toLowerCase(), row]));
  const wanted = new Set(names.map((name) => name.toLowerCase()));

  // Rows currently rendering in this group but no longer listed. Uses the same
  // resolver the public page does, so a legacy row the site *shows* here is
  // also the row this editor removes — no invisible leftovers.
  const removed = rows.filter(
    (row) =>
      resolveSkillGroup(row.name, row.category) === group &&
      !wanted.has(row.name.toLowerCase())
  );

  const inserts: { name: string; category: typeof group; sort_order: number }[] = [];
  const updates: { id: string; sort_order: number; category?: typeof group }[] = [];

  names.forEach((name, index) => {
    const existing = byName.get(name.toLowerCase());
    if (existing) {
      updates.push({
        id: existing.id,
        sort_order: index,
        ...(existing.category === group ? {} : { category: group }),
      });
    } else {
      inserts.push({ name, category: group, sort_order: index });
    }
  });

  if (removed.length > 0) {
    const { error } = await supabase
      .from("skills")
      .delete()
      .in(
        "id",
        removed.map((row) => row.id)
      );
    if (error) return { ok: false as const, error: error.message };
  }

  for (const update of updates) {
    const { id, ...fields } = update;
    const { error } = await supabase.from("skills").update(fields).eq("id", id);
    if (error) return { ok: false as const, error: describeError(error.message) };
  }

  if (inserts.length > 0) {
    const { error } = await supabase.from("skills").insert(inserts);
    if (error) return { ok: false as const, error: describeError(error.message) };
  }

  revalidatePath("/admin/skills");
  revalidatePath("/");
  return { ok: true as const };
}

/** The widened category check ships as migration 0009; until it's applied,
 * Postgres rejects the new group names with a message that explains nothing. */
function describeError(message: string) {
  return message.includes("skills_category_check")
    ? `${message} — run supabase/migrations/0009_skill_groups.sql on your database first.`
    : message;
}
