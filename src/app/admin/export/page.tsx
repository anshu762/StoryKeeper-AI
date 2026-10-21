import React from "react";
import { PageHeader } from "@/components/common/page-header";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { Download, FileText, ShieldCheck, Database, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminExportPage() {
  await requireAdmin();

  const collections = await prisma.collection.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        eyebrow="Academic & Research Commons"
        title="Oral History Dataset Export"
        description="Generate curated datasets of approved and permitted oral narratives for academic researchers, linguists, and cultural educators."
      />

      {/* Ethical Safeguards Banner */}
      <div className="rounded-2xl border border-moss/30 bg-moss/5 p-6 space-y-2">
        <div className="flex items-center gap-2 text-moss font-bold text-sm">
          <ShieldCheck className="h-5 w-5" />
          <span>Strict Privacy & Anonymity Safeguards Active</span>
        </div>
        <p className="text-xs text-ink/80 leading-relaxed">
          StoryKeeper automatically strips all contributor email addresses, IP logs, internal account IDs, and private details from exported datasets. Stories marked <strong>PRIVATE</strong> are never exported under any circumstances. Research-tier stories are only included when explicitly selected.
        </p>
      </div>

      {/* Export Configuration Form (Client action triggers GET /api/admin/export) */}
      <div className="bg-white border border-line rounded-2xl p-6 sm:p-8 shadow-warm space-y-6">
        <h3 className="font-serif text-lg font-bold text-ink">
          Dataset Configuration
        </h3>

        <form action="/api/admin/export" method="GET" className="space-y-5">
          {/* Format Selection */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-2">
              1. Choose Export File Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-line hover:border-terracotta/40 cursor-pointer transition-colors bg-paper-2">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  defaultChecked
                  className="mt-0.5 text-terracotta focus:ring-terracotta"
                />
                <div>
                  <span className="text-xs font-bold text-ink block">
                    Structured JSON (.json)
                  </span>
                  <span className="text-[11px] text-muted block mt-0.5">
                    Full hierarchical metadata including multilingual scripts, arrays of keywords, themes, and contributor attribution.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-line hover:border-terracotta/40 cursor-pointer transition-colors bg-paper-2">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  className="mt-0.5 text-terracotta focus:ring-terracotta"
                />
                <div>
                  <span className="text-xs font-bold text-ink block">
                    Spreadsheet CSV (.csv)
                  </span>
                  <span className="text-[11px] text-muted block mt-0.5">
                    RFC-4180 standard table format for analysis in Excel, R, Python pandas, or Google Sheets.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Permission Tier */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-2">
              2. Permission Tier Scope
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-line hover:border-moss/40 cursor-pointer transition-colors bg-white">
                <input
                  type="radio"
                  name="tier"
                  value="public"
                  defaultChecked
                  className="mt-0.5 text-moss focus:ring-moss"
                />
                <div>
                  <span className="text-xs font-semibold text-ink block">
                    Public Archive Stories Only (Recommended)
                  </span>
                  <span className="text-[11px] text-muted block mt-0.5">
                    Only includes stories approved with explicit public archive consent.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-line hover:border-moss/40 cursor-pointer transition-colors bg-white">
                <input
                  type="radio"
                  name="tier"
                  value="research"
                  className="mt-0.5 text-moss focus:ring-moss"
                />
                <div>
                  <span className="text-xs font-semibold text-ink block">
                    Public + Research-Only Stories
                  </span>
                  <span className="text-[11px] text-muted block mt-0.5">
                    Includes stories consented for scholarly research use. Private stories are still excluded.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Collection & Language Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                Filter by Collection (Optional)
              </label>
              <select
                name="collection"
                className="w-full text-xs bg-paper border border-line rounded-xl px-3 py-2.5 text-ink"
              >
                <option value="">All Collections</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                Filter by Language (Optional)
              </label>
              <select
                name="language"
                className="w-full text-xs bg-paper border border-line rounded-xl px-3 py-2.5 text-ink"
              >
                <option value="">All Regional Languages</option>
                <option value="Hindi">Hindi</option>
                <option value="Bhojpuri">Bhojpuri</option>
                <option value="Maithili">Maithili</option>
                <option value="Bengali">Bengali</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-line flex items-center justify-between">
            <span className="text-[11px] text-muted">
              Generates a timestamped archive download immediately.
            </span>
            <Button type="submit" variant="moss" size="sm" className="text-xs h-9">
              <Download className="h-4 w-4 mr-1.5" />
              <span>Download Dataset</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
