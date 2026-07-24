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

function revalidatePublic(slug?: string) {
  revalidatePath("/");
  if (slug) revalidatePath(`/publications/${slug}`);
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
  if (error) {
    return {
      ok: false as const,
      error: error.code === "23505" ? "That slug is already in use." : error.message,
    };
  }

  revalidatePath("/admin/publications");
  revalidatePublic(parsed.data.slug);
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
  if (error) {
    return {
      ok: false as const,
      error: error.code === "23505" ? "That slug is already in use." : error.message,
    };
  }

  revalidatePath("/admin/publications");
  revalidatePublic(parsed.data.slug);
  return { ok: true as const };
}

export async function reorderPublications(orderedIds: string[]) {
  const supabase = await requireAdmin();

  // Normalize sort_order to contiguous indices so the ordering is deterministic
  // and free of ties (all rows default to 0 otherwise).
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("publications").update({ sort_order: index }).eq("id", id)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return { ok: false as const, error: failed.error.message };
  }

  revalidatePath("/admin/publications");
  revalidatePublic();
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
