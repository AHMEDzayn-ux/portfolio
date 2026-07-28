import { SkillsGroupEditor } from "@/components/admin/skills-group-editor";
import { listSkills } from "@/lib/actions/skills";

export default async function AdminSkillsPage() {
  const skills = await listSkills();

  return (
    <div>
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Skills</h1>
        <p className="mt-1 text-sm text-foreground/60">
          {skills.length} total — edit a group as one comma-separated list. These
          are the same groups the public section renders.
        </p>
      </div>

      <SkillsGroupEditor skills={skills} />
    </div>
  );
}
