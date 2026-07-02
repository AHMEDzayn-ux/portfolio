import { z } from "zod";

export const skillSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  category: z.enum(["engineering", "design", "tools", "other"]),
  level: z.number().int().min(0).max(100).nullable(),
  sort_order: z.number().int(),
});

export type SkillInput = z.infer<typeof skillSchema>;
