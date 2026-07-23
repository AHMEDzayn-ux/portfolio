import Link from "next/link";
import { Plus } from "lucide-react";
import { ProjectsReorderTable } from "@/components/admin/projects-reorder-table";
import { listProjects } from "@/lib/actions/projects";

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-foreground/60">
            {projects.length} total · use the arrows to set the order shown on your site
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
        >
          <Plus className="h-4 w-4" />
          New project
        </Link>
      </div>

      <div className="mt-8">
        <ProjectsReorderTable
          projects={projects.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            status: p.status,
            featured: p.featured,
          }))}
        />
      </div>
    </div>
  );
}
