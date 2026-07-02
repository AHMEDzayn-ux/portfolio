import { ExperienceFormDialog } from "@/components/admin/experience-form-dialog";
import { ExperienceTable } from "@/components/admin/experience-table";
import { listExperience } from "@/lib/actions/experience";

export default async function AdminExperiencePage() {
  const entries = await listExperience();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Experience</h1>
          <p className="mt-1 text-sm text-foreground/60">{entries.length} total</p>
        </div>
        <ExperienceFormDialog />
      </div>

      <ExperienceTable entries={entries} />
    </div>
  );
}
