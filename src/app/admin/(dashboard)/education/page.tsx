import { EducationFormDialog } from "@/components/admin/education-form-dialog";
import { EducationTable } from "@/components/admin/education-table";
import { listEducation } from "@/lib/actions/education";

export default async function AdminEducationPage() {
  const entries = await listEducation();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Education</h1>
          <p className="mt-1 text-sm text-foreground/60">{entries.length} total</p>
        </div>
        <EducationFormDialog />
      </div>

      <EducationTable entries={entries} />
    </div>
  );
}
