"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { skillSchema } from "@/lib/validations/skill";

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

export async function createSkill(input: unknown) {
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase.from("skills").insert(parsed.data);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/skills");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateSkill(id: string, input: unknown) {
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase.from("skills").update(parsed.data).eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/skills");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteSkill(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/skills");
  revalidatePath("/");
  return { ok: true as const };
}
