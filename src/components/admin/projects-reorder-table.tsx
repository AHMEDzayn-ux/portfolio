"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProjectRowActions } from "@/components/admin/project-row-actions";
import { reorderProjects } from "@/lib/actions/projects";

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: boolean;
};

export function ProjectsReorderTable({ projects }: { projects: ProjectRow[] }) {
  const [rows, setRows] = useState(projects);
  const [pending, startTransition] = useTransition();

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;

    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];

    const previous = rows;
    setRows(next); // optimistic

    startTransition(async () => {
      const result = await reorderProjects(next.map((p) => p.id));
      if (result.ok) {
        toast.success("Order saved.");
      } else {
        setRows(previous); // roll back
        toast.error(result.error ?? "Couldn't save the new order.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border/70">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Order</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((project, index) => (
            <TableRow key={project.id}>
              <TableCell>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || pending}
                    aria-label={`Move ${project.title} up`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === rows.length - 1 || pending}
                    aria-label={`Move ${project.title} down`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
              <TableCell className="font-medium">{project.title}</TableCell>
              <TableCell>
                <Badge variant={project.status === "published" ? "default" : "secondary"}>
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell>{project.featured ? "Yes" : "—"}</TableCell>
              <TableCell className="text-right">
                <ProjectRowActions id={project.id} slug={project.slug} title={project.title} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
