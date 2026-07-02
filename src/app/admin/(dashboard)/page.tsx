import Link from "next/link";
import { Award, BookOpen, FolderGit2, GraduationCap, Mail, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

async function getStats() {
  const supabase = await createClient();

  const [
    { count: projectCount },
    { count: skillCount },
    { count: educationCount },
    { count: publicationCount },
    { count: achievementCount },
    { count: unreadCount },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("skills").select("*", { count: "exact", head: true }),
    supabase.from("education").select("*", { count: "exact", head: true }),
    supabase.from("publications").select("*", { count: "exact", head: true }),
    supabase.from("achievements").select("*", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false),
  ]);

  return {
    projects: projectCount ?? 0,
    skills: skillCount ?? 0,
    education: educationCount ?? 0,
    publications: publicationCount ?? 0,
    achievements: achievementCount ?? 0,
    unread: unreadCount ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { href: "/admin/projects", label: "Projects", value: stats.projects, icon: FolderGit2 },
    { href: "/admin/skills", label: "Skills", value: stats.skills, icon: Sparkles },
    { href: "/admin/education", label: "Education", value: stats.education, icon: GraduationCap },
    {
      href: "/admin/publications",
      label: "Publications",
      value: stats.publications,
      icon: BookOpen,
    },
    { href: "/admin/achievements", label: "Achievements", value: stats.achievements, icon: Award },
    { href: "/admin/messages", label: "Unread messages", value: stats.unread, icon: Mail },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Quick overview of your portfolio content.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-border/70 p-6 transition-colors hover:border-brand/50"
          >
            <card.icon className="h-5 w-5 text-brand" />
            <p className="mt-4 text-3xl font-semibold">{card.value}</p>
            <p className="mt-1 text-sm text-foreground/60">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
