import { CertificationFormDialog } from "@/components/admin/certification-form-dialog";
import { CertificationTable } from "@/components/admin/certification-table";
import { listCertifications } from "@/lib/actions/certifications";

export default async function AdminCertificationsPage() {
  const entries = await listCertifications();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Certifications</h1>
          <p className="mt-1 text-sm text-foreground/60">{entries.length} total</p>
        </div>
        <CertificationFormDialog />
      </div>

      <CertificationTable entries={entries} />
    </div>
  );
}
