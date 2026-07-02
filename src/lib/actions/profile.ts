"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validations/profile";
import { nullifyKeys } from "@/lib/validations/shared";

// Nullable columns only — full_name/title/bio/short_tagline are NOT NULL in the
// DB, so they must stay as empty strings rather than being converted to null.
const NULLABLE_PROFILE_KEYS = [
  "email",
  "location",
  "github_url",
  "linkedin_url",
  "telegram_url",
  "twitter_url",
] as const;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return supabase;
}

export async function getProfile() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("profile").select("*").limit(1).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProfile(id: string, input: unknown) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("profile")
    .update(nullifyKeys(parsed.data, NULLABLE_PROFILE_KEYS))
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/profile");
  revalidatePath("/");
  return { ok: true as const };
}

async function uploadFile(bucket: "public-assets" | "resume", file: File) {
  const supabase = await requireAdmin();
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function deleteFile(bucket: "public-assets" | "resume", publicUrl: string) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  const supabase = await requireAdmin();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}

export async function uploadAvatar(id: string, formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false as const, error: "No file provided." };

  try {
    const supabase = await requireAdmin();
    const { data: existing } = await supabase
      .from("profile")
      .select("avatar_url")
      .eq("id", id)
      .single();

    const url = await uploadFile("public-assets", file);
    const { error } = await supabase.from("profile").update({ avatar_url: url }).eq("id", id);
    if (error) throw new Error(error.message);

    if (existing?.avatar_url) await deleteFile("public-assets", existing.avatar_url);
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Upload failed." };
  }

  revalidatePath("/admin/profile");
  revalidatePath("/");
  return { ok: true as const };
}

export async function removeAvatar(id: string) {
  try {
    const supabase = await requireAdmin();
    const { data, error: fetchError } = await supabase
      .from("profile")
      .select("avatar_url")
      .eq("id", id)
      .single();
    if (fetchError) throw new Error(fetchError.message);

    if (data.avatar_url) await deleteFile("public-assets", data.avatar_url);

    const { error } = await supabase.from("profile").update({ avatar_url: null }).eq("id", id);
    if (error) throw new Error(error.message);
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Remove failed." };
  }

  revalidatePath("/admin/profile");
  revalidatePath("/");
  return { ok: true as const };
}

export async function uploadResume(id: string, formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false as const, error: "No file provided." };

  try {
    const url = await uploadFile("resume", file);
    const supabase = await requireAdmin();
    const { error } = await supabase.from("profile").update({ resume_url: url }).eq("id", id);
    if (error) throw new Error(error.message);
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Upload failed." };
  }

  revalidatePath("/admin/profile");
  revalidatePath("/");
  return { ok: true as const };
}
