import { z } from "zod";

export const educationSchema = z.object({
  institution: z.string().trim().min(1, "Institution is required.").max(200),
  degree: z.string().trim().min(1, "Degree is required.").max(200),
  field_of_study: z.string().trim().max(200).or(z.literal("")),
  grade: z.string().trim().max(50).or(z.literal("")),
  description: z.string().trim().max(2000).or(z.literal("")),
  start_date: z.string().trim().min(1, "Start date is required."),
  end_date: z.string().trim().or(z.literal("")),
  location: z.string().trim().max(200).or(z.literal("")),
  sort_order: z.number().int(),
});

export type EducationInput = z.infer<typeof educationSchema>;
