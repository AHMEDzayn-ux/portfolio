"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { achievementSchema } from "@/lib/validations/achievement";
import type { Database } from "@/types/database.types";

type AchievementInsert = Database["public"]["Tables"]["achievements"]["Insert"];

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return supabase;
}

function nullifyEmpty(data: Record<string, unknown>): AchievementInsert {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
  ) as AchievementInsert;
}

export async function listAchievements() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createAchievement(input: unknown) {
  const parsed = achievementSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase.from("achievements").insert(nullifyEmpty(parsed.data));
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/achievements");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateAchievement(id: string, input: unknown) {
  const parsed = achievementSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("achievements")
    .update(nullifyEmpty(parsed.data))
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/achievements");
  revalidatePath("/");
  return { ok: true as const };
}

export async function reorderAchievements(orderedIds: string[]) {
  const supabase = await requireAdmin();

  // Normalize sort_order to contiguous indices so the ordering is deterministic
  // and free of ties (all rows default to 0 otherwise).
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("achievements").update({ sort_order: index }).eq("id", id)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return { ok: false as const, error: failed.error.message };
  }

  revalidatePath("/admin/achievements");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteAchievement(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("achievements").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/achievements");
  revalidatePath("/");
  return { ok: true as const };
}
