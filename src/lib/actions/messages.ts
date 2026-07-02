"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return supabase;
}

export async function listMessages() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function setMessageRead(id: string, read: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("contact_messages").update({ read }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true as const };
}
