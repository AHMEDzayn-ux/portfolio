import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();

  if (!project) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Edit project</h1>
      <div className="mt-8">
        <ProjectForm project={project} />
      </div>
    </div>
  );
}
