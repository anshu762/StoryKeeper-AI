"use client";

import React, { useState, useEffect } from "react";
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
  Search,
  Eye,
  AlertCircle,
  TrendingUp,
  Globe,
  Layers,
  Sparkles,
  ArrowUpRight,
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

// Custom modern warm tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const item = payload[0];
    const isViews = item.dataKey === "views";
    return (
      <div className="rounded-xl border border-line bg-paper/95 backdrop-blur-md px-3.5 py-2.5 shadow-sm text-xs space-y-1">
        <p className="font-semibold text-muted text-[11px] uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: isViews ? "#B5472B" : "#3F5B45" }}
          />
          <span className="font-serif font-bold text-ink text-sm">
            {item.value} {isViews ? "views" : "searches"}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function AnalyticsCharts({ data, currentPeriod }: AnalyticsChartsProps) {
  const [mounted, setMounted] = useState(false);
  const [activeMetric, setActiveMetric] = useState<"views" | "searches">("views");

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalZeroMisses = data.topZeroResultQueries.reduce(
    (acc, curr) => acc + curr.count,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Filter & Period Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-line">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Interval:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href="/admin/analytics?period=7d"
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                currentPeriod === "7d"
                  ? "bg-terracotta text-white shadow-xs"
                  : "bg-white border border-line text-ink hover:border-terracotta/40"
              }`}
            >
              Last 7 Days
            </Link>
            <Link
              href="/admin/analytics?period=30d"
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                currentPeriod === "30d"
                  ? "bg-terracotta text-white shadow-xs"
                  : "bg-white border border-line text-ink hover:border-terracotta/40"
              }`}
            >
              Last 30 Days
            </Link>
            <Link
              href="/admin/analytics?period=all"
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                currentPeriod === "all"
                  ? "bg-terracotta text-white shadow-xs"
                  : "bg-white border border-line text-ink hover:border-terracotta/40"
              }`}
            >
              All Time
            </Link>
          </div>
        </div>

        <div className="text-xs text-muted flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-saffron" />
          <span>Real-time metrics updated across archive queries</span>
        </div>
      </div>

      {/* 4 Metric Summary Cards (Clean, Shadow-Free) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="rounded-2xl border border-line/80 bg-white/90 p-5 transition-colors hover:border-terracotta/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Story Listens
            </span>
            <div className="w-8 h-8 rounded-xl bg-terracotta/10 flex items-center justify-center">
              <Eye className="h-4 w-4 text-terracotta" />
            </div>
          </div>
          <div className="mt-3">
            <h4 className="font-serif text-2xl font-bold text-ink tracking-tight">
              {data.totalViews.toLocaleString()}
            </h4>
            <p className="text-[11px] text-muted mt-0.5">Recorded audio plays</p>
          </div>
        </div>

        {/* Total Searches */}
        <div className="rounded-2xl border border-line/80 bg-white/90 p-5 transition-colors hover:border-moss/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Archive Queries
            </span>
            <div className="w-8 h-8 rounded-xl bg-moss/10 flex items-center justify-center">
              <Search className="h-4 w-4 text-moss" />
            </div>
          </div>
          <div className="mt-3">
            <h4 className="font-serif text-2xl font-bold text-ink tracking-tight">
              {data.totalSearches.toLocaleString()}
            </h4>
            <p className="text-[11px] text-muted mt-0.5">Community search requests</p>
          </div>
        </div>

        {/* Zero Result Searches */}
        <div className="rounded-2xl border border-line/80 bg-white/90 p-5 transition-colors hover:border-amber-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Discovery Gaps
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-amber-700" />
            </div>
          </div>
          <div className="mt-3">
            <h4 className="font-serif text-2xl font-bold text-ink tracking-tight">
              {totalZeroMisses.toLocaleString()}
            </h4>
            <p className="text-[11px] text-muted mt-0.5">Queries with 0 matches</p>
          </div>
        </div>

        {/* Total Languages */}
        <div className="rounded-2xl border border-line/80 bg-white/90 p-5 transition-colors hover:border-plum/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Dialects & Tongues
            </span>
            <div className="w-8 h-8 rounded-xl bg-plum/10 flex items-center justify-center">
              <Globe className="h-4 w-4 text-plum" />
            </div>
          </div>
          <div className="mt-3">
            <h4 className="font-serif text-2xl font-bold text-ink tracking-tight">
              {data.languageData.length}
            </h4>
            <p className="text-[11px] text-muted mt-0.5">Spoken languages indexed</p>
          </div>
        </div>
      </div>

      {/* Main Activity Smooth Area Chart (Shadow-Free, Modern) */}
      <div className="rounded-2xl border border-line/80 bg-white/95 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-base font-bold text-ink">
              Archive Engagement Timeline
            </h3>
            <p className="text-xs text-muted">
              Daily story listens and archive search volume trends
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-paper border border-line/60">
            <button
              onClick={() => setActiveMetric("views")}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                activeMetric === "views"
                  ? "bg-terracotta text-white font-semibold shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              Story Views
            </button>
            <button
              onClick={() => setActiveMetric("searches")}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                activeMetric === "searches"
                  ? "bg-moss text-white font-semibold shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              Search Activity
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.dailyActivity}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="terracottaSmooth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B5472B" stopOpacity={0.35} />
                    <stop offset="90%" stopColor="#B5472B" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="mossSmooth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3F5B45" stopOpacity={0.35} />
                    <stop offset="90%" stopColor="#3F5B45" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#F3ECE0"
                  vertical={false}
                />
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
                <Tooltip content={<CustomTooltip />} />
                {activeMetric === "views" ? (
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Story Views"
                    stroke="#B5472B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#terracottaSmooth)"
                    activeDot={{
                      r: 6,
                      stroke: "#B5472B",
                      strokeWidth: 2,
                      fill: "#FFFFFF",
                    }}
                  />
                ) : (
                  <Area
                    type="monotone"
                    dataKey="searches"
                    name="Searches"
                    stroke="#3F5B45"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#mossSmooth)"
                    activeDot={{
                      r: 6,
                      stroke: "#3F5B45",
                      strokeWidth: 2,
                      fill: "#FFFFFF",
                    }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-muted">
              Loading analytics timeline...
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid: Search Queries & Zero-Result Searches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Search Queries */}
        <div className="rounded-2xl border border-line/80 bg-white/95 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-moss/10 flex items-center justify-center">
                <Search className="h-3.5 w-3.5 text-moss" />
              </div>
              <h3 className="font-serif text-base font-bold text-ink">
                Top Archive Search Queries
              </h3>
            </div>
            <span className="text-[11px] font-medium text-muted">
              {data.topSearchQueries.length} terms
            </span>
          </div>

          <div className="space-y-2">
            {data.topSearchQueries.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">
                No search queries logged in this interval.
              </p>
            ) : (
              data.topSearchQueries.map((item, idx) => (
                <div
                  key={item.query}
                  className="flex items-center justify-between text-xs py-2.5 px-3.5 rounded-xl bg-paper/60 border border-line/60 hover:bg-paper-2/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold text-muted w-5 text-center">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-ink">
                      &ldquo;{item.query}&rdquo;
                    </span>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-line text-muted">
                    {item.count} {item.count === 1 ? "query" : "queries"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Zero Result Searches (Content Discovery Gaps) */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-3.5 w-3.5 text-amber-700" />
              </div>
              <h3 className="font-serif text-base font-bold text-amber-950">
                Zero-Result Searches (Archive Gaps)
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-800">
              Needs Content
            </span>
          </div>
          <p className="text-[11px] text-amber-900/80 leading-relaxed">
            Queries where visitors found no matching recordings. Ideal targets for community recording campaigns.
          </p>

          <div className="space-y-2">
            {data.topZeroResultQueries.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">
                Zero search misses logged. All visitor queries yielded matching records!
              </p>
            ) : (
              data.topZeroResultQueries.map((item) => (
                <div
                  key={item.query}
                  className="flex items-center justify-between text-xs py-2.5 px-3.5 rounded-xl bg-white border border-amber-200/70"
                >
                  <span className="font-medium text-amber-950">
                    &ldquo;{item.query}&rdquo;
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                    {item.count} {item.count === 1 ? "miss" : "misses"}
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
        <div className="rounded-2xl border border-line/80 bg-white/95 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-saffron/10 flex items-center justify-center">
              <Layers className="h-3.5 w-3.5 text-saffron" />
            </div>
            <h3 className="font-serif text-base font-bold text-ink">
              Cultural Theme Popularity
            </h3>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.themeData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3ECE0" horizontal={false} />
                  <XAxis type="number" stroke="#6B625A" fontSize={11} allowDecimals={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#6B625A"
                    fontSize={11}
                    width={100}
                    tickLine={false}
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
                  <Bar
                    dataKey="stories"
                    name="Stories"
                    fill="#E3A33B"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Regional & Linguistic Distribution */}
        <div className="rounded-2xl border border-line/80 bg-white/95 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-moss/10 flex items-center justify-center">
              <Globe className="h-3.5 w-3.5 text-moss" />
            </div>
            <h3 className="font-serif text-base font-bold text-ink">
              Languages in the Archive
            </h3>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.languageData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3ECE0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#6B625A"
                    fontSize={11}
                    angle={-25}
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
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Bar
                    dataKey="stories"
                    name="Stories"
                    fill="#3F5B45"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
