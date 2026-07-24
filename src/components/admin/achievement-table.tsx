"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { DeleteButton } from "@/components/admin/delete-button";
import { AchievementFormDialog } from "@/components/admin/achievement-form-dialog";
import { deleteAchievement, reorderAchievements } from "@/lib/actions/achievements";
import type { Database } from "@/types/database.types";

type AchievementRow = Database["public"]["Tables"]["achievements"]["Row"];

export function AchievementTable({ entries }: { entries: AchievementRow[] }) {
  const [rows, setRows] = useState(entries);
  const [pending, startTransition] = useTransition();

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;

    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];

    const previous = rows;
    setRows(next); // optimistic

    startTransition(async () => {
      const result = await reorderAchievements(next.map((r) => r.id));
      if (result.ok) {
        toast.success("Order saved.");
      } else {
        setRows(previous); // roll back
        toast.error(result.error ?? "Couldn't save the new order.");
      }
    });
  }

  return (
    <div className="mt-8 rounded-2xl border border-border/70">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/70 text-left text-foreground/50">
            <th className="w-24 px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Issuer</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry, index) => (
            <tr key={entry.id} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || pending}
                    aria-label={`Move ${entry.title} up`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === rows.length - 1 || pending}
                    aria-label={`Move ${entry.title} down`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </td>
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
