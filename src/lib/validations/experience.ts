import { z } from "zod";

export const experienceSchema = z.object({
  org: z.string().trim().min(1, "Organization is required.").max(200),
  role: z.string().trim().min(1, "Role is required.").max(200),
  description: z.string().trim().max(2000).or(z.literal("")),
  start_date: z.string().trim().min(1, "Start date is required."),
  end_date: z.string().trim().or(z.literal("")),
  type: z.enum(["work", "education"]),
  location: z.string().trim().max(200).or(z.literal("")),
  sort_order: z.number().int(),
});

export type ExperienceInput = z.infer<typeof experienceSchema>;
