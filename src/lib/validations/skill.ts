import { z } from "zod";
import { SKILL_GROUPS } from "@/lib/skill-groups";

/** One group's worth of skills, as typed into the admin's comma-separated box. */
export const skillGroupSchema = z.object({
  group: z.enum(SKILL_GROUPS),
  names: z
    .array(z.string().trim().min(1).max(80))
    .max(60, "That's more skills than the section can usefully show."),
});

export type SkillGroupInput = z.infer<typeof skillGroupSchema>;

/**
 * Splits the admin's free text into clean names. Commas and newlines both
 * separate, so pasting a list out of a CV works as well as typing one.
 * Duplicates collapse case-insensitively, keeping the first spelling.
 */
export function parseSkillNames(raw: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const part of raw.split(/[,\n]/)) {
    const name = part.trim().replace(/\s+/g, " ");
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}
