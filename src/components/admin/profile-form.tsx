"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { removeAvatar, updateProfile, uploadAvatar, uploadResume } from "@/lib/actions/profile";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import type { Database } from "@/types/database.types";

type ProfileRow = Database["public"]["Tables"]["profile"]["Row"];

export function ProfileForm({ profile }: { profile: ProfileRow }) {
  const [pending, setPending] = useState(false);
  const [avatarPending, setAvatarPending] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [resumePending, setResumePending] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile.full_name ?? "",
      title: profile.title ?? "",
      short_tagline: profile.short_tagline ?? "",
      bio: profile.bio ?? "",
      email: profile.email ?? "",
      location: profile.location ?? "",
      github_url: profile.github_url ?? "",
      linkedin_url: profile.linkedin_url ?? "",
      telegram_url: profile.telegram_url ?? "",
      twitter_url: profile.twitter_url ?? "",
    },
  });

  async function onSubmit(data: ProfileInput) {
    setPending(true);
    const result = await updateProfile(profile.id, data);
    setPending(false);
    if (result.ok) toast.success("Profile updated.");
    else toast.error(result.error);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    setAvatarPending(true);
    const result = await uploadAvatar(profile.id, formData);
    setAvatarPending(false);
    if (result.ok) toast.success("Photo updated.");
    else toast.error(result.error);
  }

  async function handleRemoveAvatar() {
    if (!confirm("Remove the hero photo?")) return;
    setAvatarRemoving(true);
    const result = await removeAvatar(profile.id);
    setAvatarRemoving(false);
    if (result.ok) toast.success("Photo removed.");
    else toast.error(result.error);
  }

  async function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    setResumePending(true);
    const result = await uploadResume(profile.id, formData);
    setResumePending(false);
    if (result.ok) toast.success("Resume updated.");
    else toast.error(result.error);
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-border/70 p-6">
        <div className="flex-1">
          <p className="text-sm font-medium">Hero photo</p>
          <p className="mt-1 text-xs text-foreground/60">
            {profile.avatar_url ? "Uploaded" : "No photo uploaded yet"}
          </p>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarPending || avatarRemoving}
              className="rounded-full border border-border px-4 py-1.5 text-sm disabled:opacity-60"
            >
              {avatarPending ? "Uploading…" : "Upload photo"}
            </button>
            {profile.avatar_url && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={avatarPending || avatarRemoving}
                className="rounded-full border border-border px-4 py-1.5 text-sm text-destructive disabled:opacity-60"
              >
                {avatarRemoving ? "Removing…" : "Remove photo"}
              </button>
            )}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Resume (PDF)</p>
          <p className="mt-1 text-xs text-foreground/60">
            {profile.resume_url ? "Uploaded" : "No resume uploaded yet"}
          </p>
          <input
            ref={resumeInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleResumeChange}
          />
          <button
            type="button"
            onClick={() => resumeInputRef.current?.click()}
            disabled={resumePending}
            className="mt-3 rounded-full border border-border px-4 py-1.5 text-sm disabled:opacity-60"
          >
            {resumePending ? "Uploading…" : "Upload resume"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} placeholder="Software Developer" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="short_tagline">Hero tagline</Label>
          <Input id="short_tagline" {...register("short_tagline")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={5} {...register("bio")} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input id="github_url" {...register("github_url")} />
            {errors.github_url && (
              <p className="text-xs text-destructive">{errors.github_url.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input id="linkedin_url" {...register("linkedin_url")} />
            {errors.linkedin_url && (
              <p className="text-xs text-destructive">{errors.linkedin_url.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="telegram_url">Telegram URL</Label>
            <Input id="telegram_url" {...register("telegram_url")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter_url">Twitter / X URL</Label>
            <Input id="twitter_url" {...register("twitter_url")} />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
