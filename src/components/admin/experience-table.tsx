"use client";

import { DeleteButton } from "@/components/admin/delete-button";
import { ExperienceFormDialog } from "@/components/admin/experience-form-dialog";
import { deleteExperience } from "@/lib/actions/experience";
import type { Database } from "@/types/database.types";

type ExperienceRow = Database["public"]["Tables"]["experience"]["Row"];

export function ExperienceTable({ entries }: { entries: ExperienceRow[] }) {
  return (
    <div className="mt-8 rounded-2xl border border-border/70">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/70 text-left text-foreground/50">
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Organization</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Dates</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-medium">{entry.role}</td>
              <td className="px-4 py-3 text-foreground/70">{entry.org}</td>
              <td className="px-4 py-3 capitalize text-foreground/70">{entry.type}</td>
              <td className="px-4 py-3 text-foreground/70">
                {entry.start_date} — {entry.end_date ?? "Present"}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <ExperienceFormDialog entry={entry} />
                  <DeleteButton
                    itemLabel={entry.role}
                    onDelete={() => deleteExperience(entry.id)}
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
