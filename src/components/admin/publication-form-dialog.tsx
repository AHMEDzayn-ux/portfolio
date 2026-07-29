"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaUploader } from "@/components/admin/media-uploader";
import { createPublication, updatePublication } from "@/lib/actions/publications";
import { publicationSchema, type PublicationInput } from "@/lib/validations/publication";
import type { ProjectMedia } from "@/lib/data/types";
import type { Database } from "@/types/database.types";

type PublicationRow = Database["public"]["Tables"]["publications"]["Row"];

export function PublicationFormDialog({ entry }: { entry?: PublicationRow }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [media, setMedia] = useState<ProjectMedia[]>(
    entry?.image_url ? [{ url: entry.image_url, type: "image" }] : []
  );
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PublicationInput>({
    resolver: zodResolver(publicationSchema),
    defaultValues: entry
      ? {
          title: entry.title,
          slug: entry.slug,
          authors: entry.authors,
          venue: entry.venue ?? "",
          publication_date: entry.publication_date,
          url: entry.url ?? "",
          description: entry.description ?? "",
          image_url: entry.image_url ?? "",
          sort_order: entry.sort_order,
        }
      : {
          title: "",
          slug: "",
          authors: "",
          venue: "",
          publication_date: "",
          url: "",
          description: "",
          image_url: "",
          sort_order: 0,
        },
  });

  function handleMediaChange(next: ProjectMedia[]) {
    setMedia(next);
    setValue("image_url", next[0]?.url ?? "", { shouldValidate: true });
  }

  async function onSubmit(data: PublicationInput) {
    setPending(true);
    const result = entry
      ? await updatePublication(entry.id, data)
      : await createPublication(data);
    setPending(false);

    if (result.ok) {
      toast.success(entry ? "Publication updated." : "Publication added.");
      setOpen(false);
      if (!entry) {
        reset();
        setMedia([]);
      }
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={
          entry
            ? "flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 transition-colors hover:bg-secondary hover:text-foreground"
            : "flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
        }
      >
        {entry ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {!entry && "Add publication"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit publication" : "Add publication"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...register("slug")} placeholder="my-research-paper" />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="authors">Authors</Label>
            <Input id="authors" placeholder="Jane Doe, John Smith" {...register("authors")} />
            {errors.authors && (
              <p className="text-xs text-destructive">{errors.authors.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue / journal</Label>
              <Input id="venue" {...register("venue")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publication_date">Publication date</Label>
              <Input id="publication_date" type="date" {...register("publication_date")} />
              {errors.publication_date && (
                <p className="text-xs text-destructive">{errors.publication_date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Link</Label>
            <Input id="url" placeholder="https://" {...register("url")} />
            {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Cover image</Label>
            <input type="hidden" {...register("image_url")} />
            <MediaUploader
              media={media}
              onChange={handleMediaChange}
              maxItems={1}
              addLabel="Upload cover image"
            />
            {errors.image_url && (
              <p className="text-xs text-destructive">{errors.image_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <DialogFooter>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-foreground disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
