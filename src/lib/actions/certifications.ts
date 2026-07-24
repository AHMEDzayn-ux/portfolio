"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { certificationSchema } from "@/lib/validations/certification";
import type { Database } from "@/types/database.types";

type CertificationInsert = Database["public"]["Tables"]["certifications"]["Insert"];

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return supabase;
}

function nullifyEmpty(data: Record<string, unknown>): CertificationInsert {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
  ) as CertificationInsert;
}

export async function listCertifications() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("certifications")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createCertification(input: unknown) {
  const parsed = certificationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase.from("certifications").insert(nullifyEmpty(parsed.data));
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/certifications");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateCertification(id: string, input: unknown) {
  const parsed = certificationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("certifications")
    .update(nullifyEmpty(parsed.data))
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/certifications");
  revalidatePath("/");
  return { ok: true as const };
}

export async function reorderCertifications(orderedIds: string[]) {
  const supabase = await requireAdmin();

  // Normalize sort_order to contiguous indices so the ordering is deterministic
  // and free of ties (all rows default to 0 otherwise).
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("certifications").update({ sort_order: index }).eq("id", id)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return { ok: false as const, error: failed.error.message };
  }

  revalidatePath("/admin/certifications");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteCertification(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("certifications").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/certifications");
  revalidatePath("/");
  return { ok: true as const };
}
