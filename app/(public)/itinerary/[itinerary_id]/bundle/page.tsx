"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getItinerary, supabase } from "@/lib/supabase";
import { 
  MapPin, Hotel, Activity, Plus, CheckSquare, DollarSign, 
  ArrowRight, ArrowLeft, Check, Sparkles, Shield, Wifi, 
  Camera, Plane, ChevronRight, RefreshCw, Star, Info
} from "lucide-react";

interface UpgradeOption {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: any;
}

const UPGRADE_OPTIONS: UpgradeOption[] = [
  {
    id: "airport_transfer",
    name: "Private Airport Transfer (Round-trip)",
    price: 5000,
    description: "Meet & greet at arrival hall, premium private car direct to hotel",
    icon: Plane
  },
  {
    id: "travel_insurance",
    name: "Premium Travel Insurance",
    price: 2500,
    description: "Coverage up to $100k including trip cancellation & medical emergency",
    icon: Shield
  },
  {
    id: "pocket_wifi",
    name: "Unlimited 4G Pocket Wi-Fi",
    price: 1200,
    description: "Pick up at airport, shareable up to 5 devices with high speed connectivity",
    icon: Wifi
  },
  {
    id: "photographer",
    name: "Professional Vacation Photographer",
    price: 8000,
    description: "2-hour curated photoshoot at iconic sights with 30 edited digital prints",
    icon: Camera
  },
  {
    id: "vip_lounge",
    name: "VIP Airport Plaza Premium Lounge Access",
    price: 4000,
    description: "Complimentary gourmet buffet, shower facility, and quiet rest zone",
    icon: Sparkles
  }
];

const HOTEL_TIERS = [
  {
    id: "comfort",
    name: "3-Star Comfort Boutique",
    priceDiffPerNight: 0,
    desc: "Charming, boutique hotels located close to public transit.",
    features: ["Complimentary Wi-Fi", "Daily Local Breakfast", "Walkable to MRT/Metro"]
  },
  {
    id: "premium",
    name: "4-Star Premium Business & Leisure",
    priceDiffPerNight: 6000,
    desc: "Modern hotels in central locations with pools and full concierge services.",
    features: ["Infinity Rooftop Pool", "High-speed Wi-Fi", "Buffet Breakfast", "24/7 Concierge"]
  },
  {
    id: "signature",
    name: "5-Star Luxury Landmark",
    priceDiffPerNight: 16000,
    desc: "World-class hospitality, skyline views, and premium amenities.",
    features: ["Access to Famous Pools", "Executive Club Lounge Access", "Spa & Wellness Center"]
  },
  {
    id: "luxury",
    name: "Ultra-Luxury Private Villas",
    priceDiffPerNight: 29000,
    desc: "Bespoke beachfront properties with personal butler service.",
    features: ["Private Plunge Pool", "Dedicated 24h Personal Butler", "Exclusive Beach Club Access"]
  }
];

