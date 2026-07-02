"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProject } from "@/lib/actions/projects";

export function ProjectRowActions({ id, slug, title }: { id: string; slug: string; title: string }) {
  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/admin/projects/${id}`}
        aria-label={`Edit ${title}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <DeleteButton itemLabel={title} onDelete={() => deleteProject(id, slug)} />
    </div>
  );
}
