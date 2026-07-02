"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { experienceSchema } from "@/lib/validations/experience";
import type { Database } from "@/types/database.types";

type ExperienceInsert = Database["public"]["Tables"]["experience"]["Insert"];

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return supabase;
}

function nullifyEmpty(data: Record<string, unknown>): ExperienceInsert {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
  ) as ExperienceInsert;
}

export async function listExperience() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("experience")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createExperience(input: unknown) {
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase.from("experience").insert(nullifyEmpty(parsed.data));
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/experience");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateExperience(id: string, input: unknown) {
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("experience")
    .update(nullifyEmpty(parsed.data))
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/experience");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteExperience(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("experience").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/experience");
  revalidatePath("/");
  return { ok: true as const };
}
