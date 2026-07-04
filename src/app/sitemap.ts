import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-config";
import { getPublishedProjectsStatic, getPublicationsStatic } from "@/lib/data/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, publications] = await Promise.all([
    getPublishedProjectsStatic(),
    getPublicationsStatic(),
  ]);
  const projectEntries = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: new Date(),
  }));
  const publicationEntries = publications.map((publication) => ({
    url: `${siteUrl}/publications/${publication.slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: siteUrl, lastModified: new Date() },
    ...projectEntries,
    ...publicationEntries,
  ];
}
