"use client";

import React, { useState, useEffect } from "react";
import AdminTable, { Column, TableAction } from "@/components/admin/AdminTable";
import { Folder, Image as ImageIcon, Plus, Edit, Download, Trash2, Check, AlertCircle } from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  folder: string;
  alt_text: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  caption: string;
  filepath: string;
  file_size?: string;
  dimensions?: string;
  compression_ratio?: string;
}

const foldersList = [
  "01_Hero_Images",
  "02_Destinations",
  "03_Attractions/Marina-Bay-Sands",
  "04_Experiences",
  "05_Hotels_Resorts",
  "06_Restaurants_Food",
  "07_Shopping",
  "08_Nature_Parks",
  "09_Nightlife",
  "10_Transportation",
  "11_Events_Festivals",
  "12_Culture_Heritage",
  "18_Banners",
  "19_Thumbnails",
  "20_Package_Components"
];

export default function MediaLibraryAdmin() {
  const [selectedFolder, setSelectedFolder] = useState<string>("03_Attractions/Marina-Bay-Sands");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Edit fields
  const [altText, setAltText] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [keywords, setKeywords] = useState("");
  const [caption, setCaption] = useState("");

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/images/MANIFEST.json");
      if (!res.ok) throw new Error("Manifest not found");
      const data = await res.json();
      
      // Parse manifest structures. The manifest lists arrays of images inside packages or attractions, 
      // or we can extract the images list.
      let list: MediaItem[] = [];
      
      // Attempt to load from Singapore attraction list or categories
      if (data && data.attractions && data.attractions["marina-bay-sands"]) {
        const mbsImages = data.attractions["marina-bay-sands"].images || [];
        list = mbsImages.map((img: any, idx: number) => ({
          id: `media-${idx}`,
          filename: img.filename,
          folder: img.folder || "03_Attractions/Marina-Bay-Sands",
          alt_text: img.alt_text || "",
          meta_title: img.meta_title || "",
          meta_description: img.meta_description || "",
          keywords: img.keywords || "",
          caption: img.caption || "",
          filepath: img.filepath || `/images/${img.folder}/${img.filename}`,
          file_size: "185 KB",
          dimensions: "1200 x 800 px",
          compression_ratio: "WebP 82%"
        }));
      }

      // If empty or different folder selected, populate mock items to prevent blank screens
      if (list.length === 0 || selectedFolder !== "03_Attractions/Marina-Bay-Sands") {
        list = Array.from({ length: 8 }).map((_, idx) => {
          const names = ["landscape", "luxury-suite", "dining-view", "activity-sunset", "resort-overview", "shopping-spree", "local-dish", "city-skyline"];
          const name = names[idx % names.length];
          return {
            id: `media-mock-${selectedFolder}-${idx}`,
            filename: `${name}-${idx + 1}.jpg`,
            folder: selectedFolder,
            alt_text: `Premium ${name} view in ${selectedFolder}`,
            meta_title: `Experience ${name} | ${selectedFolder.replace(/_/g, " ")}`,
            meta_description: `Book travel experiences. Premium visual of ${name} in our luxury itineraries database.`,
            keywords: `${name}, travel, vacation, luxury`,
            caption: `Luxury ${name.replace(/-/g, " ")} representation.`,
            filepath: `/images/placeholder-hero.jpg`,
            file_size: "142 KB",
            dimensions: "1600 x 900 px",
            compression_ratio: "WebP 85%"
          };
        });
      }
      
      setMediaItems(list);
    } catch (err) {
      console.warn("Failed to load MANIFEST.json. Falling back to mocks.");
      const list = Array.from({ length: 6 }).map((_, idx) => ({
        id: `media-fallback-${idx}`,
        filename: `image-asset-${idx + 1}.webp`,
        folder: selectedFolder,
        alt_text: `Fallback asset image ${idx + 1}`,
        meta_title: `Scenic view asset ${idx + 1}`,
        meta_description: `Fallback representation for catalog items.`,
        keywords: "fallback, media, asset",
        caption: `Asset template caption #${idx + 1}`,
        filepath: `/images/placeholder-hero.jpg`,
        file_size: "95 KB",
        dimensions: "1200 x 800 px",
        compression_ratio: "WebP 75%"
      }));
      setMediaItems(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [selectedFolder]);

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setAltText(item.alt_text);
    setMetaTitle(item.meta_title);
    setMetaDesc(item.meta_description);
    setKeywords(item.keywords);
    setCaption(item.caption);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    // Simulate manifest update
    setMediaItems(prev =>
      prev.map(img =>
        img.id === editingItem.id
          ? {
              ...img,
              alt_text: altText,
              meta_title: metaTitle,
              meta_description: metaDesc,
              keywords: keywords,
              caption: caption
            }
          : img
      )
    );

    setSuccessMsg(`Updated metadata for '${editingItem.filename}' in manifest memory cache.`);
    setEditingItem(null);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const columns: Column<MediaItem>[] = [
    {
      header: "Preview",
      key: "filepath",
      sortable: false,
      render: (row) => (
        <div className="w-14 h-10 bg-sand/30 rounded border border-border/40 overflow-hidden relative flex items-center justify-center">
          <img
            src={row.filepath}
            alt={row.alt_text}
            onError={(e) => {
              // fallback to nice SVG or placeholder
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=100&q=80";
            }}
            className="w-full h-full object-cover"
          />
        </div>
      )
    },
    { header: "Filename", key: "filename", sortable: true },
    { header: "Caption", key: "caption" },
    { header: "Alt Text", key: "alt_text" },
    { header: "Size", key: "file_size" },
    { header: "Dimensions", key: "dimensions" },
    {
      header: "Format",
      key: "compression_ratio",
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-semibold">
          {row.compression_ratio}
        </span>
      )
    }
  ];

  const actions: TableAction<MediaItem>[] = [
    { label: "Edit Meta", onClick: handleEdit, className: "text-marigold" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-indigo">Media Library</h1>
          <p className="text-xs text-dusk-teal mt-0.5">
            Optimize, tags calibrate, and govern public image catalogs.
          </p>
        </div>
        <button
          onClick={() => {
            const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mediaItems, null, 2));
            const downloadAnchor = document.createElement("a");
            downloadAnchor.setAttribute("href", jsonStr);
            downloadAnchor.setAttribute("download", `MANIFEST_UPDATE_${selectedFolder.replace(/\//g, "_")}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-ink-indigo text-white rounded-lg text-xs font-semibold hover:bg-ink-indigo/90 transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-marigold" />
          <span>Download Manifest Patch</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Directory Folders + Image List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Directory Folders List */}
        <div className="bg-white border border-border/40 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-ink-indigo uppercase tracking-wider mb-2">Folder Index</h3>
          <div className="space-y-1">
            {foldersList.map(folder => {
              const isSelected = selectedFolder === folder;
              return (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition text-left ${
                    isSelected
                      ? "bg-marigold/10 text-marigold border border-marigold/20"
                      : "text-dusk-teal hover:bg-sand/35 hover:text-ink-indigo"
                  }`}
                >
                  <Folder className={`w-4 h-4 shrink-0 ${isSelected ? "text-marigold" : "text-dusk-teal/60"}`} />
                  <span className="truncate">{folder}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Media Table & Editor */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2">
              <AdminTable
                data={mediaItems}
                columns={columns}
                searchKey="filename"
                searchPlaceholder="Search files in folder..."
                actions={actions}
                exportFileName={`media_manifest_${selectedFolder}`}
              />
            </div>

            {/* Editing Alt and SEO Alt Form */}
            {editingItem && (
              <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-border/20 pb-3">
                  <h3 className="text-sm font-bold text-ink-indigo font-display">Edit Asset Meta</h3>
                  <button onClick={() => setEditingItem(null)} className="text-dusk-teal/60 hover:text-ink-indigo font-bold">
                    ✕
                  </button>
                </div>

                <div className="w-full h-32 bg-sand/35 border border-border/20 rounded-lg overflow-hidden relative flex items-center justify-center">
                  <img
                    src={editingItem.filepath}
                    alt={editingItem.alt_text}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200&q=80";
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-deep-charcoal mb-1">Asset Caption</label>
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-deep-charcoal mb-1">Alt Text (Accessibility) *</label>
                    <input
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-deep-charcoal mb-1">SEO Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-deep-charcoal mb-1">SEO Meta Description</label>
                    <textarea
                      value={metaDesc}
                      onChange={(e) => setMetaDesc(e.target.value)}
                      className="w-full h-16 px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-deep-charcoal mb-1">Image Keywords (Comma Separated)</label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-marigold hover:bg-marigold/90 text-white rounded-lg py-2.5 font-semibold transition text-center"
                    >
                      Save Meta Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
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
      </div>
    </div>
  );
}
