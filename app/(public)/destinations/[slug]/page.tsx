"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDestinationBySlug, City, Country, HotelCategory } from "@/lib/supabase";

import imageManifest from "@/public/images/MANIFEST.json";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function DestinationDetailPage({ params }: Props) {
  const { slug } = use(params);
  const [data, setData] = useState<{
    city: City | undefined;
    country: Country | undefined;
    hotels: HotelCategory[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDestinationBySlug(slug).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand text-dusk-teal font-mono text-xs">
        Loading destination details...
      </div>
    );
  }

  const { city, country, hotels } = data || {};

  if (!city) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-sand text-deep-charcoal text-center">
        <h1 className="text-3xl font-display font-bold text-ink-indigo">Destination Not Found</h1>
        <p className="text-dusk-teal text-sm mt-2 max-w-sm">
          We currently do not have supplier coverage for the destination &quot;{slug}&quot;.
        </p>
        <Link href="/destinations">
          <Button className="mt-6 bg-ink-indigo text-white">Back to Destinations</Button>
        </Link>
      </div>
    );
  }

  // Get image path from manifest
  const manifestCity = (imageManifest.cities as any)[city.id];
  const imagePath = manifestCity?.images?.hero || "/images/placeholder-hero.jpg";

  return (
    <div className="flex flex-col min-h-screen p-8 bg-sand">
      <main className="max-w-4xl mx-auto w-full flex flex-col gap-8">
        <div className="flex items-center gap-2 text-xs text-dusk-teal font-mono">
          <Link href="/destinations" className="hover:underline">
            Destinations
          </Link>
          <span>/</span>
          <span className="text-ink-indigo font-bold">{city.name}</span>
        </div>

        {/* Hero Banner Image */}
        <div className="relative w-full h-[350px] overflow-hidden rounded-3xl border border-border/20 shadow-sm bg-sand/20">
          <img 
            src={imagePath} 
            alt={city.name} 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Destination Header card */}
        <div
          className="theme-surface bg-white p-8 border border-border/40 flex flex-col gap-6"
          style={{
            borderRadius: "var(--radius)",
            boxShadow: "var(--theme-shadow)",
          }}
        >
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-clay-rose uppercase tracking-widest font-mono">
              {country?.region || "Southeast Asia"}
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-ink-indigo leading-tight">
              Curating {city.name}
            </h1>
            <p className="text-dusk-teal text-sm leading-relaxed max-w-2xl">
              Decode the weather profile, visa policy, and hotel rates in {city.name} to customize your Travel DNA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/40 pt-6">
            {/* Weather & Visa columns */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-display font-bold text-ink-indigo">Travel Profile</h3>
              <div className="flex flex-col gap-3 text-sm text-deep-charcoal leading-relaxed bg-sand/30 p-4 rounded-xl font-mono">
                <div>
                  <strong>Weather Type:</strong> {city.weather_profile_json.profile}
                </div>
                <div>
                  <strong>Best Months:</strong> {city.weather_profile_json.best_months.join(", ")}
                </div>
                <div>
                  <strong>Visa policy:</strong> {country?.visa_policy_default}
                </div>
                <div>
                  <strong>Currency:</strong> {country?.currency}
                </div>
              </div>
            </div>

            {/* Hotel Tier Pricing */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-display font-bold text-ink-indigo">Hotel Category Availability</h3>
              <div className="flex flex-col gap-2">
                {hotels && hotels.length > 0 ? (
                  hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="flex justify-between items-center text-xs border-b border-border/30 pb-2"
                    >
                      <span className="font-semibold text-deep-charcoal capitalize">
                        {hotel.tier.replace("_", " ")}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-dusk-teal font-mono">
                          Avg: {hotel.avg_price_band_per_night} {country?.currency || "INR"}/night
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                            hotel.supplier_availability_flag
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {hotel.supplier_availability_flag ? "Available" : "Limited"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-dusk-teal italic">No hotel pricing info available.</div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-dusk-teal max-w-sm">
              Use this destination as a seed parameter for your Travel DNA quiz flow.
            </span>
            <Link href={`/quiz?destination=${slug}`} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-marigold hover:bg-marigold/90 text-white font-semibold py-5 px-8 rounded-lg shadow-md transition-all duration-200">
                Start Quiz for {city.name}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
