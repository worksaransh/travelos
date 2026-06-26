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
  AlertCircle,
  Plane,
  Globe,
  Star,
  Baby,
  Briefcase,
  Heart,
  Crown,
  Search,
  Check
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

const CHOICE_VISUALS: Record<string, { label: string; description?: string; icon: string }> = {
  // T0_Q1: Where would you like to travel?
  "Not Sure Yet": { label: "Surprise Me", description: "Let our AI concierge discover your perfect vibe.", icon: "✨" },
  "I Know My Destination": { label: "I Have a Place in Mind", description: "Specify your destination and customize it.", icon: "📍" },

  // T0_Q3: Domestic or International?
  "Domestic": { label: "Explore Domestic", description: "Discover hidden gems close to home.", icon: "✈️" },
  "International": { label: "Venture International", description: "Cross borders and experience new cultures.", icon: "🌎" },

  // T0_Q8: Who are you traveling with?
  "Solo": { label: "Solo Explorer", description: "Self-discovery and ultimate freedom.", icon: "👤" },
  "Couple": { label: "As a Couple", description: "A romantic escape designed for two.", icon: "❤️" },
  "Family": { label: "With Family", description: "Memorable experiences for all generations.", icon: "👨‍👩‍👧‍👦" },
  "Friends": { label: "With Friends", description: "Adventure, bonding, and shared laughs.", icon: "👥" },
  "Corporate Group": { label: "Corporate Group", description: "Productive retreats and team bonding.", icon: "🏢" },

  // T0_Q9: Budget
  "Under ₹50,000": { label: "Under ₹50k", description: "Smart & curated pocket getaways.", icon: "💰" },
  "₹50,000-₹1,00,000": { label: "₹50k - ₹1L", description: "Comfortable standard itineraries.", icon: "💰💰" },
  "₹1,00,000-₹2,00,000": { label: "₹1L - ₹2L", description: "Premium boutique stays.", icon: "💎" },
  "₹2,00,000-₹5,00,000": { label: "₹2L - ₹5L", description: "Elite bespoke experiences.", icon: "✨💎" },
  "₹5,00,000+": { label: "₹5L+", description: "Pure luxury and private charters.", icon: "👑" },

  // T0_Q9A: Per Person or Total Trip?
  "Per Person": { label: "Per Person", description: "Calculate rates based on per-traveler average.", icon: "👤" },
  "Total Trip": { label: "Total Trip", description: "An overall budget cap for the entire party.", icon: "💼" },

  // T0_Q10: Preferred Hotel Category
  "Budget": { label: "Boutique Hostels", description: "Clean, social, and ultra-affordable.", icon: "🎒" },
  "3 Star": { label: "3-Star Standard", description: "Reliable comfort with key amenities.", icon: "⭐" },
  "4 Star": { label: "4-Star Premium", description: "Luxury touches, pools, and top service.", icon: "✨" },
  "5 Star": { label: "5-Star Elite", description: "Exceptional dining and premium spas.", icon: "💎" },
  "Luxury": { label: "Ultra Luxury Resorts", description: "Private villas, butler service, and vistas.", icon: "👑" },
};

const MONTH_VISUALS: Record<string, string> = {
  "July 2026": "🏖️",
  "August 2026": "☀️",
  "September 2026": "🍂",
  "October 2026": "🍁",
  "November 2026": "🌧️",
  "December 2026": "❄️"
};

const SLIDER_ICONS: Record<string, string> = {
  Luxury: "👑",
  Adventure: "🧭",
  Relaxation: "🧘",
  Shopping: "🛍️",
  Food: "🍽️",
  Nature: "🌲",
  Nightlife: "🍸",
  Culture: "🏛️",
  Photography: "📷",
  "Local Experiences": "🤝",
};

