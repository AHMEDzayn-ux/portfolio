"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { educationSchema } from "@/lib/validations/education";
import type { Database } from "@/types/database.types";

type EducationInsert = Database["public"]["Tables"]["education"]["Insert"];

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return supabase;
}

function nullifyEmpty(data: Record<string, unknown>): EducationInsert {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
  ) as EducationInsert;
}

export async function listEducation() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("education")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createEducation(input: unknown) {
  const parsed = educationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase.from("education").insert(nullifyEmpty(parsed.data));
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/education");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateEducation(id: string, input: unknown) {
  const parsed = educationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("education")
    .update(nullifyEmpty(parsed.data))
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/education");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteEducation(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("education").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/education");
  revalidatePath("/");
  return { ok: true as const };
}
