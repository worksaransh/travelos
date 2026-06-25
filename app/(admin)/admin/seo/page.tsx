"use client";

import React, { useState } from "react";
import AdminTable, { Column, TableAction } from "@/components/admin/AdminTable";
import { Search, Save, CheckCircle, Globe, RefreshCw } from "lucide-react";

interface SeoPageConfig {
  id: string;
  route_path: string;
  canonical_url: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  structured_schema_enabled: boolean;
  indexed: boolean;
}

const initialPages: SeoPageConfig[] = [
  {
    id: "seo-1",
    route_path: "/",
    canonical_url: "https://journeyos.com/",
    meta_title: "Journey OS | Premium AI-Powered Travel Configuration Platform",
    meta_description: "Build custom signature itineraries with automated travel planning, real-time hotel price calibrations, and curated experiences in seconds.",
    og_image: "/images/01_Hero_Images/hero-main.jpg",
    structured_schema_enabled: true,
    indexed: true
  },
  {
    id: "seo-2",
    route_path: "/how-it-works",
    canonical_url: "https://journeyos.com/how-it-works",
    meta_title: "How It Works | Journey OS AI Travel Builder",
    meta_description: "Learn how the Journey OS algorithmic engine integrates 10-dimensional traveler preference scoring with premium destination catalogs.",
    og_image: "/images/18_Banners/banner-how-it-works.jpg",
    structured_schema_enabled: true,
    indexed: true
  },
  {
    id: "seo-3",
    route_path: "/itinerary/[itinerary_id]",
    canonical_url: "https://journeyos.com/itinerary/",
    meta_title: "Your Custom Luxury Signature Itinerary | Journey OS",
    meta_description: "Review and calibrate accommodations, active experiences, and hidden gems in your customized travel schedule.",
    og_image: "/images/20_Package_Components/default-itinerary-og.jpg",
    structured_schema_enabled: false,
    indexed: false
  },
  {
    id: "seo-4",
    route_path: "/destinations/singapore",
    canonical_url: "https://journeyos.com/destinations/singapore",
    meta_title: "Curated Luxury Packages in Singapore | Journey OS",
    meta_description: "Discover premium signature packages in Singapore. Featuring Marina Bay Sands rooftop suite stays and exclusive tours.",
    og_image: "/images/03_Attractions/Marina-Bay-Sands/marina-bay-sands-night-view.jpg",
    structured_schema_enabled: true,
    indexed: true
  }
];

export default function SeoManagerAdmin() {
  const [pages, setPages] = useState<SeoPageConfig[]>(initialPages);
  const [editingPage, setEditingPage] = useState<SeoPageConfig | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [pinging, setPinging] = useState(false);

  // Form inputs
  const [route, setRoute] = useState("");
  const [canonical, setCanonical] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [schemaEnabled, setSchemaEnabled] = useState(true);
  const [indexed, setIndexed] = useState(true);

  const handleEdit = (page: SeoPageConfig) => {
    setEditingPage(page);
    setRoute(page.route_path);
    setCanonical(page.canonical_url);
    setTitle(page.meta_title);
    setDesc(page.meta_description);
    setOgImage(page.og_image);
    setSchemaEnabled(page.structured_schema_enabled);
    setIndexed(page.indexed);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    setPages(prev =>
      prev.map(p =>
        p.id === editingPage.id
          ? {
              ...p,
              route_path: route,
              canonical_url: canonical,
              meta_title: title,
              meta_description: desc,
              og_image: ogImage,
              structured_schema_enabled: schemaEnabled,
              indexed: indexed
            }
          : p
      )
    );

    setSuccessMsg(`SEO parameters for '${route}' updated successfully in the app configuration cache.`);
    setEditingPage(null);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handlePingSitemap = () => {
    setPinging(true);
    setTimeout(() => {
      setPinging(false);
      setSuccessMsg("Sitemap regenerated and pinged to Google search indexers successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
    }, 1500);
  };

  const columns: Column<SeoPageConfig>[] = [
    { header: "Route Path", key: "route_path", sortable: true },
    { header: "Meta Title", key: "meta_title", sortable: true },
    { header: "Canonical URL", key: "canonical_url" },
    {
      header: "Indexed",
      key: "indexed",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
            row.indexed
              ? "bg-emerald-100 text-emerald-800"
              : "bg-rose-100 text-rose-800"
          }`}
        >
          {row.indexed ? "Indexed" : "No-Index"}
        </span>
      )
    },
    {
      header: "JSON-LD Schema",
      key: "structured_schema_enabled",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
            row.structured_schema_enabled
              ? "bg-sky-100 text-sky-800"
              : "bg-sand text-dusk-teal"
          }`}
        >
          {row.structured_schema_enabled ? "Enabled" : "Disabled"}
        </span>
      )
    }
  ];

  const actions: TableAction<SeoPageConfig>[] = [
    { label: "Configure SEO", onClick: handleEdit, className: "text-marigold" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-indigo">SEO Manager</h1>
          <p className="text-xs text-dusk-teal mt-0.5">
            Optimize meta headers, og tag schemas, canonical links, and trigger search indexer pings.
          </p>
        </div>
        
        <button
          onClick={handlePingSitemap}
          disabled={pinging}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-ink-indigo text-white rounded-lg text-xs font-semibold hover:bg-ink-indigo/90 transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-marigold ${pinging ? "animate-spin" : ""}`} />
          <span>{pinging ? "Reindexing Sitemap..." : "Ping Sitemap Indexers"}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <AdminTable
            data={pages}
            columns={columns}
            searchKey="route_path"
            searchPlaceholder="Search routes/pages..."
            actions={actions}
            exportFileName="seo_routing_configurations"
          />
        </div>

        {/* Edit Form */}
        {editingPage && (
          <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs">
            <div className="flex justify-between items-center border-b border-border/20 pb-3">
              <h3 className="text-sm font-bold text-ink-indigo font-display">Configure Route SEO</h3>
              <button onClick={() => setEditingPage(null)} className="text-dusk-teal/60 hover:text-ink-indigo font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Route Path Pattern</label>
                <input
                  type="text"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Canonical URL Override *</label>
                <input
                  type="url"
                  value={canonical}
                  onChange={(e) => setCanonical(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Meta HTML Title Tag *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold font-semibold text-ink-indigo"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Meta HTML Description *</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full h-20 px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold resize-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">OpenGraph OG:Image Source Path</label>
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                />
              </div>

              <div className="flex gap-4 items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-deep-charcoal">
                  <input
                    type="checkbox"
                    checked={indexed}
                    onChange={(e) => setIndexed(e.target.checked)}
                    className="accent-marigold"
                  />
                  <span>Allow Search Engine Crawlers (Index Page)</span>
                </label>
              </div>

              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-deep-charcoal">
                  <input
                    type="checkbox"
                    checked={schemaEnabled}
                    onChange={(e) => setSchemaEnabled(e.target.checked)}
                    className="accent-marigold"
                  />
                  <span>Include JSON-LD Structured Data Schema Markup</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-marigold hover:bg-marigold/90 text-white rounded-lg py-2.5 font-semibold transition text-center flex items-center justify-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Config</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="flex-1 border border-border rounded-lg py-2.5 hover:bg-sand/30 transition text-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
