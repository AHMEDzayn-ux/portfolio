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
import { createAchievement, updateAchievement } from "@/lib/actions/achievements";
import { achievementSchema, type AchievementInput } from "@/lib/validations/achievement";
import type { Database } from "@/types/database.types";

type AchievementRow = Database["public"]["Tables"]["achievements"]["Row"];

export function AchievementFormDialog({ entry }: { entry?: AchievementRow }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AchievementInput>({
    resolver: zodResolver(achievementSchema),
    defaultValues: entry
      ? {
          title: entry.title,
          issuer: entry.issuer ?? "",
          description: entry.description ?? "",
          url: entry.url ?? "",
          date: entry.date,
          sort_order: entry.sort_order,
        }
      : {
          title: "",
          issuer: "",
          description: "",
          url: "",
          date: "",
          sort_order: 0,
        },
  });

  async function onSubmit(data: AchievementInput) {
    setPending(true);
    const result = entry
      ? await updateAchievement(entry.id, data)
      : await createAchievement(data);
    setPending(false);

    if (result.ok) {
      toast.success(entry ? "Achievement updated." : "Achievement added.");
      setOpen(false);
      if (!entry) reset();
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
        {!entry && "Add achievement"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit achievement" : "Add achievement"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer</Label>
              <Input id="issuer" {...register("issuer")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Link</Label>
            <Input id="url" placeholder="https://" {...register("url")} />
            {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              type="number"
              {...register("sort_order", { valueAsNumber: true })}
            />
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
