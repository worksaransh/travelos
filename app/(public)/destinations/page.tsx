"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDestinations, City, Country } from "@/lib/supabase";

export default function DestinationsPage() {
  const [data, setData] = useState<{ countries: Country[]; cities: City[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDestinations().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen p-8 bg-sand">
      <main className="max-w-6xl mx-auto w-full flex flex-col gap-10">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-ink-indigo">
            Curated Destinations
          </h1>
          <p className="text-dusk-teal text-sm leading-relaxed">
            Browse active destinations backed by verified local supplier coverage and curated travel products.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-dusk-teal font-mono text-xs">
            Loading destinations...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.cities.map((city) => {
              const country = data.countries.find((c) => c.id === city.country_id);
              const slug = city.name.toLowerCase();

              return (
                <div
                  key={city.id}
                  className="theme-surface bg-white overflow-hidden border border-border/40 rounded-3xl transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between"
                  style={{
                    borderRadius: "var(--radius)",
                    boxShadow: "var(--theme-shadow)",
                  }}
                >
                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-clay-rose uppercase tracking-widest font-mono">
                        {country?.region || "Region"}
                      </span>
                      <h2 className="text-2xl font-display font-bold text-ink-indigo">
                        {city.name}, {country?.name}
                      </h2>
                    </div>

                    <div className="flex flex-col gap-2 text-xs text-deep-charcoal/80 bg-sand/30 p-4 rounded-xl font-mono">
                      <div>
                        <span className="font-bold">Visa Ease:</span> {country?.visa_policy_default || "Check Policy"}
                      </div>
                      <div>
                        <span className="font-bold">Currency:</span> {country?.currency || "Local"}
                      </div>
                      <div>
                        <span className="font-bold">Best Months:</span> {city.weather_profile_json.best_months.join(", ")}
                      </div>
                      <div>
                        <span className="font-bold">Cost Index:</span> {city.avg_cost_index} / 100
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-border/40 flex justify-end">
                    <Link href={`/destinations/${slug}`} className="w-full">
                      <Button className="w-full bg-ink-indigo hover:bg-ink-indigo/90 text-white font-medium">
                        View Destination details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
