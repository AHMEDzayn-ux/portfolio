import { z } from "zod";

export const publicationSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(300),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  authors: z.string().trim().min(1, "Authors are required.").max(500),
  venue: z.string().trim().max(300).or(z.literal("")),
  publication_date: z.string().trim().min(1, "Publication date is required."),
  url: z.string().trim().url("Must be a valid URL.").or(z.literal("")),
  description: z.string().trim().max(2000).or(z.literal("")),
  sort_order: z.number().int(),
});

export type PublicationInput = z.infer<typeof publicationSchema>;
