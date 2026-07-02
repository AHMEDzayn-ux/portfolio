import { AmbientBackground } from "@/components/ambient-background";
import { SiteNav } from "@/components/nav/site-nav";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { ContactForm } from "@/components/sections/contact-form";
import { Footer } from "@/components/sections/footer";
import {
  getExperience,
  getProfile,
  getPublishedProjects,
  getSkills,
} from "@/lib/data/queries";

export default async function Home() {
  const [profile, projects, skills, experience] = await Promise.all([
    getProfile(),
    getPublishedProjects(),
    getSkills(),
    getExperience(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <AmbientBackground />
      <SiteNav />
      <main className="flex-1">
        <Hero profile={profile} />
        <About profile={profile} />
        <Skills skills={skills} />
        <ProjectsGrid projects={projects} />
        <ExperienceTimeline entries={experience} />
        <ContactForm profile={profile} />
      </main>
      <Footer profile={profile} />
    </div>
  );
}