export default function BundleBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const itineraryId = params.itinerary_id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  // Stepper state
  const [activeStep, setActiveStep] = useState<number>(0);
  const steps = [
    { label: "Destination", description: "Review destination & details", icon: MapPin },
    { label: "Accommodation", description: "Select hotel tier", icon: Hotel },
    { label: "Experiences", description: "Swap daily activities", icon: Activity },
    { label: "Add-Ons", description: "Select extra upgrades", icon: Plus },
    { label: "Summary", description: "Finalize & book bundle", icon: DollarSign }
  ];

  // Configuration values
  const [selectedHotelTier, setSelectedHotelTier] = useState<string>("comfort");
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([]);
  
  // Experience Swap States
  const [swappingItemId, setSwappingItemId] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [swappingLoading, setSwappingLoading] = useState(false);

  // Load Itinerary Details
  const fetchItineraryData = async () => {
    try {
      const fetched = await getItinerary(itineraryId);
      setData(fetched);
      
      const rawTier = (fetched.itinerary?.package_tier || "comfort").toLowerCase();
      if (HOTEL_TIERS.some(t => t.id === rawTier)) {
        setSelectedHotelTier(rawTier);
      } else {
        setSelectedHotelTier("comfort");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Failed loading itinerary for bundle:", err);
      setError("Failed to retrieve itinerary data. Please verify if it exists.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itineraryId) {
      fetchItineraryData();
    }
  }, [itineraryId]);

  // Handle hotel tier selection
  const selectHotel = (tierId: string) => {
    setSelectedHotelTier(tierId);
  };

  // Toggle upgrades selection
  const toggleUpgrade = (upgradeId: string) => {
    setSelectedUpgrades(prev => 
      prev.includes(upgradeId) 
        ? prev.filter(id => id !== upgradeId)
        : [...prev, upgradeId]
    );
  };

  // Query alternative experiences in same city
  const handleOpenSwapOptions = async (itemId: string, currentExpId: string) => {
    setSwappingItemId(itemId);
    setSwappingLoading(true);
    try {
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
      console.warn("Using mock alternative experiences fallback.");
      setAlternatives([
        { id: "e0000000-0000-0000-0000-000000000005", name: "Premium Gardens & Cloud Forest Tour", category: "Nature", price_band: "medium" },
        { id: "e0000000-0000-0000-0000-000000000002", name: "Tanjong Beach Club Sentosa lounge sunset", category: "Beaches", price_band: "medium" },
        { id: "e0000000-0000-0000-0000-000000000001", name: "Universal Studios VIP Theme Park Pass", category: "Theme Parks", price_band: "high" }
      ]);
    } finally {
      setSwappingLoading(false);
    }
  };

  // Apply swapped experience
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
      console.warn("Staged experience swap locally.");
      setData((prev: any) => {
        const nextDays = prev.days.map((d: any) => {
          const nextItems = d.itinerary_items.map((it: any) => {
            if (it.id === itemId) {
              const matchedAlt = alternatives.find(a => a.id === targetExpId);
              return {
                ...it,
                experiences: {
                  id: targetExpId,
                  name: matchedAlt?.name || "Bespoke Alternate Experience",
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

  // Pricing Calculations
  const basePrice = data ? Number(data.itinerary?.total_price_estimate || 120000) : 120000;
  const durationDays = data ? data.days?.length || 5 : 5;
  const hotelCostAdjustment = HOTEL_TIERS.find(t => t.id === selectedHotelTier)!.priceDiffPerNight * (durationDays - 1);
  const upgradesCost = selectedUpgrades.reduce((sum, upgradeId) => {
    const upgrade = UPGRADE_OPTIONS.find(u => u.id === upgradeId);
    return sum + (upgrade ? upgrade.price : 0);
  }, 0);
  const finalTotalCost = basePrice + hotelCostAdjustment + upgradesCost;

  // Handle Final Submission & Save
  const handleFinalizeAndProceed = async () => {
    setLoading(true);
    try {
      const { error: err } = await supabase
        .from("itineraries")
        .update({ 
          package_tier: selectedHotelTier.toUpperCase(),
          total_price_estimate: finalTotalCost
        })
        .eq("id", itineraryId);

      if (err) throw err;
      router.push(`/itinerary/${itineraryId}/book`);
    } catch (err) {
      console.warn("Simulated checkout intent redirect.");
      router.push(`/itinerary/${itineraryId}/book`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand text-deep-charcoal flex items-center justify-center font-sans">
        <div className="text-center flex flex-col gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink-indigo mx-auto"></div>
          <p className="text-sm font-semibold tracking-wider font-mono">ASSEMBLING YOUR BUNDLE...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-sand text-deep-charcoal flex items-center justify-center font-sans p-6">
        <div className="text-center max-w-sm flex flex-col gap-4">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-xl font-bold text-ink-indigo">Bundle Builder Error</h2>
          <p className="text-xs text-dusk-teal leading-relaxed">{error}</p>
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
  const travelPersona = itinerary.travel_dna_profiles?.travel_persona || "The Practical Planner";
  const budgetPersona = itinerary.travel_dna_profiles?.budget_persona || "Comfort";

  return (
    <div className="min-h-screen bg-sand text-deep-charcoal font-sans pb-24">
      {/* Header Banner */}
      <div className="bg-ink-indigo text-white py-10 px-6 sm:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000')] opacity-15 bg-cover bg-center"></div>
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-2">
          <span className="text-[10px] font-bold text-marigold tracking-widest font-mono uppercase">
            Bespoke Customizer
          </span>
          <h1 className="text-3xl font-display font-bold">
            Interactive Bundle Builder
          </h1>
          <p className="text-xs text-sand/80 max-w-md mx-auto leading-relaxed">
            Customize your trip to {cityName}, {countryName} step-by-step. Toggle accommodations, swaps activities, select premium services, and watch values compute live.
          </p>
        </div>
      </div>

      {/* Stepper Pipeline Indicators */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white border border-border/40 rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = activeStep > idx;
              const isActive = activeStep === idx;
              
              return (
                <div key={idx} className="flex items-center gap-3 w-full md:w-auto">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-mono text-xs font-bold transition-all duration-300 ${
                    isCompleted 
                      ? "bg-emerald-500 text-white" 
                      : isActive 
                        ? "bg-marigold text-white shadow-md shadow-marigold/10" 
                        : "bg-sand text-dusk-teal"
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="text-left">
                    <div className={`text-xs font-bold ${isActive ? "text-ink-indigo" : "text-dusk-teal"}`}>
                      {step.label}
                    </div>
                    <div className="text-[10px] text-dusk-teal/60 font-medium hidden lg:block">
                      {step.description}
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-dusk-teal/30 hidden md:block ml-auto lg:ml-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Active Configurator Form Area */}
          <div className="lg:col-span-2 bg-white border border-border/40 rounded-2xl shadow-sm overflow-hidden p-6 md:p-8 min-h-[420px] transition-all">
            
            {/* STEP 1: DESTINATION PREVIEW */}
            {activeStep === 0 && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="flex flex-col gap-1 border-b border-border/20 pb-4">
                  <span className="text-[10px] font-bold text-clay-rose uppercase tracking-widest font-mono">Step 1 of 5</span>
                  <h2 className="text-xl font-bold text-ink-indigo font-display">Verify Destination & Baseline Context</h2>
                </div>
                
                <div className="relative h-48 rounded-xl overflow-hidden shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000" 
                    alt={cityName} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 z-20 text-white flex flex-col gap-0.5">
                    <span className="text-[9px] bg-marigold text-ink-indigo px-2 py-0.5 rounded font-mono font-bold uppercase w-max tracking-wide">
                      CURATED GETAWAY
                    </span>
                    <h3 className="text-xl font-bold font-display">{cityName}, {countryName}</h3>
                    <p className="text-[10px] text-sand/80">Tailored custom-built package matching travel style dimensions</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-sand/20 border border-border/30 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] text-dusk-teal/80 font-semibold font-mono uppercase">Travel Persona</span>
                    <span className="text-xs font-bold text-ink-indigo">{travelPersona}</span>
                  </div>
                  <div className="p-4 bg-sand/20 border border-border/30 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] text-dusk-teal/80 font-semibold font-mono uppercase">Budget Persona</span>
                    <span className="text-xs font-bold text-ink-indigo">{budgetPersona}</span>
                  </div>
                  <div className="p-4 bg-sand/20 border border-border/30 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] text-dusk-teal/80 font-semibold font-mono uppercase">Duration Selected</span>
                    <span className="text-xs font-bold text-ink-indigo">{durationDays} Days / {durationDays - 1} Nights</span>
                  </div>
                </div>

                <div className="bg-sand/10 border border-border/20 p-4 rounded-xl text-xs text-dusk-teal leading-relaxed">
                  <div className="flex gap-2 items-start">
                    <Info className="w-4 h-4 text-marigold shrink-0 mt-0.5" />
                    <div>
                      <strong>Why this works:</strong> The matched experiences have been filtered against safety filters (excluding adults-only locations for families) and sorted to optimize engagement scores mapped from your specific sliders.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: HOTEL SELECTOR */}
            {activeStep === 1 && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="flex flex-col gap-1 border-b border-border/20 pb-4">
                  <span className="text-[10px] font-bold text-clay-rose uppercase tracking-widest font-mono">Step 2 of 5</span>
                  <h2 className="text-xl font-bold text-ink-indigo font-display">Select Accommodation Tier</h2>
                </div>

                <p className="text-xs text-dusk-teal leading-relaxed">
                  Decide on the style and category of your stay. The price diff integrates automatically based on the number of nights ({durationDays - 1} Nights).
                </p>

                <div className="flex flex-col gap-4">
                  {HOTEL_TIERS.map(tier => {
                    const totalDiff = tier.priceDiffPerNight * (durationDays - 1);
                    const isSelected = selectedHotelTier === tier.id;
                    
                    return (
                      <div 
                        key={tier.id}
                        onClick={() => selectHotel(tier.id)}
                        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                          isSelected 
                            ? "border-marigold bg-marigold/5 ring-1 ring-marigold/30" 
                            : "border-border/30 bg-white hover:border-marigold/60"
                        }`}
                      >
                        <div className="space-y-2 max-w-md">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-ink-indigo">{tier.name}</h4>
                            {isSelected && (
                              <span className="text-[8px] bg-marigold text-white px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-bold">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-dusk-teal leading-normal">{tier.desc}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {tier.features.map((f, i) => (
                              <span key={i} className="text-[9px] bg-sand text-ink-indigo px-2 py-0.5 rounded font-mono font-semibold">
                                ✓ {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-left md:text-right md:shrink-0 flex flex-col gap-1 border-t md:border-t-0 border-border/10 pt-2 md:pt-0 w-full md:w-auto">
                          <span className="text-xs font-mono font-bold text-marigold">
                            {tier.priceDiffPerNight === 0 ? "Included" : `+₹${tier.priceDiffPerNight.toLocaleString()}/night`}
                          </span>
                          <span className="text-[10px] text-dusk-teal font-medium">
                            {tier.priceDiffPerNight === 0 ? "No added cost" : `Total: +₹${totalDiff.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: EXPERIENCE SWAPPER */}
            {activeStep === 2 && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="flex flex-col gap-1 border-b border-border/20 pb-4">
                  <span className="text-[10px] font-bold text-clay-rose uppercase tracking-widest font-mono">Step 3 of 5</span>
                  <h2 className="text-xl font-bold text-ink-indigo font-display">Configure Daily Experience Timeline</h2>
                </div>

                <p className="text-xs text-dusk-teal leading-relaxed">
                  Swap activities in your timeline if you prefer alternative experiences. Changes are processed instantly.
                </p>

                <div className="space-y-6">
                  {days.map((day: any) => (
                    <div key={day.id} className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-border/10 pb-1">
                        <span className="bg-ink-indigo text-white font-mono text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          D{day.day_number}
                        </span>
                        <h4 className="text-xs font-bold text-ink-indigo">Day {day.day_number} activities</h4>
                      </div>

                      <div className="space-y-3 pl-7">
                        {day.itinerary_items?.map((item: any) => {
                          const exp = item.experiences;
                          if (!exp) return null;
                          const isSwappingThis = swappingItemId === item.id;

                          return (
                            <div key={item.id} className="p-4 bg-white border border-border/30 rounded-xl relative shadow-xs hover:border-marigold transition-all space-y-3">
                              <div className="flex justify-between items-start">
                                <span className="text-[8px] font-mono bg-sand text-dusk-teal px-2 py-0.5 rounded uppercase font-semibold">
                                  {exp.category}
                                </span>
                                
                                <button
                                  onClick={() => handleOpenSwapOptions(item.id, exp.id)}
                                  className="text-[9px] font-bold text-marigold flex items-center gap-1 hover:underline border border-marigold/10 bg-marigold/5 px-2 py-0.5 rounded transition"
                                >
                                  <span>Swap Activity</span>
                                </button>
                              </div>
                              
                              <h5 className="text-xs font-bold text-ink-indigo">{exp.name}</h5>
                              <div className="text-[10px] text-dusk-teal font-mono flex justify-between">
                                <span>Cost band: {exp.price_band}</span>
                              </div>

                              {/* Inline Swap Choice Panel */}
                              {isSwappingThis && (
                                <div className="mt-3 bg-sand/35 border border-border/20 p-3 rounded-lg space-y-2 animate-fade-in text-[10px]">
                                  <div className="font-bold text-ink-indigo">Select Alternate Curation:</div>
                                  {swappingLoading ? (
                                    <div className="text-dusk-teal/60 italic py-2 flex items-center gap-1.5">
                                      <RefreshCw className="w-3 h-3 animate-spin" />
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
                                          <span className="text-[8px] text-dusk-teal block capitalize font-semibold">{alt.category} &bull; {alt.price_band} cost</span>
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-dusk-teal/60 italic">No alternatives found.</div>
                                  )}
                                  <button
                                    onClick={() => setSwappingItemId(null)}
                                    className="text-[8px] text-clay-rose font-bold hover:underline block pt-1"
                                  >
                                    Cancel Swap
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: UPGRADES ADD-ONS */}
            {activeStep === 3 && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="flex flex-col gap-1 border-b border-border/20 pb-4">
                  <span className="text-[10px] font-bold text-clay-rose uppercase tracking-widest font-mono">Step 4 of 5</span>
                  <h2 className="text-xl font-bold text-ink-indigo font-display">Premium Services & Upgrades</h2>
                </div>

                <p className="text-xs text-dusk-teal leading-relaxed">
                  Add exclusive concierge items to complete your premium vacation setup. Check boxes to apply dynamically.
                </p>

                <div className="flex flex-col gap-4">
                  {UPGRADE_OPTIONS.map(upgrade => {
                    const isChecked = selectedUpgrades.includes(upgrade.id);
                    const UpgradeIcon = upgrade.icon;
                    
                    return (
                      <div 
                        key={upgrade.id}
                        onClick={() => toggleUpgrade(upgrade.id)}
                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex gap-4 items-center ${
                          isChecked 
                            ? "border-marigold bg-marigold/5" 
                            : "border-border/30 bg-white hover:border-marigold/60"
                        }`}
                      >
                        <div className={`p-2.5 rounded-lg shrink-0 ${
                          isChecked ? "bg-marigold/20 text-marigold" : "bg-sand text-dusk-teal"
                        }`}>
                          <UpgradeIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 space-y-1">
                          <h4 className="text-xs font-bold text-ink-indigo">{upgrade.name}</h4>
                          <p className="text-[10px] text-dusk-teal leading-normal">{upgrade.description}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono font-bold text-marigold text-right shrink-0">
                            +₹{upgrade.price.toLocaleString()}
                          </span>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked ? "bg-marigold border-marigold text-white" : "border-border"
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: PRICING SUMMARY */}
            {activeStep === 4 && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="flex flex-col gap-1 border-b border-border/20 pb-4">
                  <span className="text-[10px] font-bold text-clay-rose uppercase tracking-widest font-mono">Step 5 of 5</span>
                  <h2 className="text-xl font-bold text-ink-indigo font-display">Review & Finalize Package</h2>
                </div>

                <p className="text-xs text-dusk-teal leading-relaxed">
                  Review the finalized price breakdown below. Saving will sync these configurations with your online travel portfolio.
                </p>

                <div className="bg-sand/20 border border-border/30 rounded-2xl overflow-hidden">
                  <div className="p-5 bg-ink-indigo text-white flex justify-between items-center">
                    <div>
                      <h4 className="font-bold font-display text-sm">Custom Curated Bundle</h4>
                      <p className="text-[10px] text-sand/80 mt-0.5">{cityName} Getaway &bull; {durationDays} Days</p>
                    </div>
                    <span className="text-xl font-bold font-mono">₹{finalTotalCost.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="p-5 space-y-3.5 text-xs text-dusk-teal leading-relaxed">
                    <div className="flex justify-between items-center">
                      <span>Base Itinerary Estimate</span>
                      <span className="font-mono text-deep-charcoal">₹{basePrice.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Hotel Tier: {HOTEL_TIERS.find(t => t.id === selectedHotelTier)?.name}</span>
                      <span className="font-mono text-deep-charcoal">
                        {hotelCostAdjustment === 0 ? "Included" : `+₹${hotelCostAdjustment.toLocaleString("en-IN")}`}
                      </span>
                    </div>

                    {selectedUpgrades.length > 0 && (
                      <div className="border-t border-border/10 pt-3">
                        <span className="font-semibold text-ink-indigo block mb-1.5 text-[10px] uppercase font-mono tracking-wider">Applied Upgrades:</span>
                        <div className="space-y-1.5 pl-2 border-l border-border/40">
                          {selectedUpgrades.map(uid => {
                            const upgrade = UPGRADE_OPTIONS.find(u => u.id === uid);
                            return upgrade ? (
                              <div key={uid} className="flex justify-between items-center text-[11px]">
                                <span>• {upgrade.name}</span>
                                <span className="font-mono text-deep-charcoal">+₹{upgrade.price.toLocaleString()}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-border/20 pt-4 flex justify-between items-center font-bold text-ink-indigo text-sm">
                      <span>Final Estimate Cost</span>
                      <span className="font-mono text-marigold">₹{finalTotalCost.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-sand/30 border border-marigold/10 p-4 rounded-xl text-xs text-dusk-teal flex gap-2">
                  <Star className="w-5 h-5 text-marigold shrink-0 mt-0.5" />
                  <div>
                    <strong>VIP Concierge Priority:</strong> Upon finalizing, a representative will check actual room inventory & airfare availability and reach out to complete booking.
                  </div>
                </div>
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="flex justify-between items-center border-t border-border/20 pt-6 mt-8">
              <button
                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeStep === 0 
                    ? "opacity-40 cursor-not-allowed text-dusk-teal/60" 
                    : "text-ink-indigo border border-border hover:bg-sand/20"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {activeStep < steps.length - 1 ? (
                <button
                  onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                  className="flex items-center gap-1.5 bg-ink-indigo hover:bg-ink-indigo/90 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinalizeAndProceed}
                  className="flex items-center gap-1.5 bg-marigold hover:bg-marigold/90 text-white px-6 py-3 rounded-lg text-xs font-bold transition shadow-md"
                >
                  <span>Finalize & Proceed</span>
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

          {/* Real-time Sticky Cost Card */}
          <div className="bg-white border border-border/40 p-6 rounded-2xl shadow-sm space-y-4 lg:sticky lg:top-8 text-left">
            <h3 className="text-xs font-bold text-ink-indigo font-mono tracking-wide uppercase border-b border-border pb-2">
              Package Cost Summary
            </h3>
            
            <div className="space-y-3 text-xs text-dusk-teal leading-relaxed">
              <div className="flex justify-between">
                <span>Itinerary Price:</span>
                <span className="font-semibold text-deep-charcoal">₹{basePrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Hotel Tier Adjust:</span>
                <span className="font-semibold text-deep-charcoal">
                  {hotelCostAdjustment === 0 ? "Included" : `+₹${hotelCostAdjustment.toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Upgrades Applied:</span>
                <span className="font-semibold text-deep-charcoal">
                  {upgradesCost === 0 ? "None" : `+₹${upgradesCost.toLocaleString("en-IN")}`}
                </span>
              </div>
              
              <div className="border-t border-border/20 pt-3 flex flex-col gap-1">
                <span className="text-[10px] text-dusk-teal/60 font-semibold font-mono uppercase">Calculated Total</span>
                <div className="text-xl font-bold font-mono text-marigold">
                  ₹{finalTotalCost.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href={`/itinerary/${itineraryId}`}>
                <span className="text-[10px] font-bold text-marigold hover:underline block text-center">
                  ← Back to Itinerary Hub
                </span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
