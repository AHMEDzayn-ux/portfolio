import { ProjectForm } from "@/components/admin/project-form";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">New project</h1>
      <div className="mt-8">
        <ProjectForm />
      </div>
    </div>
  );
}
