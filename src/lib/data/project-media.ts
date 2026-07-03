import type { Project, ProjectMedia } from "./types";

/** Resolves the image/video used for a project's hero — falls back to the card thumbnail if no dedicated hero is set. */
export function getProjectHero(
  project: Pick<Project, "hero" | "image_url">,
): ProjectMedia | null {
  return (
    project.hero ??
    (project.image_url ? { url: project.image_url, type: "image" } : null)
  );
}
