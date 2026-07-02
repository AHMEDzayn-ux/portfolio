import { z } from "zod";
import { urlField } from "./shared";

export const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required.").max(200),
  title: z.string().trim().max(200).or(z.literal("")),
  short_tagline: z.string().trim().max(300).or(z.literal("")),
  bio: z.string().trim().max(4000).or(z.literal("")),
  email: z.string().trim().email().or(z.literal("")),
  location: z.string().trim().max(200).or(z.literal("")),
  github_url: urlField,
  linkedin_url: urlField,
  telegram_url: urlField,
  twitter_url: urlField,
});

export type ProfileInput = z.infer<typeof profileSchema>;
