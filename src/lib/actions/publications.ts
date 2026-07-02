"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { publicationSchema } from "@/lib/validations/publication";
import type { Database } from "@/types/database.types";

type PublicationInsert = Database["public"]["Tables"]["publications"]["Insert"];

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return supabase;
}

function nullifyEmpty(data: Record<string, unknown>): PublicationInsert {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
  ) as PublicationInsert;
}

export async function listPublications() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("publications")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createPublication(input: unknown) {
  const parsed = publicationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase.from("publications").insert(nullifyEmpty(parsed.data));
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/publications");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updatePublication(id: string, input: unknown) {
  const parsed = publicationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("publications")
    .update(nullifyEmpty(parsed.data))
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/publications");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deletePublication(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("publications").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/publications");
  revalidatePath("/");
  return { ok: true as const };
}
