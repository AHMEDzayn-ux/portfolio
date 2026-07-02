import { PublicationFormDialog } from "@/components/admin/publication-form-dialog";
import { PublicationTable } from "@/components/admin/publication-table";
import { listPublications } from "@/lib/actions/publications";

export default async function AdminPublicationsPage() {
  const entries = await listPublications();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Publications</h1>
          <p className="mt-1 text-sm text-foreground/60">{entries.length} total</p>
        </div>
        <PublicationFormDialog />
      </div>

      <PublicationTable entries={entries} />
    </div>
  );
}
