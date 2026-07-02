import { SkillFormDialog } from "@/components/admin/skill-form-dialog";
import { SkillsTable } from "@/components/admin/skills-table";
import { listSkills } from "@/lib/actions/skills";

export default async function AdminSkillsPage() {
  const skills = await listSkills();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Skills</h1>
          <p className="mt-1 text-sm text-foreground/60">{skills.length} total</p>
        </div>
        <SkillFormDialog />
      </div>

      <SkillsTable skills={skills} />
    </div>
  );
}
