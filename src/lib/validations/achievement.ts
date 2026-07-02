import { z } from "zod";

export const achievementSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(300),
  issuer: z.string().trim().max(200).or(z.literal("")),
  description: z.string().trim().max(2000).or(z.literal("")),
  url: z.string().trim().url("Must be a valid URL.").or(z.literal("")),
  date: z.string().trim().min(1, "Date is required."),
  sort_order: z.number().int(),
});

export type AchievementInput = z.infer<typeof achievementSchema>;
