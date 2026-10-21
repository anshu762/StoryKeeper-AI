"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { format, subDays, eachDayOfInterval } from "date-fns";

export async function getArchiveAnalytics(period: "7d" | "30d" | "all" = "30d") {
  await requireAdmin();

  const now = new Date();
  const startDate =
    period === "7d"
      ? subDays(now, 7)
      : period === "30d"
      ? subDays(now, 30)
      : subDays(now, 90); // All-time default to 90 days window for time series

  const [
    views,
    searches,
    zeroSearches,
    themeCounts,
    languageCounts,
    regionCounts,
  ] = await Promise.all([
    // Story Views
    prisma.storyView.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    }),

    // Search Logs
    prisma.searchLog.findMany({
      where: { createdAt: { gte: startDate } },
      select: { query: true, resultCount: true, createdAt: true },
    }),

    // Zero-Result Searches
    prisma.searchLog.findMany({
      where: { resultCount: 0, createdAt: { gte: startDate } },
      select: { query: true },
    }),

    // Theme Popularity
    prisma.theme.findMany({
      select: {
        name: true,
        _count: {
          select: { stories: true },
        },
      },
      orderBy: {
        stories: { _count: "desc" },
      },
      take: 8,
    }),

    // Language Distribution
    prisma.story.groupBy({
      by: ["originalLanguage"],
      _count: { _all: true },
      where: { deletedAt: null },
    }),

    // Regional Distribution
    prisma.story.groupBy({
      by: ["region"],
      _count: { _all: true },
      where: { deletedAt: null, region: { not: null } },
      orderBy: { _count: { region: "desc" } },
      take: 8,
    }),
  ]);

  // Generate days timeline for charts
  const daysInterval = eachDayOfInterval({ start: startDate, end: now });
  const timelineMap: Record<string, { date: string; views: number; searches: number }> = {};

  daysInterval.forEach((d) => {
    const key = format(d, "yyyy-MM-dd");
    timelineMap[key] = {
      date: format(d, "MMM d"),
      views: 0,
      searches: 0,
    };
  });

  views.forEach((v) => {
    const key = format(v.createdAt, "yyyy-MM-dd");
    if (timelineMap[key]) {
      timelineMap[key].views++;
    }
  });

  searches.forEach((s) => {
    const key = format(s.createdAt, "yyyy-MM-dd");
    if (timelineMap[key]) {
      timelineMap[key].searches++;
    }
  });

  const dailyActivity = Object.values(timelineMap);

  // Calculate top search queries
  const queryCounts: Record<string, number> = {};
  searches.forEach((s) => {
    const q = s.query.trim().toLowerCase();
    if (q) {
      queryCounts[q] = (queryCounts[q] || 0) + 1;
    }
  });

  const topSearchQueries = Object.entries(queryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  // Calculate top zero-result queries
  const zeroCounts: Record<string, number> = {};
  zeroSearches.forEach((s) => {
    const q = s.query.trim().toLowerCase();
    if (q) {
      zeroCounts[q] = (zeroCounts[q] || 0) + 1;
    }
  });

  const topZeroResultQueries = Object.entries(zeroCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([query, count]) => ({ query, count }));

  // Format theme popularity
  const themeData = themeCounts.map((t) => ({
    name: t.name,
    stories: t._count.stories,
  }));

  // Format language distribution
  const languageData = languageCounts.map((l) => ({
    name: l.originalLanguage,
    stories: l._count._all,
  }));

  // Format regional distribution
  const regionData = regionCounts
    .filter((r) => r.region !== null)
    .map((r) => ({
      name: r.region as string,
      stories: r._count._all,
    }));

  return {
    dailyActivity,
    topSearchQueries,
    topZeroResultQueries,
    themeData,
    languageData,
    regionData,
    totalViews: views.length,
    totalSearches: searches.length,
  };
}
