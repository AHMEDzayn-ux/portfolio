"use client";

import { DeleteButton } from "@/components/admin/delete-button";
import { SkillFormDialog } from "@/components/admin/skill-form-dialog";
import { deleteSkill } from "@/lib/actions/skills";
import type { Database } from "@/types/database.types";

type SkillRow = Database["public"]["Tables"]["skills"]["Row"];

export function SkillsTable({ skills }: { skills: SkillRow[] }) {
  return (
    <div className="mt-8 rounded-2xl border border-border/70">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/70 text-left text-foreground/50">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Level</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => (
            <tr key={skill.id} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-medium">{skill.name}</td>
              <td className="px-4 py-3 capitalize text-foreground/70">{skill.category}</td>
              <td className="px-4 py-3 text-foreground/70">{skill.level ?? "—"}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <SkillFormDialog skill={skill} />
                  <DeleteButton itemLabel={skill.name} onDelete={() => deleteSkill(skill.id)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
