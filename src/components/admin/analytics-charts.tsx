"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  Search,
  Eye,
  AlertCircle,
  TrendingUp,
  Globe,
  Layers,
} from "lucide-react";

interface AnalyticsChartsProps {
  data: {
    dailyActivity: { date: string; views: number; searches: number }[];
    topSearchQueries: { query: string; count: number }[];
    topZeroResultQueries: { query: string; count: number }[];
    themeData: { name: string; stories: number }[];
    languageData: { name: string; stories: number }[];
    regionData: { name: string; stories: number }[];
    totalViews: number;
    totalSearches: number;
  };
  currentPeriod: "7d" | "30d" | "all";
}

export function AnalyticsCharts({ data, currentPeriod }: AnalyticsChartsProps) {
  const [activeMetric, setActiveMetric] = useState<"views" | "searches">("views");

  return (
    <div className="space-y-8">
      {/* Date Period Filter Tabs */}
      <div className="flex items-center justify-between pb-2 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Time Range:
          </span>
          <div className="flex items-center gap-1.5">
            <Link
              href="/admin/analytics?period=7d"
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                currentPeriod === "7d"
                  ? "bg-terracotta text-white"
                  : "bg-white border border-line text-ink hover:border-terracotta/40"
              }`}
            >
              Last 7 Days
            </Link>
            <Link
              href="/admin/analytics?period=30d"
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                currentPeriod === "30d"
                  ? "bg-terracotta text-white"
                  : "bg-white border border-line text-ink hover:border-terracotta/40"
              }`}
            >
              Last 30 Days
            </Link>
            <Link
              href="/admin/analytics?period=all"
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                currentPeriod === "all"
                  ? "bg-terracotta text-white"
                  : "bg-white border border-line text-ink hover:border-terracotta/40"
              }`}
            >
              All Time
            </Link>
          </div>
        </div>

        {/* Metrics Summary Badges */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-ink">
            <Eye className="h-3.5 w-3.5 text-terracotta" />
            <span>
              <strong>{data.totalViews}</strong> Total Views
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-ink">
            <Search className="h-3.5 w-3.5 text-moss" />
            <span>
              <strong>{data.totalSearches}</strong> Searches
            </span>
          </span>
        </div>
      </div>

      {/* Main Activity Area Chart */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-warm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-base font-bold text-ink">
              Archive Engagement Over Time
            </h3>
            <p className="text-xs text-muted">
              Daily story listens and archive search volume trends
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMetric("views")}
              className={`text-xs px-3 py-1 rounded-lg border transition-colors font-medium ${
                activeMetric === "views"
                  ? "bg-terracotta/10 border-terracotta text-terracotta font-semibold"
                  : "bg-paper-2 border-line text-muted"
              }`}
            >
              Story Views
            </button>
            <button
              onClick={() => setActiveMetric("searches")}
              className={`text-xs px-3 py-1 rounded-lg border transition-colors font-medium ${
                activeMetric === "searches"
                  ? "bg-moss/10 border-moss text-moss font-semibold"
                  : "bg-paper-2 border-line text-muted"
              }`}
            >
              Search Activity
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.dailyActivity}>
              <defs>
                <linearGradient id="terracottaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B5472B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#B5472B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="mossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3F5B45" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3F5B45" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4DACB" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6B625A"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E4DACB" }}
              />
              <YAxis
                stroke="#6B625A"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E4DACB" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FBF7F0",
                  borderColor: "#E4DACB",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              />
              {activeMetric === "views" ? (
                <Area
                  type="monotone"
                  dataKey="views"
                  name="Story Views"
                  stroke="#B5472B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#terracottaGradient)"
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="searches"
                  name="Searches"
                  stroke="#3F5B45"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#mossGradient)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Search Queries & Zero-Result Searches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Search Queries */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-warm space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-moss" />
            <h3 className="font-serif text-base font-bold text-ink">
              Top Archive Search Queries
            </h3>
          </div>

          <div className="space-y-2">
            {data.topSearchQueries.length === 0 ? (
              <p className="text-xs text-muted py-4 text-center">
                No search queries logged in this interval.
              </p>
            ) : (
              data.topSearchQueries.map((item, idx) => (
                <div
                  key={item.query}
                  className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-paper-2 border border-line/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted w-4">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-ink">
                      &ldquo;{item.query}&rdquo;
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-muted">
                    {item.count} queries
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Zero Result Searches (Content Discovery Gaps) */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-6 shadow-warm space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <h3 className="font-serif text-base font-bold text-amber-900">
              Zero-Result Searches (Archive Gaps)
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Queries where visitors found no matching recordings. Ideal targets for community recording campaigns.
          </p>

          <div className="space-y-2">
            {data.topZeroResultQueries.length === 0 ? (
              <p className="text-xs text-muted py-4 text-center">
                Zero search misses logged. All visitor queries yielded matching records!
              </p>
            ) : (
              data.topZeroResultQueries.map((item) => (
                <div
                  key={item.query}
                  className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white border border-amber-200"
                >
                  <span className="font-medium text-amber-950">
                    &ldquo;{item.query}&rdquo;
                  </span>
                  <span className="text-[11px] font-bold text-amber-700">
                    {item.count} misses
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Themes & Geographic/Language Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cultural Theme Popularity */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-warm space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-saffron" />
            <h3 className="font-serif text-base font-bold text-ink">
              Cultural Theme Popularity
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.themeData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DACB" horizontal={false} />
                <XAxis type="number" stroke="#6B625A" fontSize={11} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#6B625A"
                  fontSize={11}
                  width={90}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FBF7F0",
                    borderColor: "#E4DACB",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="stories" name="Stories" fill="#E3A33B" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional & Linguistic Distribution */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-warm space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-sky-600" />
            <h3 className="font-serif text-base font-bold text-ink">
              Languages in the Archive
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.languageData}
                margin={{ top: 5, right: 20, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DACB" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#6B625A"
                  fontSize={11}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#6B625A" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FBF7F0",
                    borderColor: "#E4DACB",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="stories" name="Stories" fill="#3F5B45" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
