"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getItinerary } from "@/lib/supabase";

export default function HotelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const itineraryId = params.itinerary_id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedTier, setSelectedTier] = useState<string>("4_star");

  useEffect(() => {
    if (itineraryId) {
      getItinerary(itineraryId).then((fetched) => {
        setData(fetched);
        if (fetched.itinerary?.package_tier === "Premium") {
          setSelectedTier("5_star");
        } else {
          setSelectedTier("4_star");
        }
        setLoading(false);
      }).catch((err) => {
        console.error("Failed loading hotel options:", err);
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

  const hotelTiers = [
    {
      id: "3_star",
      name: "Comfort Boutique",
      price: "₹6,000 / night",
      desc: "Charming, highly-rated boutique properties nestled in culturally rich neighborhoods like Kampong Glam.",
      features: ["Complimentary Wi-Fi", "Daily Local Breakfast", "Walkable to MRT Station"],
      available: true
    },
    {
      id: "4_star",
      name: "Premium Business & Leisure",
      price: "₹12,000 / night",
      desc: "Modern hotels located in central Hubs (e.g. Novena, Sentosa fringes) with outdoor pools, fitness centers, and high amenities.",
      features: ["Infinity Rooftop Pool", "High-speed Wi-Fi", "Buffet Breakfast", "24/7 Concierge"],
      available: true
    },
    {
      id: "5_star",
      name: "Luxury Signature Hotels",
      price: "₹22,000 / night",
      desc: "World-famous landmarks like Marina Bay Sands or Swissôtel The Stamford, featuring premier skyline view rooms.",
      features: ["Access to Famous Infinity Pool", "Sky Lounge Access", "Spa & Wellness Center", "Bespoke Turndown Service"],
      available: true
    },
    {
      id: "luxury",
      name: "Ultra-Luxury Villas",
      price: "₹35,000 / night",
      desc: "Exclusive beachfront luxury retreats (e.g. Capella Sentosa) offering private butler service, private pools, and high secrecy.",
      features: ["Private Plunge Pool", "Dedicated 24h Personal Butler", "Exclusive Beach Club Access", "Private Yacht Charter Options"],
      available: false // seeded as supplier_availability_flag = false
    }
  ];

  return (
    <div className="min-h-screen bg-sand text-deep-charcoal font-sans pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 text-xs font-mono text-dusk-teal">
          <Link href={`/itinerary/${itineraryId}`} className="hover:underline">
            ← Back to Itinerary Hub
          </Link>
        </div>

        <div className="flex flex-col gap-1 mb-8">
          <span className="text-xs font-bold text-clay-rose uppercase tracking-widest font-mono">
            Hotel Curation
          </span>
          <h1 className="text-3xl font-display font-bold text-ink-indigo">
            Where You'll Stay in Singapore
          </h1>
          <p className="text-sm text-dusk-teal leading-relaxed mt-1">
            Choose the perfect accommodation tier matching your budget and lifestyle preferences.
          </p>
        </div>

        {/* Selected Tier Banner */}
        <div className="mb-8 p-6 bg-white border border-marigold/30 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] bg-marigold/10 text-marigold font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-max">
              Selected Vibe
            </span>
            <h3 className="text-lg font-bold text-ink-indigo">
              {hotelTiers.find((t) => t.id === selectedTier)?.name}
            </h3>
            <p className="text-xs text-dusk-teal">
              Price estimate: <strong className="text-deep-charcoal">{hotelTiers.find((t) => t.id === selectedTier)?.price}</strong>
            </p>
          </div>
          <Link href={`/itinerary/${itineraryId}/book`}>
            <Button className="bg-ink-indigo hover:bg-ink-indigo/90 text-white font-bold py-3 px-6 rounded-xl">
              Proceed to Book
            </Button>
          </Link>
        </div>

        {/* Tier Grid Selection */}
        <div className="flex flex-col gap-6">
          {hotelTiers.map((tier) => (
            <div
              key={tier.id}
              onClick={() => {
                if (tier.available) setSelectedTier(tier.id);
              }}
              className={`p-6 bg-white border rounded-2xl shadow-sm transition-all duration-300 relative flex flex-col gap-3 ${
                !tier.available 
                  ? "opacity-60 cursor-not-allowed border-border/40" 
                  : "cursor-pointer hover:border-marigold"
              } ${
                selectedTier === tier.id 
                  ? "border-marigold ring-2 ring-marigold/20" 
                  : "border-border/30"
              }`}
            >
              {selectedTier === tier.id && (
                <div className="absolute top-4 right-4 bg-marigold text-white text-xs font-mono font-bold px-2 py-1 rounded">
                  SELECTED
                </div>
              )}
              {!tier.available && (
                <div className="absolute top-4 right-4 bg-rose-500 text-white text-xs font-mono font-bold px-2 py-1 rounded">
                  FULLY BOOKED
                </div>
              )}

              <div className="flex flex-col gap-1 text-left">
                <h4 className="text-base font-bold text-ink-indigo">{tier.name}</h4>
                <div className="text-sm font-mono font-bold text-marigold">{tier.price}</div>
              </div>

              <p className="text-xs text-dusk-teal leading-relaxed text-left">
                {tier.desc}
              </p>

              <div className="border-t border-border/20 pt-3 mt-1 flex flex-wrap gap-2">
                {tier.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-sand text-dusk-teal px-2 py-0.5 rounded-full font-semibold font-mono"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
