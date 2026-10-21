import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { publicStoryWhere } from "@/lib/permissions";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || "https://storykeeper.ai";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/timeline`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ethics`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contributor-guide`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    // Only public stories per publicStoryWhere()
    const publicStories = await prisma.story.findMany({
      where: publicStoryWhere(),
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const storyRoutes: MetadataRoute.Sitemap = publicStories.map((story) => ({
      url: `${baseUrl}/stories/${story.slug}`,
      lastModified: story.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Active collections
    const activeCollections = await prisma.collection.findMany({
      where: { status: "ACTIVE" },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const collectionRoutes: MetadataRoute.Sitemap = activeCollections.map(
      (col) => ({
        url: `${baseUrl}/collections/${col.slug}`,
        lastModified: col.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      })
    );

    return [...staticRoutes, ...storyRoutes, ...collectionRoutes];
  } catch (err) {
    console.warn("[SITEMAP GENERATION DB ERROR]", err);
    return staticRoutes;
  }
}