const LOADING_MESSAGES = [
  "Mapping your unique travel DNA profile...",
  "Analyzing similar traveler preferences & behaviors...",
  "Filtering matching 4-star and 5-star properties...",
  "Optimizing activity routes and peak seasons...",
  "Syncing local concierge secret recommendations...",
  "Securing exclusive luxury getaway quotes..."
];

function getQuestionPreambles(questionId: string): { preamble: string; icon?: string } {
  const preambles: Record<string, { preamble: string; icon?: string }> = {
    T0_Q1: {
      preamble: "Welcome to Journey OS. Let's design your escape. Do you have a specific destination in mind?",
      icon: "✨"
    },
    T0_Q2: {
      preamble: "Where should your story take place? Choose from our curated top-tier destinations.",
      icon: "📍"
    },
    T0_Q3: {
      preamble: "Let's calibrate the borders. Are we exploring local wonders or traveling overseas?",
      icon: "✈️"
    },
    T0_Q4: {
      preamble: "We compute real-time flight routes and options. Where will your journey begin?",
      icon: "🛫"
    },
    T0_Q5: {
      preamble: "Timing is everything. Help us verify weather, festivals, and flight seasons for your trip.",
      icon: "📅"
    },
    T0_Q6: {
      preamble: "Pacing defines the rhythm of travel. How many nights do you wish to stay?",
      icon: "🌙"
    },
    T0_Q7: {
      preamble: "Shared moments last a lifetime. How many explorers are traveling in your party?",
      icon: "👥"
    },
    T0_Q8: {
      preamble: "We customize experience lists for children, corporate teams, couples, or solo travelers.",
      icon: "🧭"
    },
    T0_Q8A: {
      preamble: "Safety and age-appropriate pacing are essential for young travelers. What are their ages?",
      icon: "👶"
    },
    T0_Q9: {
      preamble: "Let's optimize your investment. We prioritize quality across all price tiers.",
      icon: "💰"
    },
    T0_Q9A: {
      preamble: "Let's clarify budget calculations to ensure absolute pricing transparency.",
      icon: "📊"
    },
    T0_Q10: {
      preamble: "Your accommodation is your sanctuary. What level of hospitality matches your dream?",
      icon: "🏨"
    },
    T0_Q11: {
      preamble: "Define your core travel elements. AI will prioritize matching stays and activities.",
      icon: "⚙️"
    },
    T1_Q1_SOLO: {
      preamble: "Customize your solo getaway to match your exact mood and occasion.",
      icon: "👤"
    },
    T1_Q1_COUPLE: {
      preamble: "Designing a romantic chapter. Let us know the special occasion to unlock premium details.",
      icon: "❤️"
    },
    T1_Q1_FAMILY: {
      preamble: "Creating family memories. Choose the focus of your holiday.",
      icon: "👨"
    },
    T1_Q1_FRIENDS: {
      preamble: "Bonding and adventure. Tell us what type of friends trip this is.",
      icon: "👥"
    },
    T1_Q1_CORPORATE: {
      preamble: "Refine your corporate group retreat scope.",
      icon: "🏢"
    },
    T1_Q2: {
      preamble: "Calibrate secondary dimensions to refine your matching experiences list.",
      icon: "🎨"
    }
  };
  return preambles[questionId] || { preamble: "Let's curate your personal travel blueprint." };
}

function getQuestionFOMO(questionId: string, answers: any): string | null {
  const destination = answers["T0_Q2"] || "Singapore";
  const companion = answers["T0_Q8"] || "Couple";

  if (questionId === "T0_Q1" || questionId === "T0_Q2") {
    return `🔥 2,438 travelers planned a similar trip to ${destination} this week.`;
  }
  if (questionId === "T0_Q8" || questionId === "T0_Q8A" || questionId.startsWith("T1_Q1")) {
    return `✨ 92% of ${companion.toLowerCase()} travelers with your profile chose this option.`;
  }
  if (questionId === "T0_Q11" || questionId === "T1_Q2") {
    return "💡 Complete one more step to unlock your personalized itinerary.";
  }
  return null;
}

