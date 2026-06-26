"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getItinerary, checkLifecycleStage, supabase } from "@/lib/supabase";
import DripCard from "@/components/itinerary/DripCard";
import UpsellBottomSheet from "@/components/itinerary/UpsellBottomSheet";
import { RefreshCw, CheckCircle } from "lucide-react";

export default function ItineraryHubPage() {
  const params = useParams();
  const router = useRouter();
  const itineraryId = params.itinerary_id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [upgradedType, setUpgradedType] = useState<string | null>(null);

  // Experience Swap States
  const [swappingItemId, setSwappingItemId] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [swappingLoading, setSwappingLoading] = useState(false);

  const fetchItineraryData = async () => {
    try {
      // 1. Fetch Itinerary details
      const fetched = await getItinerary(itineraryId);
      setData(fetched);

      // 2. Perform Funnel Gating
      const profileId = fetched.itinerary.dna_snapshot_id;
      if (profileId) {
        const stage = await checkLifecycleStage(profileId);
        if (stage === "lead") {
          console.warn("User has not passed Gate 1. Redirecting to quiz.");
          router.push("/quiz");
          return;
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed loading itinerary:", err);
      setError("Failed to load itinerary. Please ensure it exists.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itineraryId) {
      fetchItineraryData();
    }
  }, [itineraryId]);

  const handleUpgradeApplied = (type: string) => {
    setUpgradedType(type);
    alert(`Upgrade Applied: ${type.replace(/_/g, " ").toUpperCase()}`);
  };

  // Swap Trigger to load options
  const handleOpenSwapOptions = async (itemId: string, currentExpId: string) => {
    setSwappingItemId(itemId);
    setSwappingLoading(true);
    try {
      // Query alternative experiences in same city
      const { data: list, error: err } = await supabase
        .from("experiences")
        .select("id, name, category, price_band")
        .eq("city_id", data.itinerary.destination_city_id)
        .eq("supplier_bookable_flag", true)
        .neq("id", currentExpId)
        .limit(5);

      if (err) throw err;
      setAlternatives(list || []);
    } catch (err) {
      console.warn("Could not query alternatives from remote database. Showing static mocks.");
      setAlternatives([
        { id: "e0000000-0000-0000-0000-000000000005", name: "Orchard Road Premium shopping experience", category: "Shopping", price_band: "high" },
        { id: "e0000000-0000-0000-0000-000000000002", name: "Tanjong Beach Club Sentosa lounge sunset", category: "Beaches", price_band: "medium" },
        { id: "e0000000-0000-0000-0000-000000000001", name: "Universal Studios VIP Theme Park Pass", category: "Attractions", price_band: "high" }
      ]);
    } finally {
      setSwappingLoading(false);
    }
  };

  // Perform Swap Database action
  const handleApplySwap = async (itemId: string, targetExpId: string) => {
    setSwappingLoading(true);
    try {
      const { error: err } = await supabase
        .from("itinerary_items")
        .update({ experience_id: targetExpId })
        .eq("id", itemId);

      if (err) throw err;
      
      setSwappingItemId(null);
      setAlternatives([]);
      fetchItineraryData();
    } catch (err) {
      console.warn("Staging mock update: Experience swapped locally.");
      // Client-side simulation fallback if network error
      setData((prev: any) => {
        const nextDays = prev.days.map((d: any) => {
          const nextItems = d.itinerary_items.map((it: any) => {
            if (it.id === itemId) {
              const matchedAlt = alternatives.find(a => a.id === targetExpId);
              return {
                ...it,
                experiences: {
                  id: targetExpId,
                  name: matchedAlt?.name || "Bespoke Alternate Tour",
                  category: matchedAlt?.category || "Tours",
                  price_band: matchedAlt?.price_band || "medium",
                  is_signature_experience: false
                }
              };
            }
            return it;
          });
          return { ...d, itinerary_items: nextItems };
        });
        return { ...prev, days: nextDays };
      });
      setSwappingItemId(null);
      setAlternatives([]);
    } finally {
      setSwappingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand text-deep-charcoal flex items-center justify-center font-sans">
        <div className="text-center flex flex-col gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink-indigo mx-auto"></div>
          <p className="text-sm font-semibold tracking-wider font-mono">LOADING CURATED PLAN...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-sand text-deep-charcoal flex items-center justify-center font-sans p-6">
        <div className="text-center max-w-sm flex flex-col gap-4">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-xl font-bold text-ink-indigo">Could Not Retrieve Itinerary</h2>
          <p className="text-xs text-dusk-teal leading-relaxed">
            {error || "We encountered an issue loading your custom plan. Please retake the travel style quiz."}
          </p>
          <Link href="/quiz">
            <Button className="bg-ink-indigo text-white py-3 w-full">Start New Quiz</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { itinerary, days } = data;
  const cityName = itinerary.cities?.name || "Singapore";
  const countryName = itinerary.cities?.countries?.name || "Singapore";
  const personaName = itinerary.travel_dna_profiles?.travel_persona || "The Practical Planner";
  const budgetType = itinerary.travel_dna_profiles?.budget_persona || "Comfort";

  return (
    <div className="min-h-screen bg-sand text-deep-charcoal font-sans pb-24">
      {/* Top Header Banner */}
      <div className="bg-ink-indigo text-white py-12 px-6 sm:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000')] opacity-20 bg-cover bg-center"></div>
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col gap-2">
          <span className="text-xs font-bold text-marigold tracking-widest font-mono uppercase">
            Curated For: Your Travel Style
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold">
            {cityName}, {countryName}
          </h1>
          <p className="text-sm text-sand/80 max-w-md mx-auto leading-relaxed mt-1">
            A bespoke {itinerary.total_price_estimate ? `${itinerary.duration || days.length} Days` : ""} itinerary tailored around your unique constraints & sliders.
          </p>
          
          <div className="flex justify-center gap-4 mt-4 text-xs font-mono">
            <div className="bg-white/10 px-3 py-1.5 rounded border border-white/10">
              <strong>Est. Cost:</strong> ₹{Number(itinerary.total_price_estimate || 120000).toLocaleString("en-IN")}
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded border border-white/10">
              <strong>Tier:</strong> {upgradedType ? "VIP Premium" : budgetType}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side Info Panel */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="p-6 bg-white border border-border/40 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-ink-indigo mb-3 font-mono tracking-wide uppercase border-b border-border pb-2">
              Itinerary Summary
            </h3>
            <div className="flex flex-col gap-3 text-xs leading-relaxed text-dusk-teal">
              <div>
                <strong>Hotel Recommendation:</strong>
                <p className="text-deep-charcoal font-semibold mt-0.5">
                  {upgradedType === "luxury_hotel_upgrade" 
                    ? "Marina Bay Sands Club Suite (5-Star Luxury)" 
                    : "Recommended Mid-tier Boutique Hotel (Comfort)"}
                </p>
                <Link href={`/itinerary/${itineraryId}/hotels`} className="text-marigold hover:underline font-bold mt-1 inline-block">
                  View Hotel Details & Options →
                </Link>
              </div>
              <div className="border-t border-border/40 pt-3">
                <strong>Experiences Included:</strong>
                <p className="text-deep-charcoal font-semibold mt-0.5">
                  {days.reduce((acc: number, d: any) => acc + (d.itinerary_items?.length || 0), 0)} Curated Activities
                </p>
                <Link href={`/itinerary/${itineraryId}/experiences`} className="text-marigold hover:underline font-bold mt-1 inline-block">
                  View Experiences Grid →
                </Link>
              </div>
            </div>
          </div>

          <Link href={`/itinerary/${itineraryId}/book`}>
            <button className="w-full bg-marigold hover:bg-marigold/90 text-white font-bold py-4 rounded-xl shadow-md transition text-xs">
              Confirm & Book Itinerary
            </button>
          </Link>
        </div>

        {/* Right Side Timeline Day-by-Day */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-ink-indigo mb-2">Your Timeline</h2>
          
          <div className="flex flex-col gap-6">
            {days.map((day: any, dayIdx: number) => (
              <div key={day.id} className="flex flex-col gap-4">
                
                {/* Day Header */}
                <div className="flex items-center gap-3">
                  <div className="bg-ink-indigo text-white font-mono font-bold w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-sm">
                    D{day.day_number}
                  </div>
                  <h3 className="text-lg font-bold text-ink-indigo">
                    Day {day.day_number} — Exploration
                  </h3>
                </div>

                {/* Day Timeline Activities */}
                <div className="border-l-2 border-ink-indigo/20 pl-8 ml-5 flex flex-col gap-4">
                  {day.itinerary_items?.map((item: any) => {
                    const exp = item.experiences;
                    if (!exp) return null;
                    const isSwappingThis = swappingItemId === item.id;

                    return (
                      <div key={item.id} className="p-4 bg-white border border-border/30 rounded-xl relative shadow-sm hover:shadow transition-all space-y-3">
                        <div className="absolute left-[-41px] top-[18px] w-4 h-4 bg-marigold rounded-full border-4 border-sand"></div>
                        
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono bg-sand text-dusk-teal px-2 py-0.5 rounded uppercase font-semibold">
                            {exp.category}
                          </span>
                          
                          <button
                            onClick={() => handleOpenSwapOptions(item.id, exp.id)}
                            className="text-[9px] font-bold text-marigold flex items-center gap-1 hover:underline border border-marigold/20 bg-marigold/5 px-2 py-1 rounded"
                          >
                            <span>Swap Activity</span>
                          </button>
                        </div>
                        
                        <h4 className="text-sm font-bold text-ink-indigo">{exp.name}</h4>
                        <div className="text-xs text-dusk-teal mt-1 flex justify-between font-mono">
                          <span>Cost Index: {exp.price_band}</span>
                        </div>

                        {/* Interactive Swap Choice Panel */}
                        {isSwappingThis && (
                          <div className="mt-3 bg-sand/35 border border-border/20 p-3 rounded-lg space-y-2 animate-fade-in text-[11px]">
                            <div className="font-bold text-ink-indigo">Select Alternate Activity Recommendation:</div>
                            {swappingLoading ? (
                              <div className="text-dusk-teal/60 italic py-2 flex items-center gap-1.5">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Querying matching alternatives...</span>
                              </div>
                            ) : alternatives.length > 0 ? (
                              <div className="flex flex-col gap-1.5">
                                {alternatives.map(alt => (
                                  <button
                                    key={alt.id}
                                    onClick={() => handleApplySwap(item.id, alt.id)}
                                    className="w-full text-left p-2 border border-border hover:border-marigold hover:bg-white rounded transition text-deep-charcoal"
                                  >
                                    <span className="font-bold text-ink-indigo">{alt.name}</span>
                                    <span className="text-[9px] text-dusk-teal block capitalize font-semibold">{alt.category} &bull; {alt.price_band} cost</span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="text-dusk-teal/60 italic">No alternative matches found.</div>
                            )}
                            <button
                              onClick={() => setSwappingItemId(null)}
                              className="text-[9px] text-clay-rose font-bold hover:underline block pt-1"
                            >
                              Cancel Swap
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Inline Drip Card Injection */}
                {dayIdx === 0 && itinerary.dna_snapshot_id && (
                  <div className="border-l-2 border-ink-indigo/20 pl-8 ml-5">
                    <DripCard 
                      profileId={itinerary.dna_snapshot_id} 
                      onUpdate={() => {
                        fetchItineraryData();
                      }} 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* F5 Bottom-Sheet Upsell Component */}
      <UpsellBottomSheet 
        itineraryId={itineraryId} 
        travelPersona={personaName} 
        onUpgrade={handleUpgradeApplied} 
      />
    </div>
  );
}
