import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-config";
import { getPublishedProjectsStatic } from "@/lib/data/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedProjectsStatic();
  const projectEntries = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: siteUrl, lastModified: new Date() },
    ...projectEntries,
  ];
}