function getCityEmoji(name: string) {
  const lowercase = name.toLowerCase();
  if (lowercase.includes("singapore")) return "🦁";
  if (lowercase.includes("bali")) return "🏝️";
  if (lowercase.includes("dubai")) return "🏜️";
  if (lowercase.includes("tokyo")) return "🗼";
  if (lowercase.includes("maldives")) return "🏖️";
  if (lowercase.includes("london")) return "🇬🇧";
  if (lowercase.includes("paris")) return "🗼";
  if (lowercase.includes("rome")) return "🏛️";
  if (lowercase.includes("swiss") || lowercase.includes("zurich")) return "🏔️";
  return "📍";
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadMsgIdx, setLoadMsgIdx] = useState(0);
  const [destSearch, setDestSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Form states for account / lead capture gates
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPassword, setFormPassword] = useState("");
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

  // Cycle loading messages when transitioning
  useEffect(() => {
    if (isTransitioning) {
      const interval = setInterval(() => {
        setLoadMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [isTransitioning]);

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

    setIsTransitioning(true);

    setTimeout(async () => {
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
      setIsTransitioning(false);
    }, 700);
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
        setSuccessMsg("Securing travel session and mapping DNA matches...");
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

          setSuccessMsg("Travel session secured! Designing custom routes...");

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
  const preambleInfo = currentNode ? getQuestionPreambles(currentNode.question_id) : { preamble: "" };
  const fomoMessage = currentNode ? getQuestionFOMO(currentNode.question_id, answers) : null;

  if (loading && flowNodes.length === 0) {
    return (
      <div className="min-h-screen bg-sand/10 flex flex-col justify-center items-center p-6" data-theme="consumer">
        <RefreshCw className="w-9 h-9 text-marigold animate-spin mb-3" />
        <p className="text-xs text-dusk-teal">Loading dynamic travel decoder steps...</p>
      </div>
    );
  }

  // Helper to determine active preview details
  const activeDestination = answers["T0_Q2"] || answers["T0_Q1"] === "Not Sure Yet" ? "Let AI Concierge Decide" : "";
  const displayDestName = activeDestination ? "TBD (AI Curation)" : (answers["T0_Q2"] || "Not specified");
  const displayNights = answers["T0_Q6"] ? `${answers["T0_Q6"]} Nights` : "7 Nights";
  const displayCompanion = answers["T0_Q8"] || "Couple";
  const displayBudget = answers["T0_Q9"] || "Under ₹50k";
  const displayHotel = answers["T0_Q10"] || "Boutique/Standard";

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 sm:p-8 bg-sand/15 text-deep-charcoal font-sans" data-theme="consumer">
      
      {/* Animated Loading Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-ink-indigo/70 backdrop-blur-md flex flex-col justify-center items-center z-50 animate-fade-in text-white p-6">
          <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
            <Compass className="w-16 h-16 text-marigold animate-spin" />
            <div className="absolute inset-0 border-4 border-t-marigold border-r-transparent border-b-transparent border-l-transparent rounded-full animate-ping" />
          </div>
          <h3 className="font-display text-xl font-bold text-marigold mb-2">Analyzing Travel DNA</h3>
          <p className="text-xs text-sand/80 font-medium h-4 transition-all duration-300">
            {LOADING_MESSAGES[loadMsgIdx]}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl w-full items-start">
        
        {/* LEFT COLUMN: Questionnaire Player */}
        <div className="lg:col-span-8 w-full">
          
          {/* Dynamic progress tracker (hidden on special screens) */}
          {currentNode && currentNode.type !== "teaser_view" && currentNode.type !== "account_creation_form" && (
            <div className="w-full bg-white/80 backdrop-blur-md p-5 border border-border/40 shadow-sm rounded-3xl mb-6 flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-dusk-teal/70 tracking-wider">
                <span>Travel DNA Blueprint</span>
                <span>You're {progressPercent}% on your way</span>
              </div>
              <div className="w-full bg-sand/65 h-2 rounded-full overflow-hidden border border-border/10">
                <div
                  className="bg-marigold h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent || 8}%` }}
                />
              </div>
            </div>
          )}

          {/* Dynamic question player card */}
          {currentNode && (
            <div className="theme-surface bg-white/95 backdrop-blur-md p-6 sm:p-8 border border-border/40 shadow-xl rounded-3xl flex flex-col gap-6 animate-fade-in">
              
              {/* Preamble / Reveal Value Header */}
              {currentNode.type !== "teaser_view" && currentNode.type !== "account_creation_form" && (
                <div className="space-y-2 border-b border-border/10 pb-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-marigold uppercase tracking-wider font-mono">
                    <Sparkles className="w-3 h-3" />
                    <span>Tier {currentNode.tier} Curated Stage</span>
                  </div>
                  <p className="text-xs text-dusk-teal font-medium leading-relaxed">
                    {preambleInfo.preamble}
                  </p>
                </div>
              )}

              {/* Main Question Title */}
              {currentNode.type !== "teaser_view" && currentNode.type !== "account_creation_form" && (
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-ink-indigo leading-tight">
                    {currentNode.question_text}
                  </h2>
                </div>
              )}

              {/* INPUT TYPES RENDERERS */}
              
              {/* TYPE 1: single_select (Rich Visual Cards) */}
              {currentNode.type === "single_select" && (
                <div className="grid grid-cols-1 gap-3">
                  {(currentNode.options || "").split("|").map((opt) => {
                    const isSelected = answers[currentQuestionId] === opt;
                    const visual = CHOICE_VISUALS[opt];
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          setAnswers({ ...answers, [currentQuestionId]: opt });
                          handleNext(opt);
                        }}
                        className={`w-full p-4 text-left rounded-2xl border transition-all flex items-center gap-4 cursor-pointer group shadow-xs ${
                          isSelected
                            ? "border-marigold bg-marigold/10 text-ink-indigo shadow-md scale-[1.01]"
                            : "border-border/60 hover:border-marigold bg-white/70 text-dusk-teal hover:shadow-md"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-sand/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                          {visual?.icon || "✨"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-ink-indigo">{visual?.label || opt}</h4>
                          {visual?.description && (
                            <p className="text-[11px] text-dusk-teal/80 line-clamp-1 mt-0.5 font-medium">{visual.description}</p>
                          )}
                        </div>
                        <ArrowRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 ${isSelected ? "text-marigold" : "text-border/80"}`} />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TYPE 2: destination_autocomplete (Trending destination cards + Filter) */}
              {currentNode.type === "destination_autocomplete" && (
                <div className="space-y-4">
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-dusk-teal/50 absolute left-3.5" />
                    <input
                      type="text"
                      placeholder="Type to filter destinations..."
                      value={destSearch}
                      onChange={(e) => setDestSearch(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-3.5 border border-border rounded-xl bg-white text-xs text-ink-indigo font-semibold focus:outline-none focus:border-marigold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
                    {/* Let AI Suggest Card */}
                    <button
                      onClick={() => {
                        setAnswers({ ...answers, [currentQuestionId]: "" });
                        handleNext("");
                      }}
                      className={`p-4 border rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all text-xs font-semibold cursor-pointer ${
                        (answers[currentQuestionId] || "") === ""
                          ? "border-marigold bg-marigold/10 text-ink-indigo shadow-md scale-[1.01]"
                          : "border-border/60 hover:border-marigold bg-white/70 text-dusk-teal"
                      }`}
                    >
                      <span className="text-3xl">✨</span>
                      <div>
                        <h4 className="font-bold">Let AI Suggest</h4>
                        <p className="text-[10px] text-dusk-teal/80 font-normal">Singapore default</p>
                      </div>
                    </button>
                    
                    {/* Destination Cards */}
                    {destinations?.cities
                      .filter((c) => c.name.toLowerCase().includes(destSearch.toLowerCase()))
                      .map((city) => {
                        const isSelected = answers[currentQuestionId] === city.name.toLowerCase();
                        const emoji = getCityEmoji(city.name);
                        return (
                          <button
                            key={city.id}
                            onClick={() => {
                              setAnswers({ ...answers, [currentQuestionId]: city.name.toLowerCase() });
                              handleNext(city.name.toLowerCase());
                            }}
                            className={`p-4 border rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all text-xs font-semibold cursor-pointer ${
                              isSelected
                                ? "border-marigold bg-marigold/10 text-ink-indigo shadow-md scale-[1.01]"
                                : "border-border/60 hover:border-marigold bg-white/70 text-dusk-teal"
                            }`}
                          >
                            <span className="text-3xl">{emoji}</span>
                            <div>
                              <h4 className="font-bold">{city.name}</h4>
                              <p className="text-[10px] text-dusk-teal/80 font-normal">Trending escape</p>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* TYPE 3: city_autocomplete (Departure City with map icon) */}
              {currentNode.type === "city_autocomplete" && (
                <div className="space-y-3">
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-dusk-teal/60 absolute left-3.5" />
                    <input
                      type="text"
                      placeholder="Enter departure city (e.g. Mumbai, Singapore)"
                      value={answers[currentQuestionId] || ""}
                      onChange={(e) => setAnswers({ ...answers, [currentQuestionId]: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-3.5 border border-border rounded-xl bg-white text-xs text-ink-indigo font-semibold focus:outline-none focus:border-marigold"
                    />
                  </div>
                </div>
              )}

              {/* TYPE 4: month_picker_plus_toggle (Visual cards with season emojis) */}
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
                          className={`p-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold cursor-pointer ${
                            isSelected
                              ? "border-marigold bg-marigold/10 text-ink-indigo shadow-md scale-[1.01]"
                              : "border-border/60 hover:border-marigold bg-white/70 text-dusk-teal"
                          }`}
                        >
                          <span className="text-xl">{MONTH_VISUALS[m] || "📅"}</span>
                          <span>{m}</span>
                        </button>
                      );
                    })}
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer pt-2 bg-sand/20 p-3 rounded-xl border border-border/20">
                    <input
                      type="checkbox"
                      checked={answers[currentQuestionId]?.flexible ?? true}
                      onChange={(e) =>
                        setAnswers({
                          ...answers,
                          [currentQuestionId]: { ...answers[currentQuestionId], flexible: e.target.checked }
                        })
                      }
                      className="accent-marigold w-4 h-4"
                    />
                    <span className="text-xs text-dusk-teal font-semibold">My travel dates are flexible (+/- 5 days)</span>
                  </label>
                </div>
              )}

              {/* TYPE 5: number (Nights duration with visual vibe feedback) */}
              {currentNode.type === "number" && (
                <div className="space-y-4 text-center">
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() => {
                        const cur = Number(answers[currentQuestionId] || 7);
                        setAnswers({ ...answers, [currentQuestionId]: Math.max(1, cur - 1) });
                      }}
                      className="w-12 h-12 rounded-full border border-border flex items-center justify-center font-bold text-lg bg-white/50 text-ink-indigo hover:border-marigold shadow-sm cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-4xl font-mono font-bold text-marigold w-28 text-center">
                      {answers[currentQuestionId] || 7}
                    </span>
                    <button
                      onClick={() => {
                        const cur = Number(answers[currentQuestionId] || 7);
                        setAnswers({ ...answers, [currentQuestionId]: Math.min(30, cur + 1) });
                      }}
                      className="w-12 h-12 rounded-full border border-border flex items-center justify-center font-bold text-lg bg-white/50 text-ink-indigo hover:border-marigold shadow-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <div className="p-3 bg-sand/35 border border-border/30 rounded-xl max-w-xs mx-auto text-xs font-semibold text-dusk-teal">
                    {(() => {
                      const n = answers[currentQuestionId] || 7;
                      if (n <= 3) return "🏃 Perfect weekend escape";
                      if (n <= 7) return "🏝️ Ideal week get-away";
                      if (n <= 14) return "🧘 Deep immersive vacation";
                      return "🌎 Grand expedition tour";
                    })()}
                  </div>
                </div>
              )}

              {/* TYPE 6: number_split (Rich Traveler counters instead of plain numbers) */}
              {currentNode.type === "number_split" && (
                <div className="flex flex-col gap-4">
                  <div className="bg-white/70 border border-border/40 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-ink-indigo">Adults</h4>
                      <p className="text-[11px] text-dusk-teal/80">Ages 18 and above</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center font-bold bg-white text-ink-indigo hover:border-marigold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-lg font-bold text-marigold font-mono w-6 text-center">{adultsCount}</span>
                      <button
                        onClick={() => setAdultsCount(Math.min(12, adultsCount + 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center font-bold bg-white text-ink-indigo hover:border-marigold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/70 border border-border/40 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-ink-indigo">Children</h4>
                      <p className="text-[11px] text-dusk-teal/80">Ages 0 to 17</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center font-bold bg-white text-ink-indigo hover:border-marigold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-lg font-bold text-marigold font-mono w-6 text-center">{childrenCount}</span>
                      <button
                        onClick={() => setChildrenCount(Math.min(8, childrenCount + 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center font-bold bg-white text-ink-indigo hover:border-marigold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TYPE 7: multi_number (Child age inputs with mini icons) */}
              {currentNode.type === "multi_number" && (
                <div className="space-y-4 text-center">
                  {childrenCount > 0 ? (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-ink-indigo block text-left">Specify age for each explorer:</label>
                      <div className="grid grid-cols-3 gap-3">
                        {childAges.map((age, idx) => (
                          <div key={idx} className="bg-white/60 p-3 border border-border/30 rounded-xl flex flex-col items-center">
                            <span className="text-[9px] uppercase font-bold text-dusk-teal/70 mb-1">Explorer {idx + 1}</span>
                            <div className="flex items-center gap-1.5">
                              <Baby className="w-3.5 h-3.5 text-dusk-teal/50" />
                              <input
                                type="number"
                                min={0}
                                max={17}
                                value={age}
                                onChange={(e) => handleChildAgeChange(idx, Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-12 p-1 border border-border/60 rounded text-center bg-white text-xs font-mono font-bold text-ink-indigo focus:outline-none focus:border-marigold"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-dusk-teal bg-sand/30 rounded-2xl border border-border/20">
                      No child explorers in party. Simply proceed to the next step.
                    </div>
                  )}
                </div>
              )}

              {/* TYPE 8: slider_set (Custom vibe slider tracks with Lucide icons) */}
              {currentNode.type === "slider_set" && (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {(currentNode.options || "").split("|").map((dim) => (
                    <div key={dim} className="space-y-1.5 text-left border border-border/10 p-3.5 rounded-2xl bg-white/50">
                      <div className="flex justify-between text-xs font-bold text-ink-indigo items-center">
                        <div className="flex items-center gap-1.5">
                          <span>{SLIDER_ICONS[dim] || "✨"}</span>
                          <span>{dim}</span>
                        </div>
                        <span className="font-mono text-marigold font-bold bg-marigold/10 px-2 py-0.5 rounded">{sliders[dim] || 50}%</span>
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
                        className="w-full accent-marigold cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TYPE 9: teaser_view (AI Analyzer loading teaser view) */}
              {currentNode.type === "teaser_view" && (
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-clay-rose bg-clay-rose/10 border border-clay-rose/15 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                      <Sparkles className="w-3.5 h-3.5" />
                      Preferences DNA Matched
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-indigo">
                      Curating Your Dream Itinerary
                    </h2>
                  </div>

                  <div className="p-4.5 rounded-2xl bg-sand/35 text-left text-xs leading-relaxed border border-border/25 flex flex-col gap-2.5 font-semibold text-dusk-teal">
                    <div className="flex justify-between">
                      <span>Destination Match:</span>
                      <span className="text-ink-indigo capitalize">{answers["T0_Q2"] || "Singapore (AI Curation)"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Party Crew:</span>
                      <span className="text-ink-indigo">{answers["T0_Q8"] || "Couple"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Escape Duration:</span>
                      <span className="text-ink-indigo font-mono">{answers["T0_Q6"] || 7} Nights</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investment Tier:</span>
                      <span className="text-ink-indigo font-mono">{answers["T0_Q9"] || "Under ₹50,000"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-left">
                    <h4 className="text-[10px] font-bold uppercase text-marigold tracking-widest font-mono flex items-center gap-1">
                      <Compass className="w-3 h-3 animate-spin" />
                      AI Live Experience Snaps:
                    </h4>
                    <div className="flex flex-col gap-2">
                      <div className="p-3 bg-white border border-border/30 rounded-xl flex items-center justify-between shadow-xs">
                        <span className="font-bold text-xs text-ink-indigo">Marina Bay Sands SkyDeck Access</span>
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">98% Fit</span>
                      </div>
                      <div className="p-3 bg-white border border-border/30 rounded-xl flex items-center justify-between shadow-xs">
                        <span className="font-bold text-xs text-ink-indigo">Gardens by the Bay Premium Light Show</span>
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">92% Fit</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleNext({ analyzed: true })}
                    className="bg-marigold hover:bg-marigold/95 text-ink-indigo font-bold py-4 w-full rounded-xl shadow-md transition-all text-xs border border-marigold mt-2 cursor-pointer"
                  >
                    Refine Experience Targets (Occasion Questions)
                  </Button>
                </div>
              )}

              {/* TYPE 10: account_creation_form (GATE 1 - Secured at the end) */}
              {currentNode.type === "account_creation_form" && (
                <form onSubmit={handleSignUpSubmit} className="space-y-4 text-left">
                  <div className="space-y-1 text-center mb-4">
                    <span className="text-xs font-bold text-marigold uppercase tracking-wider font-mono">
                      Secure Travel Profile
                    </span>
                    <h2 className="text-2xl font-display font-bold text-ink-indigo">
                      Curated Itinerary Draft Saved
                    </h2>
                    <p className="text-xs text-dusk-teal leading-relaxed">
                      Enter your details below to lock in and display your personalized route map.
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
                      <CheckCircle className="w-4 h-4 shrink-0 animate-bounce" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-1 tracking-wider">
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
                      <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-1 tracking-wider">
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
                      <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-1 tracking-wider">
                        WhatsApp Phone Number (For direct concierge notes)
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
                      <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-1 tracking-wider">
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
                      <span className="text-[10px] text-dusk-teal leading-normal font-semibold">
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
                      <span className="text-[10px] text-dusk-teal leading-normal font-semibold">
                        I accept the terms of service and data privacy guidelines. *
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-marigold hover:bg-marigold/95 text-white font-bold rounded-xl mt-2 text-xs shadow-md transition cursor-pointer"
                  >
                    {loading ? "Registering & Compiling matches..." : "Generate & View My Travel Itinerary"}
                  </Button>
                </form>
              )}

              {/* Standard buttons footer */}
              {currentNode.type !== "single_select" && currentNode.type !== "teaser_view" && currentNode.type !== "account_creation_form" && (
                <div className="flex gap-3 mt-4 border-t border-border/10 pt-4">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={historyStack.length === 0}
                    className="flex-1 py-3 text-xs border border-border/40 rounded-xl text-dusk-teal cursor-pointer"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => handleNext()}
                    className="flex-1 py-3 bg-ink-indigo hover:bg-ink-indigo/95 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                  >
                    Next Question
                  </Button>
                </div>
              )}

              {/* Subtle FOMO message footer notice */}
              {fomoMessage && (
                <div className="text-center pt-2 border-t border-border/10 mt-2">
                  <span className="text-[10px] text-amber-800 bg-marigold/10 border border-marigold/15 px-3 py-1 rounded-full font-bold inline-block animate-pulse">
                    {fomoMessage}
                  </span>
                </div>
              )}

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Real-Time Concierge Preview Panel */}
        <div className="lg:col-span-4 w-full">
          <div className="bg-white/90 border border-border/40 p-6 shadow-xl rounded-3xl sticky top-6 space-y-5">
            <div className="border-b border-border/15 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-marigold" />
                <h3 className="font-display text-base font-bold text-ink-indigo">Concierge Blueprint</h3>
              </div>
              <p className="text-[10px] text-dusk-teal/80 mt-0.5">Live curated specifications</p>
            </div>

            <div className="space-y-4">
              {/* Destination */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-dusk-teal/80 font-medium">Destination:</span>
                <span className="font-bold text-ink-indigo capitalize">{displayDestName}</span>
              </div>

              {/* Duration */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-dusk-teal/80 font-medium">Duration:</span>
                <span className="font-mono font-bold text-ink-indigo">{displayNights}</span>
              </div>

              {/* Companions */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-dusk-teal/80 font-medium">Companion:</span>
                <span className="font-bold text-ink-indigo">{displayCompanion}</span>
              </div>

              {/* Budget */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-dusk-teal/80 font-medium">Budget Target:</span>
                <span className="font-mono font-bold text-ink-indigo">{displayBudget}</span>
              </div>

              {/* Hotel */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-dusk-teal/80 font-medium">Stay Sanctuary:</span>
                <span className="font-bold text-ink-indigo">{displayHotel}</span>
              </div>
            </div>

            {/* Live Matches snippet list */}
            {progressPercent >= 20 && (
              <div className="border-t border-border/15 pt-4 space-y-3">
                <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-marigold" />
                  Live Experience Matches:
                </h4>
                <div className="space-y-2">
                  {displayCompanion === "Couple" && (
                    <div className="p-2.5 bg-sand/30 border border-border/15 rounded-xl text-[10px] font-bold text-ink-indigo flex items-center justify-between animate-fade-in">
                      <span>❤️ Sunset Dinner Cruise</span>
                      <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold">98% Fit</span>
                    </div>
                  )}
                  {displayCompanion === "Family" && (
                    <div className="p-2.5 bg-sand/30 border border-border/15 rounded-xl text-[10px] font-bold text-ink-indigo flex items-center justify-between animate-fade-in">
                      <span>👨‍👩‍👧‍👦 Universal Studios Vouchers</span>
                      <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold">95% Fit</span>
                    </div>
                  )}
                  {displayCompanion === "Solo" && (
                    <div className="p-2.5 bg-sand/30 border border-border/15 rounded-xl text-[10px] font-bold text-ink-indigo flex items-center justify-between animate-fade-in">
                      <span>👤 Guided Heritage Walking Tour</span>
                      <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold">92% Fit</span>
                    </div>
                  )}
                  {sliders.Luxury > 50 && (
                    <div className="p-2.5 bg-sand/30 border border-border/15 rounded-xl text-[10px] font-bold text-ink-indigo flex items-center justify-between animate-fade-in">
                      <span>🏨 Capella Villa Day Passes</span>
                      <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold">96% Fit</span>
                    </div>
                  )}
                  {sliders.Adventure > 50 && (
                    <div className="p-2.5 bg-sand/30 border border-border/15 rounded-xl text-[10px] font-bold text-ink-indigo flex items-center justify-between animate-fade-in">
                      <span>🧭 ATV Rainforest Tour</span>
                      <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold">90% Fit</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <p className="text-[9px] text-dusk-teal/60 text-center leading-normal border-t border-border/10 pt-3">
              * Complete all questions to export details to PDF, WhatsApp or share a public link.
            </p>
          </div>
        </div>

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
