"use client";

import { DeleteButton } from "@/components/admin/delete-button";
import { EducationFormDialog } from "@/components/admin/education-form-dialog";
import { deleteEducation } from "@/lib/actions/education";
import type { Database } from "@/types/database.types";

type EducationRow = Database["public"]["Tables"]["education"]["Row"];

export function EducationTable({ entries }: { entries: EducationRow[] }) {
  return (
    <div className="mt-8 rounded-2xl border border-border/70">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/70 text-left text-foreground/50">
            <th className="px-4 py-3 font-medium">Degree</th>
            <th className="px-4 py-3 font-medium">Institution</th>
            <th className="px-4 py-3 font-medium">Dates</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-medium">{entry.degree}</td>
              <td className="px-4 py-3 text-foreground/70">{entry.institution}</td>
              <td className="px-4 py-3 text-foreground/70">
                {entry.start_date} — {entry.end_date ?? "Present"}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <EducationFormDialog entry={entry} />
                  <DeleteButton
                    itemLabel={entry.degree}
                    onDelete={() => deleteEducation(entry.id)}
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
