import { AmbientBackground } from "@/components/ambient-background";
import { ScrollSpine } from "@/components/motion/scroll-spine";
import { SiteNav } from "@/components/nav/site-nav";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { Education } from "@/components/sections/education";
import { Publications } from "@/components/sections/publications";
import { Achievements } from "@/components/sections/achievements";
import { ContactForm } from "@/components/sections/contact-form";
import { Footer } from "@/components/sections/footer";
import {
  getAchievements,
  getEducation,
  getExperience,
  getProfile,
  getPublications,
  getPublishedProjects,
  getSkills,
} from "@/lib/data/queries";

export default async function Home() {
  const [profile, projects, skills, experience, education, publications, achievements] =
    await Promise.all([
      getProfile(),
      getPublishedProjects(),
      getSkills(),
      getExperience(),
      getEducation(),
      getPublications(),
      getAchievements(),
    ]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Start fetching the LCP portrait immediately, before the hero's client
          JS is parsed. crossOrigin matches the <img> so the preload is reused. */}
      <link
        rel="preload"
        as="image"
        href="/portrait.webp"
        type="image/webp"
        fetchPriority="high"
        crossOrigin="anonymous"
      />
      <AmbientBackground />
      <ScrollSpine />
      <SiteNav />
      <main className="flex-1">
        <Hero profile={profile} />
        <About profile={profile} />
        <Skills skills={skills} />
        <ProjectsGrid projects={projects} />
        <ExperienceTimeline entries={experience} />
        <Education entries={education} />
        <Publications publications={publications} />
        <Achievements achievements={achievements} />
        <ContactForm profile={profile} />
      </main>
      <Footer profile={profile} />
    </div>
  );
}
