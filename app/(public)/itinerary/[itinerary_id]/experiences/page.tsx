"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getItinerary } from "@/lib/supabase";

export default function ExperienceDetailsGridPage() {
  const params = useParams();
  const itineraryId = params.itinerary_id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (itineraryId) {
      getItinerary(itineraryId).then((fetched) => {
        setData(fetched);
        setLoading(false);
      }).catch((err) => {
        console.error("Failed loading experiences:", err);
        setLoading(false);
      });
    }
  }, [itineraryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sand text-deep-charcoal flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink-indigo mx-auto"></div>
      </div>
    );
  }

  const { days } = data;

  // Extract all experiences across days
  const experiencesList: any[] = [];
  const seenIds = new Set<string>();

  days.forEach((day: any) => {
    day.itinerary_items?.forEach((item: any) => {
      const exp = item.experiences;
      if (exp && !seenIds.has(exp.id)) {
        seenIds.add(exp.id);
        experiencesList.push({
          ...exp,
          dayNum: day.day_number
        });
      }
    });
  });

  // Descriptions mapping to seeded experiences
  const expMetadata: Record<string, { desc: string; duration: string; price: string }> = {
    "e0000000-0000-0000-0000-000000000001": {
      desc: "Step into the glamorous world of movies at Southeast Asia's first and only Universal Studios theme park. Ride thrilling rollercoasters like Battlestar Galactica and explore themed zones.",
      duration: "Full Day (6-8 hours)",
      price: "₹4,800 / person"
    },
    "e0000000-0000-0000-0000-000000000002": {
      desc: "Relax in style on the sandy shores of Sentosa. Experience premium beach clubs (e.g. Rumours or Tanjong Beach Club) offering daybeds, tropical Cocktails, poolside DJs, and coastal views.",
      duration: "Half Day (3-4 hours)",
      price: "₹2,500 / person entry"
    },
    "e0000000-0000-0000-0000-000000000003": {
      desc: "Ascend to the breathtaking Sands SkyPark Observation Deck, perched 57 levels high. Marvel at the panoramic views of Marina Bay, Gardens by the Bay, and the Singapore Straits.",
      duration: "2-3 hours",
      price: "₹3,200 / person"
    },
    "e0000000-0000-0000-0000-000000000004": {
      desc: "Explore a horticultural wonderland featuring the iconic Supertree Grove, Flower Dome, and Cloud Forest. Witness the futuristic glass glasshouses and the evening garden light show.",
      duration: "3-4 hours",
      price: "₹2,800 / person"
    },
    "e0000000-0000-0000-0000-000000000005": {
      desc: "Walk Singapore's premier shopping street. Orchard Road is a shopping paradise packed with upscale luxury malls, designer flagships, and dynamic culinary hubs.",
      duration: "Half Day (3-4 hours)",
      price: "Free entry (Variable spend)"
    }
  };

  return (
    <div className="min-h-screen bg-sand text-deep-charcoal font-sans pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 text-xs font-mono text-dusk-teal">
          <Link href={`/itinerary/${itineraryId}`} className="hover:underline">
            ← Back to Itinerary Hub
          </Link>
        </div>

        <div className="flex flex-col gap-1 mb-8">
          <span className="text-xs font-bold text-clay-rose uppercase tracking-widest font-mono">
            Activity Details
          </span>
          <h1 className="text-3xl font-display font-bold text-ink-indigo">
            Curated Experiences
          </h1>
          <p className="text-sm text-dusk-teal leading-relaxed mt-1">
            Dive deeper into the details of the activities scheduled in your bespoke plan.
          </p>
        </div>

        {/* Experiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiencesList.map((exp) => {
            const meta = expMetadata[exp.id] || {
              desc: "A specially curated experience matching your Travel DNA scores & sliders.",
              duration: "Flexible",
              price: "Included"
            };

            return (
              <div
                key={exp.id}
                className="bg-white border border-border/30 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Visual Header Block */}
                <div className="h-40 bg-ink-indigo flex items-center justify-center text-white/10 font-bold font-mono text-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 to-slate-800"></div>
                  <div className="relative z-10 text-white font-display font-bold p-6 text-left w-full h-full flex flex-col justify-end">
                    <span className="text-[10px] bg-marigold text-deep-charcoal font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider w-max mb-2">
                      Day {exp.dayNum} Activity
                    </span>
                    <h3 className="text-lg font-bold line-clamp-1">{exp.name}</h3>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-dusk-teal">
                      <span>Category: {exp.category}</span>
                      <span>Cost: {exp.price_band.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-deep-charcoal/80 leading-relaxed text-left">
                      {meta.desc}
                    </p>
                  </div>

                  <div className="border-t border-border/10 pt-4 flex justify-between items-center text-[10px] text-dusk-teal/80 font-mono">
                    <div>
                      <strong>Duration:</strong> {meta.duration}
                    </div>
                    <div>
                      <strong>Est. Price:</strong> {meta.price}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
