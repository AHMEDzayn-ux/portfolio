"use client";

import { DeleteButton } from "@/components/admin/delete-button";
import { AchievementFormDialog } from "@/components/admin/achievement-form-dialog";
import { deleteAchievement } from "@/lib/actions/achievements";
import type { Database } from "@/types/database.types";

type AchievementRow = Database["public"]["Tables"]["achievements"]["Row"];

export function AchievementTable({ entries }: { entries: AchievementRow[] }) {
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
                  <AchievementFormDialog entry={entry} />
                  <DeleteButton
                    itemLabel={entry.title}
                    onDelete={() => deleteAchievement(entry.id)}
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
