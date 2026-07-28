"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { saveSkillGroup } from "@/lib/actions/skills";
import { parseSkillNames } from "@/lib/validations/skill";
import {
  SKILL_GROUPS,
  SKILL_GROUP_LABELS,
  resolveSkillGroup,
  type SkillGroup,
} from "@/lib/skill-groups";
import type { Database } from "@/types/database.types";

type SkillRow = Database["public"]["Tables"]["skills"]["Row"];

/**
 * Skills are edited one group at a time, as a comma-separated list.
 *
 * The old screen was a row-per-skill table with a dialog behind each row:
 * adding five skills meant five dialogs, each with a category dropdown. Since
 * the public section renders each group as a single comma-separated line, the
 * editor now matches it — you type the line you want to see.
 *
 * Each box saves independently, so a mistake in one group can't wipe another.
 */
export function SkillsGroupEditor({ skills }: { skills: SkillRow[] }) {
  const initial = Object.fromEntries(
    SKILL_GROUPS.map((group) => [
      group,
      skills
        .filter((skill) => resolveSkillGroup(skill.name, skill.category) === group)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((skill) => skill.name)
        .join(", "),
    ])
  ) as Record<SkillGroup, string>;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      {SKILL_GROUPS.map((group) => (
        <GroupBox key={group} group={group} initialValue={initial[group]} />
      ))}
    </div>
  );
}

function GroupBox({
  group,
  initialValue,
}: {
  group: SkillGroup;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(initialValue);
  const [pending, setPending] = useState(false);

  const names = parseSkillNames(value);
  const dirty = value !== saved;

  async function onSave() {
    setPending(true);
    const result = await saveSkillGroup({ group, names });
    setPending(false);

    if (result.ok) {
      // Re-render the box from what was actually stored (trimmed, de-duped),
      // so what you see next matches what the public page will show.
      const normalized = names.join(", ");
      setValue(normalized);
      setSaved(normalized);
      toast.success(`${SKILL_GROUP_LABELS[group]} saved.`);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="rounded-2xl border border-border/70 p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-sm font-semibold tracking-tight">
          {SKILL_GROUP_LABELS[group]}
        </h2>
        <span className="text-xs text-foreground/45">
          {names.length} {names.length === 1 ? "skill" : "skills"}
        </span>
      </div>

      <Textarea
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Comma-separated — e.g. PostgreSQL, MySQL, Redis"
        className="mt-3 text-sm"
      />

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-xs text-foreground/45">
          Separate with commas or new lines. Order here is the order on the site.
        </p>
        <button
          type="button"
          onClick={onSave}
          disabled={pending || !dirty}
          className="shrink-0 rounded-full bg-brand px-4 py-2 text-xs font-medium text-brand-foreground transition-opacity disabled:opacity-40"
        >
          {pending ? "Saving…" : dirty ? "Save" : "Saved"}
        </button>
      </div>
    </div>
  );
}
