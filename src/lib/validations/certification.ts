import { z } from "zod";

export const certificationSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(300),
  issuer: z.string().trim().max(200).or(z.literal("")),
  description: z.string().trim().max(2000).or(z.literal("")),
  image_url: z.string().trim().url("Upload a certificate image."),
  credential_url: z.string().trim().url("Must be a valid URL.").or(z.literal("")),
  date: z.string().trim().min(1, "Date is required."),
  sort_order: z.number().int(),
});

export type CertificationInput = z.infer<typeof certificationSchema>;
