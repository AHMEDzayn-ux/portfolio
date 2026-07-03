import { z } from "zod";
import { urlField } from "./shared";

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  description: z.string().trim().max(200, "Keep the short description under 200 characters."),
  long_description: z.string().trim().max(8000).or(z.literal("")),
  tags: z
    .array(z.string().trim().min(1).max(24, "Tags must be 24 characters or fewer."))
    .max(6, "Use at most 6 tags."),
  repo_url: urlField,
  live_url: urlField,
  image_url: urlField,
  media: z.array(
    z.object({
      url: z.string().url(),
      type: z.enum(["image", "video"]),
    })
  ),
  hero: z
    .object({
      url: z.string().url(),
      type: z.enum(["image", "video"]),
    })
    .nullable(),
  featured: z.boolean(),
  sort_order: z.number().int(),
  status: z.enum(["draft", "published"]),
});

export type ProjectInput = z.infer<typeof projectSchema>;
