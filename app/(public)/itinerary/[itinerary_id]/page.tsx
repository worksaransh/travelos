"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getItinerary, supabase } from "@/lib/supabase";
import DripCard from "@/components/itinerary/DripCard";
import UpsellBottomSheet from "@/components/itinerary/UpsellBottomSheet";
import ItineraryRouteMap from "@/components/itinerary/ItineraryRouteMap";
import { RefreshCw } from "lucide-react";

export default function ItineraryHubPage() {
  const params = useParams();
  const router = useRouter();
  const itineraryId = params.itinerary_id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [upgradedType, setUpgradedType] = useState<string | null>(null);

  // Active day tracker for map highlighting
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Experience Swap States
  const [swappingItemId, setSwappingItemId] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [swappingLoading, setSwappingLoading] = useState(false);

  // Voting State
  const [votes, setVotes] = useState<Record<string, { upvotes: number; downvotes: number; userVote?: 'upvote' | 'downvote' }>>({});

  const getVoterSessionId = () => {
    if (typeof window === "undefined") return "server-session";
    let sid = localStorage.getItem("voter_session_id");
    if (!sid) {
      sid = "session_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem("voter_session_id", sid);
    }
    return sid;
  };

  const fetchVotes = async (itemIds: string[]) => {
    try {
      if (itemIds.length === 0) return;
      
      const { data: voteRows, error } = await supabase
        .from("itinerary_item_votes")
        .select("itinerary_item_id, vote_type, voter_session_id")
        .in("itinerary_item_id", itemIds);
         
      if (error) throw error;
      
      const localSessionId = getVoterSessionId();
      const newVotesMap: typeof votes = {};
      
      itemIds.forEach((itemId: string) => {
        newVotesMap[itemId] = { upvotes: 0, downvotes: 0 };
      });
      
      voteRows?.forEach((row: any) => {
        if (!newVotesMap[row.itinerary_item_id]) {
          newVotesMap[row.itinerary_item_id] = { upvotes: 0, downvotes: 0 };
        }
        if (row.vote_type === "upvote") {
          newVotesMap[row.itinerary_item_id].upvotes++;
        } else if (row.vote_type === "downvote") {
          newVotesMap[row.itinerary_item_id].downvotes++;
        }
        if (row.voter_session_id === localSessionId) {
          newVotesMap[row.itinerary_item_id].userVote = row.vote_type;
        }
      });
      
      setVotes(newVotesMap);
    } catch (err) {
      console.warn("Failed fetching votes:", err);
    }
  };

  const castVote = async (itemId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const sid = getVoterSessionId();
      
      // Enforce vote insertion. Unique constraint on (itinerary_item_id, voter_session_id)
      const { error } = await supabase
        .from("itinerary_item_votes")
        .insert({
          itinerary_item_id: itemId,
          voter_session_id: sid,
          vote_type: voteType
        });
        
      if (error) throw error;
      
      // Re-fetch votes for items
      const itemIds = data?.days?.flatMap((d: any) => d.itinerary_items?.map((it: any) => it.id) || []) || [];
      fetchVotes(itemIds);
    } catch (err: any) {
      console.warn("Failed to cast vote:", err);
      alert("You have already voted for this experience choice!");
    }
  };

  const fetchItineraryData = async () => {
    try {
      // 1. Fetch Itinerary details
      const fetched = await getItinerary(itineraryId);
      setData(fetched);

      // 2. Fetch Votes
      const itemIds = fetched.days?.flatMap((d: any) => d.itinerary_items?.map((it: any) => it.id) || []) || [];
      fetchVotes(itemIds);

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
                <Link href={`/itinerary/${itineraryId}/hotels`} className="text-amber-800 hover:text-amber-950 font-bold mt-1 inline-block hover:underline">
                  View Hotel Details & Options →
                </Link>
              </div>
              <div className="border-t border-border/40 pt-3">
                <strong>Experiences Included:</strong>
                <p className="text-deep-charcoal font-semibold mt-0.5">
                  {days.reduce((acc: number, d: any) => acc + (d.itinerary_items?.length || 0), 0)} Curated Activities
                </p>
                <Link href={`/itinerary/${itineraryId}/experiences`} className="text-amber-800 hover:text-amber-950 font-bold mt-1 inline-block hover:underline">
                  View Experiences Grid →
                </Link>
              </div>
            </div>
          </div>

          {/* Interactive Route Map */}
          <ItineraryRouteMap 
            days={days}
            activeDayIndex={activeDayIndex}
            cityName={cityName}
          />

          {/* Public Sharing Panel */}
          <div className="p-6 bg-white border border-border/40 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-ink-indigo border-b border-border pb-2 tracking-wide uppercase font-mono">
              Share Trip
            </h3>
            <p className="text-[10px] text-dusk-teal leading-relaxed">
              Invite friends to view this itinerary and vote on experience choices!
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Itinerary link copied to clipboard!");
                }}
                className="flex-1 min-w-[70px] py-2 px-3 border border-border/60 hover:bg-sand/30 text-ink-indigo rounded-lg text-[10px] font-bold text-center transition focus:ring-1 focus:ring-marigold"
              >
                Copy Link
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=Check%20out%20my%20travel%20itinerary!%20${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition focus:ring-1 focus:ring-marigold"
                title="Share to WhatsApp"
              >
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition focus:ring-1 focus:ring-marigold"
                title="Share to Facebook"
              >
                Facebook
              </a>
            </div>
          </div>

          <Link href={`/itinerary/${itineraryId}/bundle`}>
            <button className="w-full bg-marigold hover:bg-marigold/90 text-white font-bold py-4 rounded-xl shadow-md transition text-xs focus:ring-2 focus:ring-marigold focus:outline-none">
              Customize & Book Bundle →
            </button>
          </Link>
        </div>

        {/* Right Side Timeline Day-by-Day */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-ink-indigo mb-2">Your Timeline</h2>
          
          <div className="flex flex-col gap-6">
            {days.map((day: any, dayIdx: number) => {
              const isActive = activeDayIndex === dayIdx;
              return (
                <div key={day.id} className="flex flex-col gap-4">
                  
                  {/* Day Header */}
                  <div 
                    onClick={() => setActiveDayIndex(dayIdx)}
                    className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all ${
                      isActive 
                        ? "bg-marigold/10 border border-marigold/20 shadow-xs" 
                        : "hover:bg-sand/35"
                    }`}
                  >
                    <div className="bg-ink-indigo text-white font-mono font-bold w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-sm">
                      D{day.day_number}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink-indigo">
                        Day {day.day_number} — Exploration
                      </h3>
                      {isActive && (
                        <span className="text-[9px] font-mono text-amber-900 font-semibold uppercase">
                          Showing on Map
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Day Timeline Activities */}
                  <div className="border-l-2 border-ink-indigo/20 pl-8 ml-5 flex flex-col gap-4">
                    {day.itinerary_items?.map((item: any) => {
                      const exp = item.experiences;
                      if (!exp) return null;
                      const isSwappingThis = swappingItemId === item.id;
                      const itemVotes = votes[item.id] || { upvotes: 0, downvotes: 0 };

                      return (
                        <div key={item.id} className="p-4 bg-white border border-border/30 rounded-xl relative shadow-sm hover:shadow transition-all space-y-3">
                          <div className="absolute left-[-41px] top-[18px] w-4 h-4 bg-marigold rounded-full border-4 border-sand"></div>
                          
                          <div className="flex justify-between items-start border-b border-border/10 pb-1.5">
                            <span className="text-[9px] font-mono bg-sand/60 text-dusk-teal px-2 py-0.5 rounded border border-border/20 uppercase font-semibold">
                              {exp.category}
                            </span>
                            <span className="text-[10px] font-mono font-semibold text-dusk-teal">
                              Cost Index: {exp.price_band}
                            </span>
                          </div>
                          
                          <h4 className="text-sm font-bold text-ink-indigo">{exp.name}</h4>
                          
                          {/* Vote buttons & Swap buttons Row */}
                          <div className="flex justify-between items-center pt-2 border-t border-border/10 text-xs">
                            {/* Voting HUD */}
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-dusk-teal font-mono uppercase">
                                Verdict:
                              </span>
                              <button
                                onClick={() => castVote(item.id, "upvote")}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] transition font-mono font-semibold ${
                                  itemVotes.userVote === "upvote"
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                    : "border-border/60 hover:bg-sand/35 text-deep-charcoal focus:ring-1 focus:ring-marigold"
                                }`}
                                title="Upvote this activity"
                                aria-label="Upvote this activity"
                              >
                                <span>👍</span>
                                <span>{itemVotes.upvotes}</span>
                              </button>
                              <button
                                onClick={() => castVote(item.id, "downvote")}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] transition font-mono font-semibold ${
                                  itemVotes.userVote === "downvote"
                                    ? "bg-red-50 border-red-200 text-red-800"
                                    : "border-border/60 hover:bg-sand/35 text-deep-charcoal focus:ring-1 focus:ring-marigold"
                                }`}
                                title="Downvote this activity"
                                aria-label="Downvote this activity"
                              >
                                <span>👎</span>
                                <span>{itemVotes.downvotes}</span>
                              </button>
                            </div>

                            <button
                              onClick={() => handleOpenSwapOptions(item.id, exp.id)}
                              className="text-[10px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 hover:underline border border-amber-800/20 bg-amber-800/5 px-2.5 py-1 rounded-lg transition focus:ring-1 focus:ring-marigold"
                              aria-label={`Swap experience ${exp.name}`}
                            >
                              <span>Swap Activity</span>
                            </button>
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
              );
            })}
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
