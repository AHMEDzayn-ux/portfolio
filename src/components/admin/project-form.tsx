"use client";

import { useState } from "react";
import { useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaUploader } from "@/components/admin/media-uploader";
import { createProject, updateProject } from "@/lib/actions/projects";
import { projectSchema, type ProjectInput } from "@/lib/validations/project";
import type { Database } from "@/types/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export function ProjectForm({ project }: { project?: ProjectRow }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title,
          slug: project.slug,
          description: project.description,
          long_description: project.long_description ?? "",
          tags: project.tags,
          repo_url: project.repo_url ?? "",
          live_url: project.live_url ?? "",
          image_url: project.image_url ?? "",
          media: project.media ?? [],
          hero: project.hero ?? null,
          featured: project.featured,
          sort_order: project.sort_order,
          status: project.status,
        }
      : {
          title: "",
          slug: "",
          description: "",
          long_description: "",
          tags: [],
          repo_url: "",
          live_url: "",
          image_url: "",
          media: [],
          hero: null,
          featured: false,
          sort_order: 0,
          status: "published",
        },
  });

  const descriptionValue = useWatch({ control, name: "description" }) ?? "";
  const tagsValue = useWatch({ control, name: "tags" }) ?? [];

  async function onSubmit(data: ProjectInput) {
    setPending(true);
    const result = project
      ? await updateProject(project.id, data)
      : await createProject(data);
    setPending(false);

    if (result.ok) {
      toast.success(project ? "Project updated." : "Project created.");
      router.push("/admin/projects");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug")} placeholder="my-project" />
          {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Short description</Label>
          <span
            className={`text-xs ${
              descriptionValue.length > 200 ? "text-destructive" : "text-foreground/50"
            }`}
          >
            {descriptionValue.length}/200
          </span>
        </div>
        <Textarea id="description" rows={2} maxLength={200} {...register("description")} />
        <p className="text-xs text-foreground/50">
          Shown on the project card — keep it to one or two short sentences.
        </p>
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="long_description">Long description (project page)</Label>
        <Textarea id="long_description" rows={5} {...register("long_description")} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <span
            className={`text-xs ${
              tagsValue.length > 6 ? "text-destructive" : "text-foreground/50"
            }`}
          >
            {tagsValue.length}/6
          </span>
        </div>
        <Input
          id="tags"
          defaultValue={project?.tags.join(", ") ?? ""}
          onChange={(e) =>
            setValue(
              "tags",
              e.target.value
                .split(",")
                .map((t) => t.trim().slice(0, 24))
                .filter(Boolean),
              { shouldValidate: true }
            )
          }
          placeholder="TypeScript, Next.js"
        />
        <p className="text-xs text-foreground/50">
          Up to 6 tags, 24 characters each — extra tags are hidden on the project card.
        </p>
        {errors.tags && (
          <p className="text-xs text-destructive">
            {Array.isArray(errors.tags) ? errors.tags[0]?.message : errors.tags.message}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="repo_url">Repo URL</Label>
          <Input id="repo_url" {...register("repo_url")} />
          {errors.repo_url && (
            <p className="text-xs text-destructive">{errors.repo_url.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="live_url">Live URL</Label>
          <Input id="live_url" {...register("live_url")} />
          {errors.live_url && (
            <p className="text-xs text-destructive">{errors.live_url.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input id="image_url" {...register("image_url")} />
          {errors.image_url && (
            <p className="text-xs text-destructive">{errors.image_url.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Hero background (photo or video behind the project page header)</Label>
        <Controller
          control={control}
          name="hero"
          render={({ field }) => (
            <MediaUploader
              media={field.value ? [field.value] : []}
              onChange={(items) => field.onChange(items.at(-1) ?? null)}
              maxItems={1}
              addLabel="Upload hero photo / video"
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Media gallery (photos &amp; videos, shown on the project page)</Label>
        <Controller
          control={control}
          name="media"
          render={({ field }) => (
            <MediaUploader media={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="sort_order">Sort order</Label>
          <Input
            id="sort_order"
            type="number"
            {...register("sort_order", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Controller
            control={control}
            name="featured"
            render={({ field }) => (
              <Switch id="featured" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <Label htmlFor="featured">Featured</Label>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {pending ? "Saving…" : project ? "Save changes" : "Create project"}
      </button>
    </form>
  );
}
