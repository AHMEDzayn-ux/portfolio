"use client";

import { DeleteButton } from "@/components/admin/delete-button";
import { CertificationFormDialog } from "@/components/admin/certification-form-dialog";
import { deleteCertification } from "@/lib/actions/certifications";
import type { Database } from "@/types/database.types";

type CertificationRow = Database["public"]["Tables"]["certifications"]["Row"];

export function CertificationTable({ entries }: { entries: CertificationRow[] }) {
  return (
    <div className="mt-8 rounded-2xl border border-border/70">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/70 text-left text-foreground/50">
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Issuer</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-medium">{entry.title}</td>
              <td className="px-4 py-3 text-foreground/70">{entry.issuer ?? "—"}</td>
              <td className="px-4 py-3 text-foreground/70">{entry.date}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <CertificationFormDialog entry={entry} />
                  <DeleteButton
                    itemLabel={entry.title}
                    onDelete={() => deleteCertification(entry.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
