"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validations/contact";

export async function submitContactMessage(input: unknown) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert(parsed.data);

  if (error) {
    return { ok: false as const, error: "Something went wrong. Please try again." };
  }

  const notifyEmail = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (process.env.RESEND_API_KEY && notifyEmail) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: notifyEmail,
      replyTo: parsed.data.email,
      subject: `New message from ${parsed.data.name}`,
      text: parsed.data.message,
    });
  }

  return { ok: true as const };
}
