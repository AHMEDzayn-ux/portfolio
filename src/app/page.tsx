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
import { Certifications } from "@/components/sections/certifications";
import { ContactForm } from "@/components/sections/contact-form";
import { Footer } from "@/components/sections/footer";
import {
  getAchievements,
  getCertifications,
  getEducation,
  getExperience,
  getProfile,
  getPublications,
  getPublishedProjects,
  getSkills,
} from "@/lib/data/queries";

// Prerender to static HTML (all reads use the cookie-free client, so nothing
// forces dynamic rendering). Admin mutations call revalidatePath("/") for
// instant updates; this hourly window is just a safety net.
export const revalidate = 3600;

export default async function Home() {
  const [
    profile,
    projects,
    skills,
    experience,
    education,
    publications,
    achievements,
    certifications,
  ] = await Promise.all([
    getProfile(),
    getPublishedProjects(),
    getSkills(),
    getExperience(),
    getEducation(),
    getPublications(),
    getAchievements(),
    getCertifications(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Start fetching the LCP portrait immediately, before the hero's client
          JS is parsed. Same-origin, no crossOrigin — so the request mode
          matches the <img> and the browser reuses this preload for the LCP
          paint instead of fetching it again. */}
      <link
        rel="preload"
        as="image"
        href="/portrait.webp"
        type="image/webp"
        fetchPriority="high"
      />
      <AmbientBackground />
      <ScrollSpine />
      <SiteNav />
      <main className="flex-1">
        <Hero profile={profile} />
        {/* Order is deliberate: the work itself first (projects, publications,
            achievements), then the credentials behind it. Keep this in step
            with LINKS in site-nav.tsx. */}
        <About profile={profile} />
        <ProjectsGrid projects={projects} />
        <Publications publications={publications} />
        <Certifications certifications={certifications} />
        <Achievements achievements={achievements} />
        <Education entries={education} />
        <Skills skills={skills} />
        <ExperienceTimeline entries={experience} />
        <ContactForm profile={profile} />
      </main>
      <Footer profile={profile} />
    </div>
  );
}
