"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderGit2, Link as LinkIcon, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Reveal } from "@/components/motion/reveal";
import { submitContactMessage } from "@/lib/actions/contact";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import type { Profile } from "@/lib/data/types";

export function ContactForm({ profile }: { profile: Profile }) {
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactInput) {
    setPending(true);
    const result = await submitContactMessage(data);
    setPending(false);

    if (result.ok) {
      toast.success("Message sent — thanks for reaching out!");
      reset();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
          Contact
        </p>
        <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Let&apos;s work together
        </h2>
        <p className="mt-4 max-w-lg text-foreground/65">
          Have a project in mind or just want to say hello? Send a message, or
          reach out directly.
        </p>
      </Reveal>

      <Reveal as="div" className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} placeholder="Your name" />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="you@example.com" />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={5}
              {...register("message")}
              placeholder="What's on your mind?"
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {pending ? "Sending…" : "Send message"}
          </button>
        </form>

        {/* Deliberately no phone/WhatsApp link: a personal mobile number on a
            public page is scraped for spam and can't be taken back once it is.
            The form above and the email below are the reachable channels. */}
        <div className="flex flex-col gap-4">
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-3 rounded-xl border border-border/70 px-5 py-4 text-sm transition-colors hover:border-brand/50 hover:text-brand"
            >
              <Mail className="h-4 w-4" />
              {profile.email}
            </a>
          )}
          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border/70 px-5 py-4 text-sm transition-colors hover:border-brand/50 hover:text-brand"
            >
              <FolderGit2 className="h-4 w-4" />
              GitHub
            </a>
          )}
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border/70 px-5 py-4 text-sm transition-colors hover:border-brand/50 hover:text-brand"
            >
              <LinkIcon className="h-4 w-4" />
              LinkedIn
            </a>
          )}
        </div>
      </Reveal>
    </section>
  );
}
