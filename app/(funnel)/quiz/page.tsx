"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  anonymousSignUp,
  ensureUserAndProfile,
  submitQuestionnaireResponse,
  getDestinations,
  submitWhatsAppLead,
  generateItineraryForProfile,
  City,
  Country
} from "@/lib/supabase";
import { mergeAnonymousProfile } from "@/lib/auth";
import {
  Compass,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Sliders,
  Calendar,
  User,
  Users,
  Smile,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

interface FlowNode {
  question_id: string;
  tier: number;
  question_text: string;
  type: string;
  options: string | null;
  condition_field: string | null;
  condition_op: string | null;
  condition_value: string | null;
  next_question_if_condition_true: string | null;
  next_question_default: string | null;
}

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDestination = searchParams.get("destination") || "";

  // DB structures
  const [destinations, setDestinations] = useState<{ countries: Country[]; cities: City[] } | null>(null);
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>("T0_Q1");
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({
    T0_Q1: initialDestination ? "I Know My Destination" : "Not Sure Yet",
    T0_Q2: initialDestination || "",
  });

  // Loading & states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Form states for account / lead capture gates
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formContactTime, setFormContactTime] = useState("Afternoon (2 PM - 5 PM)");
  const [consentWhatsApp, setConsentWhatsApp] = useState(true);
  const [consentTerms, setConsentTerms] = useState(true);

  // Split-number answers
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);

  // Sliders state (pre-populated)
  const [sliders, setSliders] = useState<Record<string, number>>({
    Luxury: 50,
    Adventure: 50,
    Relaxation: 50,
    Shopping: 50,
    Food: 50,
    Nature: 50,
    Nightlife: 50,
    Culture: 50,
    Photography: 50,
    "Local Experiences": 50,
  });

  // Local storage setup on mount
  useEffect(() => {
    getDestinations().then(setDestinations);
    fetchFlowNodes();
  }, []);

  const fetchFlowNodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("questionnaire_flow")
        .select("*")
        .order("tier", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setFlowNodes(data);
      } else {
        // High fidelity fallback schema nodes
        setFlowNodes([
          { question_id: "T0_Q1", tier: 0, question_text: "Where would you like to travel?", type: "single_select", options: "Not Sure Yet|I Know My Destination", condition_field: null, condition_op: null, condition_value: null, next_question_if_condition_true: null, next_question_default: "T0_Q3" },
          { question_id: "T0_Q2", tier: 0, question_text: "Which destination?", type: "destination_autocomplete", options: null, condition_field: "T0_Q1", condition_op: "equals", condition_value: "I Know My Destination", next_question_if_condition_true: "T0_Q3", next_question_default: null },
          { question_id: "T0_Q3", tier: 0, question_text: "Domestic or International?", type: "single_select", options: "Domestic|International", condition_field: null, condition_op: null, condition_value: null, next_question_if_condition_true: null, next_question_default: "T0_Q4" },
          { question_id: "T0_Q4", tier: 0, question_text: "Departure City", type: "city_autocomplete", options: null, condition_field: null, condition_op: null, condition_value: null, next_question_if_condition_true: null, next_question_default: "T0_Q5" },
          { question_id: "T0_Q5", tier: 0, question_text: "Travel Month + Flexible Dates?", type: "month_picker_plus_toggle", options: null, condition_field: null, condition_op: null, condition_value: null, next_question_if_condition_true: null, next_question_default: "T0_Q6" },
          { question_id: "T0_Q6", tier: 0, question_text: "Trip Duration (nights)", type: "number", options: null, condition_field: null, condition_op: null, condition_value: null, next_question_if_condition_true: null, next_question_default: "T0_Q7" },
          { question_id: "T0_Q7", tier: 0, question_text: "How many travelers?", type: "number_split", options: null, condition_field: null, condition_op: null, condition_value: null, next_question_if_condition_true: null, next_question_default: "T0_Q8" },
          { question_id: "T0_Q8", tier: 0, question_text: "Who are you traveling with?", type: "single_select", options: "Solo|Couple|Family|Friends|Corporate Group", condition_field: null, condition_op: null, condition_value: null, next_question_if_condition_true: null, next_question_default: "T0_Q8A" },
          { question_id: "T0_Q8A", tier: 0, question_text: "Child ages", type: "multi_number", options: null, condition_field: "T0_Q8", condition_op: "equals", condition_value: "Family", next_question_if_condition_true: "T0_Q9", next_question_default: "T0_Q9" },
          { question_id: "T0_Q9", tier: 0, question_text: "Total Budget", type: "single_select", options: "Under ₹50,000|₹50,000-₹1,00,000|₹1,00,000-₹2,00,000|₹2,00,000-₹5,00,000|₹5,00,000+", condition_field: null, condition_op: null, condition_value: null, next_question_if_condition_true: null, next_question_default: "T0_Q9A" },
          { question_id: "T0_Q9A", tier: 0, question_text: "Per Person or Total Trip?", type: "single_select", options: "Per Person|Total Trip", condition_field: null, condition_op: null, condition_value: null, next_question_if_condition_true: null, next_question_default: "T0_Q10" },
          { question_id: "T0_Q10", tier: 0, question_text: "Preferred Hotel Category", type: "single_select", options: "Budget|3 Star|4 Star|5 Star|Luxury", condition_field: null, condition_op: null, condition_value: null, next_question_if_condition_true: null, next_question_default: "T0_Q11" },
          { question_id: "T0_Q11", tier: 0, question_text: "Quick Vibe Check: Luxury, Adventure, Relaxation", type: "slider_set", options: "Luxury|Adventure|Relaxation", condition_field: null, condition_op: null, condition_value: null, next_question_if_condition_true: null, next_question_default: "TEASER" },
          { question_id: "TEASER", tier: 0, question_text: "Teaser Screen Placeholder", type: "teaser_view", options: null, condition_field: null, condition_op: null, condition_value: null, next_question_if_condition_true: null, next_question_default: "T1_Q1_COUPLE" },
          { question_id: "T1_Q1_SOLO", tier: 1, question_text: "Trip Occasion (Solo)", type: "single_select", options: "Vacation|Adventure|Religious|Birthday|Relaxation", condition_field: "T0_Q8", condition_op: "equals", condition_value: "Solo", next_question_if_condition_true: "T1_Q2", next_question_default: null },
          { question_id: "T1_Q1_COUPLE", tier: 1, question_text: "Trip Occasion (Couple)", type: "single_select", options: "Vacation|Honeymoon|Anniversary|Adventure|Birthday|Relaxation|Romantic Escapade", condition_field: "T0_Q8", condition_op: "equals", condition_value: "Couple", next_question_if_condition_true: "T1_Q2", next_question_default: null },
          { question_id: "T1_Q1_FAMILY", tier: 1, question_text: "Trip Occasion (Family)", type: "single_select", options: "Family Holiday|Vacation|Religious|Birthday|Relaxation", condition_field: "T0_Q8", condition_op: "equals", condition_value: "Family", next_question_if_condition_true: "T1_Q2", next_question_default: null },
          { question_id: "T1_Q1_FRIENDS", tier: 1, question_text: "Trip Occasion (Friends)", type: "single_select", options: "Vacation|Adventure|Birthday|Relaxation|Religious", condition_field: "T0_Q8", condition_op: "equals", condition_value: "Friends", next_question_if_condition_true: "T1_Q2", next_question_default: null },
          { question_id: "T1_Q1_CORPORATE", tier: 1, question_text: "Trip Occasion (Corporate)", type: "single_select", options: "Business", condition_field: "T0_Q8", condition_op: "equals", condition_value: "Corporate Group", next_question_if_condition_true: "T1_Q2", next_question_default: null },
          { question_id: "T1_Q2", tier: 1, question_text: "Remaining Sliders: Shopping, Food, Nature, Nightlife, Culture, Photography, Local Experiences", type: "slider_set", options: "Shopping|Food|Nature|Nightlife|Culture|Photography|Local Experiences", condition_field: null, condition_op: null, condition_value: null, next_question_if_condition_true: null, next_question_default: "GATE1" },
          { question_id: "GATE1", tier: 5, question_text: "Create account to save your results", type: "account_creation_form", options: null, condition_field: null, condition_op: null, condition_value: null, next_question_if_condition_true: null, next_question_default: "T2_Q1_INTL" }
        ]);
      }
    } catch (err) {
      console.warn("Failed fetching flows from Supabase. Falling back to local data blueprints.", err);
    } finally {
      setLoading(false);
    }
  };

  // Sync children count changes
  useEffect(() => {
    setChildAges(Array(childrenCount).fill(8));
  }, [childrenCount]);

  const handleChildAgeChange = (index: number, val: number) => {
    const updated = [...childAges];
    updated[index] = val;
    setChildAges(updated);
  };

  // Condition evaluator
  const evaluateCondition = (node: FlowNode): boolean => {
    if (!node.condition_field) return true;
    const value = answers[node.condition_field];

    if (node.condition_op === "equals") {
      return String(value) === String(node.condition_value);
    }
    if (node.condition_op === "gte") {
      return Number(value) >= Number(node.condition_value);
    }
    return false;
  };

  // Determine next question ID based on condition evaluation
  const determineNextQuestionId = (currentNode: FlowNode): string => {
    if (currentNode.condition_field) {
      if (evaluateCondition(currentNode)) {
        return currentNode.next_question_if_condition_true || currentNode.next_question_default || "COMPLETE";
      }
    }
    return currentNode.next_question_default || "COMPLETE";
  };

  // Progress calculator
  const totalTier0Questions = flowNodes.filter((n) => n.tier === 0).length;
  const currentCompletedCount = historyStack.length;
  const progressPercent = Math.min(
    100,
    Math.round((currentCompletedCount / (totalTier0Questions + 2)) * 100)
  );

  const handleNext = async (currentVal?: any) => {
    setErrorMsg("");
    const currentNode = flowNodes.find((n) => n.question_id === currentQuestionId);
    if (!currentNode) return;

    // Apply values to state map
    const finalVal = currentVal !== undefined ? currentVal : answers[currentQuestionId];
    const newAnswers = { ...answers, [currentQuestionId]: finalVal };
    setAnswers(newAnswers);

    // Dynamic auto-save on database if profile exists
    try {
      let activeProfileId = profileId;
      let activeUserId = userId;

      if (!activeUserId) {
        const anonUid = await anonymousSignUp();
        activeUserId = anonUid;
        setUserId(anonUid);
      }
      if (!activeProfileId) {
        const profId = await ensureUserAndProfile(activeUserId);
        activeProfileId = profId;
        setProfileId(profId);
      }

      // Submit specific dynamic response
      await submitQuestionnaireResponse(activeProfileId, currentNode.tier, currentQuestionId, finalVal);
    } catch (err) {
      console.warn("Background auto-save failed:", err);
    }

    // Determine target next question
    let nextId = determineNextQuestionId(currentNode);

    // Branching for TEASER checkpoint to determine occasion questions based on companion
    if (currentQuestionId === "T0_Q11") {
      nextId = "TEASER";
    } else if (currentQuestionId === "TEASER") {
      const companionType = answers["T0_Q8"] || "Couple";
      if (companionType === "Solo") nextId = "T1_Q1_SOLO";
      else if (companionType === "Couple") nextId = "T1_Q1_COUPLE";
      else if (companionType === "Family") nextId = "T1_Q1_FAMILY";
      else if (companionType === "Friends") nextId = "T1_Q1_FRIENDS";
      else nextId = "T1_Q1_CORPORATE";
    }

    // Push past ID to history tracker and swap view
    setHistoryStack([...historyStack, currentQuestionId]);
    setCurrentQuestionId(nextId);
  };

  const handleBack = () => {
    if (historyStack.length === 0) return;
    const previous = [...historyStack];
    const lastId = previous.pop()!;
    setHistoryStack(previous);
    setCurrentQuestionId(lastId);
  };

  // Secure / Create Account
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail || !formPassword || !formName) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (!consentTerms) {
      setErrorMsg("Please accept terms of service to proceed.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const isDummy = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("127.0.0.1") || !supabase;

      if (isDummy) {
        setSuccessMsg("Mock Registration successful! Securing session data...");
        // Compute DNA and generate mock Itinerary
        const res = await generateItineraryForProfile(profileId || "mock-prof-id", sliders, answers);
        setTimeout(() => {
          router.push(`/itinerary/${res?.itineraryId || "mock-itinerary-1"}`);
        }, 1500);
      } else {
        // Real signup with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: formEmail,
          password: formPassword,
          options: {
            data: {
              name: formName,
              phone: formPhone
            },
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          }
        });

        if (error) throw error;

        if (data.user) {
          // Log consent in records
          await supabase.from("consent_records").insert([
            {
              user_id: data.user.id,
              consent_type: "signup_terms_and_privacy",
              consent_version: "v1.0",
              consent_given: true,
            },
            {
              user_id: data.user.id,
              consent_type: "whatsapp_updates",
              consent_version: "v1.0",
              consent_given: consentWhatsApp,
            }
          ]);

          setSuccessMsg("Registration successful! Securing session and generating travel plan...");

          // Merge anonymous profile
          const cachedAnon = localStorage.getItem("journey_os_anon_user_id");
          if (cachedAnon && cachedAnon !== data.user.id) {
            await mergeAnonymousProfile(cachedAnon, data.user.id);
          }

          // Generate Itinerary
          const res = await generateItineraryForProfile(profileId || "mock-prof", sliders, answers);
          
          setTimeout(() => {
            router.push(`/itinerary/${res?.itineraryId}`);
          }, 1500);
        }
      }
    } catch (err: any) {
      console.error("SignUp error during quiz:", err);
      setErrorMsg(err.message || "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  // Node lookup
  const currentNode = flowNodes.find((n) => n.question_id === currentQuestionId);

  if (loading && flowNodes.length === 0) {
    return (
      <div className="min-h-screen bg-sand flex flex-col justify-center items-center p-6" data-theme="consumer">
        <RefreshCw className="w-9 h-9 text-marigold animate-spin mb-3" />
        <p className="text-xs text-dusk-teal">Loading dynamic travel decoder steps...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 sm:p-8 bg-sand/15 text-deep-charcoal font-sans" data-theme="consumer">
      <div className="w-full max-w-lg">
        
        {/* Dynamic progress tracker (hidden on special screens) */}
        {currentNode && currentNode.type !== "teaser_view" && currentNode.type !== "account_creation_form" && (
          <div className="w-full bg-white/70 backdrop-blur-md p-5 border border-border/40 shadow-sm rounded-3xl mb-6 flex flex-col gap-3">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-dusk-teal/70 tracking-wider">
              <span>Dynamic Questionnaire</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="w-full bg-sand/65 h-2 rounded-full overflow-hidden border border-border/10">
              <div
                className="bg-marigold h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent || 8}%` }}
              />
            </div>
          </div>
        )}

        {/* Dynamic question player */}
        {currentNode && (
          <div className="theme-surface bg-white/90 backdrop-blur-md p-6 sm:p-8 border border-border/40 shadow-xl rounded-3xl flex flex-col gap-6 animate-fade-in">
            
            {/* Display Node contents */}
            {currentNode.type !== "teaser_view" && currentNode.type !== "account_creation_form" && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-clay-rose uppercase tracking-widest font-mono">
                  Tier {currentNode.tier} Preference
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-ink-indigo leading-tight">
                  {currentNode.question_text}
                </h2>
              </div>
            )}

            {/* Inputs types renderer */}
            
            {/* TYPE 1: single_select */}
            {currentNode.type === "single_select" && (
              <div className="flex flex-col gap-2.5">
                {(currentNode.options || "").split("|").map((opt) => {
                  const isSelected = answers[currentQuestionId] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        setAnswers({ ...answers, [currentQuestionId]: opt });
                        handleNext(opt);
                      }}
                      className={`w-full p-4 text-left rounded-2xl border text-xs font-semibold transition-all flex justify-between items-center ${
                        isSelected
                          ? "border-marigold bg-marigold/10 text-ink-indigo shadow-sm"
                          : "border-border/60 hover:border-marigold bg-white/50 text-dusk-teal"
                      }`}
                    >
                      <span>{opt}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? "text-marigold" : "text-border/80"}`} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* TYPE 2: destination_autocomplete */}
            {currentNode.type === "destination_autocomplete" && (
              <div className="space-y-3">
                <div className="relative">
                  <select
                    value={answers[currentQuestionId] || ""}
                    onChange={(e) => setAnswers({ ...answers, [currentQuestionId]: e.target.value })}
                    className="w-full p-3.5 border border-border rounded-xl bg-white text-xs text-ink-indigo font-semibold focus:outline-none focus:border-marigold"
                  >
                    <option value="">Let AI suggest (Singapore default)</option>
                    {destinations?.cities.map((city) => (
                      <option key={city.id} value={city.name.toLowerCase()}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-dusk-teal/80">
                  Select a candidate location to load and overlay your travel DNA scores dynamically.
                </p>
              </div>
            )}

            {/* TYPE 3: city_autocomplete */}
            {currentNode.type === "city_autocomplete" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="e.g. Mumbai, New Delhi, Singapore"
                  value={answers[currentQuestionId] || ""}
                  onChange={(e) => setAnswers({ ...answers, [currentQuestionId]: e.target.value })}
                  className="w-full p-3.5 border border-border rounded-xl bg-white text-xs text-ink-indigo font-semibold focus:outline-none focus:border-marigold"
                />
              </div>
            )}

            {/* TYPE 4: month_picker_plus_toggle */}
            {currentNode.type === "month_picker_plus_toggle" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2.5">
                  {["July 2026", "August 2026", "September 2026", "October 2026", "November 2026", "December 2026"].map((m) => {
                    const isSelected = answers[currentQuestionId]?.month === m;
                    return (
                      <button
                        key={m}
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            [currentQuestionId]: { ...answers[currentQuestionId], month: m }
                          })
                        }
                        className={`p-3 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                          isSelected
                            ? "border-marigold bg-marigold/10 text-ink-indigo shadow-sm"
                            : "border-border/60 hover:border-marigold bg-white/50 text-dusk-teal"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={answers[currentQuestionId]?.flexible ?? true}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        [currentQuestionId]: { ...answers[currentQuestionId], flexible: e.target.checked }
                      })
                    }
                    className="accent-marigold"
                  />
                  <span className="text-xs text-dusk-teal font-medium">My travel dates are flexible (+/- 5 days)</span>
                </label>
              </div>
            )}

            {/* TYPE 5: number */}
            {currentNode.type === "number" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-5">
                  <button
                    onClick={() => {
                      const cur = Number(answers[currentQuestionId] || 7);
                      setAnswers({ ...answers, [currentQuestionId]: Math.max(1, cur - 1) });
                    }}
                    className="w-11 h-11 rounded-full border border-border flex items-center justify-center font-bold text-lg bg-white/50 text-ink-indigo hover:border-marigold"
                  >
                    -
                  </button>
                  <span className="text-3xl font-mono font-bold text-marigold w-24 text-center">
                    {answers[currentQuestionId] || 7}
                  </span>
                  <button
                    onClick={() => {
                      const cur = Number(answers[currentQuestionId] || 7);
                      setAnswers({ ...answers, [currentQuestionId]: Math.min(30, cur + 1) });
                    }}
                    className="w-11 h-11 rounded-full border border-border flex items-center justify-center font-bold text-lg bg-white/50 text-ink-indigo hover:border-marigold"
                  >
                    +
                  </button>
                </div>
                <p className="text-center text-[10px] text-dusk-teal/80">Nights stay</p>
              </div>
            )}

            {/* TYPE 6: number_split */}
            {currentNode.type === "number_split" && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1 text-left">
                    <label className="text-[10px] font-bold uppercase text-ink-indigo">Adults</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={adultsCount}
                      onChange={(e) => setAdultsCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-3 border border-border rounded-xl bg-white text-xs font-semibold text-ink-indigo"
                    />
                  </div>
                  <div className="flex-1 space-y-1 text-left">
                    <label className="text-[10px] font-bold uppercase text-ink-indigo">Children</label>
                    <input
                      type="number"
                      min={0}
                      max={8}
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-3 border border-border rounded-xl bg-white text-xs font-semibold text-ink-indigo"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TYPE 7: multi_number (Child ages) */}
            {currentNode.type === "multi_number" && (
              <div className="space-y-4">
                {childrenCount > 0 ? (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-dusk-teal">Specify age for each child:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {childAges.map((age, idx) => (
                        <div key={idx} className="space-y-1">
                          <span className="block text-[9px] uppercase font-bold text-dusk-teal/70">Child {idx + 1}</span>
                          <input
                            type="number"
                            min={0}
                            max={17}
                            value={age}
                            onChange={(e) => handleChildAgeChange(idx, Math.max(0, parseInt(e.target.value) || 0))}
                            className="p-2 border border-border rounded-xl text-center bg-white text-xs font-mono font-bold text-ink-indigo"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-dusk-teal bg-sand/30 rounded-2xl border border-border/20">
                    No children selected in party count. Please click Next to bypass.
                  </div>
                )}
              </div>
            )}

            {/* TYPE 8: slider_set */}
            {currentNode.type === "slider_set" && (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {(currentNode.options || "").split("|").map((dim) => (
                  <div key={dim} className="space-y-1.5 text-left">
                    <div className="flex justify-between text-xs font-semibold text-ink-indigo">
                      <span>{dim}</span>
                      <span className="font-mono text-amber-800 font-bold">{sliders[dim] || 50}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sliders[dim] || 50}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSliders({ ...sliders, [dim]: val });
                        setAnswers({ ...answers, [currentQuestionId]: { ...answers[currentQuestionId], [dim]: val } });
                      }}
                      className="w-full accent-marigold"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* TYPE 9: teaser_view */}
            {currentNode.type === "teaser_view" && (
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-clay-rose bg-clay-rose/10 border border-clay-rose/15 px-3 py-1 rounded-full uppercase tracking-widest font-mono">
                    Travel preferences locked
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-indigo">
                    Analyzing Your Custom Itinerary Match...
                  </h2>
                </div>

                <div className="p-4.5 rounded-2xl bg-sand/35 text-left text-xs leading-relaxed border border-border/25 flex flex-col gap-2.5 font-semibold text-dusk-teal">
                  <div className="flex justify-between">
                    <span>Destination Candidate:</span>
                    <span className="text-ink-indigo capitalize">{answers["T0_Q2"] || "Singapore (Recommended)"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Companion:</span>
                    <span className="text-ink-indigo">{answers["T0_Q8"] || "Couple"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trip Duration:</span>
                    <span className="text-ink-indigo font-mono">{answers["T0_Q6"] || 7} Nights</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Budget:</span>
                    <span className="text-ink-indigo font-mono">{answers["T0_Q9"] || "₹1,00,000-₹2,00,000"}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-left">
                  <h4 className="text-[10px] font-bold uppercase text-amber-800 tracking-widest font-mono">
                    AI Recommended Experience Snaps:
                  </h4>
                  <div className="flex flex-col gap-2">
                    <div className="p-3 bg-white border border-border/30 rounded-xl flex items-center justify-between shadow-sm">
                      <span className="font-semibold text-xs text-ink-indigo">Marina Bay Sands Infinity Deck</span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">98% Fit</span>
                    </div>
                    <div className="p-3 bg-white border border-border/30 rounded-xl flex items-center justify-between shadow-sm">
                      <span className="font-semibold text-xs text-ink-indigo">Gardens by the Bay Light Show</span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">92% Fit</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleNext({ analyzed: true })}
                  className="bg-marigold hover:bg-marigold/95 text-ink-indigo font-bold py-4 w-full rounded-xl shadow-md transition-all text-xs border border-marigold mt-2"
                >
                  Sharpen Matches (Tier 1 Details)
                </Button>
              </div>
            )}

            {/* TYPE 10: account_creation_form (GATE 1) */}
            {currentNode.type === "account_creation_form" && (
              <form onSubmit={handleSignUpSubmit} className="space-y-4 text-left">
                <div className="space-y-1 text-center mb-4">
                  <span className="text-xs font-bold text-clay-rose uppercase tracking-widest font-mono">
                    Account Lock-In
                  </span>
                  <h2 className="text-2xl font-display font-bold text-ink-indigo">
                    Save Your Travel Profile
                  </h2>
                  <p className="text-xs text-dusk-teal">
                    Create a free account to secure your travel DNA match details.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 text-xs rounded-xl bg-clay-rose/10 border border-clay-rose/20 text-clay-rose font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-0.5 tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-sand/20 border border-border/30 rounded-xl focus:outline-none focus:border-marigold"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-0.5 tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-sand/20 border border-border/30 rounded-xl focus:outline-none focus:border-marigold"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-0.5 tracking-wider">
                      WhatsApp Phone Number (For updates)
                    </label>
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-sand/20 border border-border/30 rounded-xl focus:outline-none focus:border-marigold"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-0.5 tracking-wider">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-sand/20 border border-border/30 rounded-xl focus:outline-none focus:border-marigold"
                      placeholder="Min. 8 characters"
                      minLength={8}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentWhatsApp}
                      onChange={(e) => setConsentWhatsApp(e.target.checked)}
                      className="mt-0.5 accent-marigold"
                    />
                    <span className="text-[10px] text-dusk-teal leading-normal font-medium">
                      I consent to receive travel updates and curated itinerary packages on WhatsApp.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentTerms}
                      onChange={(e) => setConsentTerms(e.target.checked)}
                      className="mt-0.5 accent-marigold"
                      required
                    />
                    <span className="text-[10px] text-dusk-teal leading-normal font-medium">
                      I accept the terms of service and data privacy guidelines. *
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-marigold hover:bg-marigold/95 text-white font-bold rounded-xl mt-2 text-xs shadow-md transition"
                >
                  {loading ? "Registering & Processing matches..." : "Generate & View My Travel Itinerary"}
                </Button>
              </form>
            )}

            {/* Standard buttons layout (except form inputs that handle next automatically) */}
            {currentNode.type !== "single_select" && currentNode.type !== "teaser_view" && currentNode.type !== "account_creation_form" && (
              <div className="flex gap-3 mt-4 border-t border-border/10 pt-4">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={historyStack.length === 0}
                  className="flex-1 py-3 text-xs border border-border/40 rounded-xl text-dusk-teal"
                >
                  Back
                </Button>
                <Button
                  onClick={() => handleNext()}
                  className="flex-1 py-3 bg-ink-indigo hover:bg-ink-indigo/95 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Next Question
                </Button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-dusk-teal text-center">Loading travel quiz...</div>}>
      <QuizContent />
    </Suspense>
  );
}
