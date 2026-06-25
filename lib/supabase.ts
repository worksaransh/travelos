import { createClient } from "@supabase/supabase-js";
import { validateAIItinerary } from "./ai/validator";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3RpbmciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNDY4ODAwMCwiZXhwIjoyMDQwMjY0MDAwfQ.dummy-anon-key";

// We attempt to initialize the real Supabase client.
// Even if the URL is dummy, the constructor will succeed.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// HIGH-FIDELITY MOCK DATA FALLBACKS (B8 Seed)
// ==========================================
export interface Country {
  id: string;
  name: string;
  region: string;
  visa_policy_default: string;
  currency: string;
  supplier_coverage_status: 'active' | 'limited' | 'none';
  domestic_flag: boolean;
}

export interface City {
  id: string;
  country_id: string;
  name: string;
  weather_profile_json: {
    profile: string;
    best_months: string[];
  };
  avg_cost_index: number;
  supplier_coverage_status: 'active' | 'limited' | 'none';
}

export interface Experience {
  id: string;
  area_id: string | null;
  city_id: string;
  name: string;
  category: string;
  price_band: 'low' | 'medium' | 'high';
  duration_hours?: number;
  age_suitability?: string;
  dietary_relevant_flag?: boolean;
  is_signature_experience: boolean;
  popularity_score: number;
  supplier_bookable_flag: boolean;
}

export interface HotelCategory {
  id: string;
  city_id: string;
  tier: 'budget' | '3_star' | '4_star' | '5_star' | 'luxury';
  avg_price_band_per_night: number;
  supplier_availability_flag: boolean;
}

const MOCK_COUNTRIES: Country[] = [
  {
    id: "c0000000-0000-0000-0000-000000000001",
    name: "Singapore",
    region: "Southeast Asia",
    visa_policy_default: "Visa on Arrival / E-Visa (Easy)",
    currency: "SGD",
    supplier_coverage_status: "active",
    domestic_flag: false,
  }
];

const MOCK_CITIES: City[] = [
  {
    id: "c1000000-0000-0000-0000-000000000001",
    country_id: "c0000000-0000-0000-0000-000000000001",
    name: "Singapore",
    weather_profile_json: {
      profile: "tropical",
      best_months: ["Feb", "Mar", "Apr"]
    },
    avg_cost_index: 72.5,
    supplier_coverage_status: "active"
  }
];

const MOCK_EXPERIENCES: Experience[] = [
  {
    id: "e0000000-0000-0000-0000-000000000001",
    area_id: "a0000000-0000-0000-0000-000000000001",
    city_id: "c1000000-0000-0000-0000-000000000001",
    name: "Universal Studios Singapore",
    category: "Theme Parks",
    price_band: "high",
    is_signature_experience: true,
    popularity_score: 95,
    supplier_bookable_flag: true,
  },
  {
    id: "e0000000-0000-0000-0000-000000000002",
    area_id: "a0000000-0000-0000-0000-000000000001",
    city_id: "c1000000-0000-0000-0000-000000000001",
    name: "Beach Clubs (Sentosa)",
    category: "Beaches",
    price_band: "medium",
    is_signature_experience: true,
    popularity_score: 70,
    supplier_bookable_flag: true,
  },
  {
    id: "e0000000-0000-0000-0000-000000000003",
    area_id: "a0000000-0000-0000-0000-000000000002",
    city_id: "c1000000-0000-0000-0000-000000000001",
    name: "Marina Bay Sands SkyPark",
    category: "Observation Decks",
    price_band: "high",
    is_signature_experience: true,
    popularity_score: 98,
    supplier_bookable_flag: true,
  },
  {
    id: "e0000000-0000-0000-0000-000000000004",
    area_id: "a0000000-0000-0000-0000-000000000002",
    city_id: "c1000000-0000-0000-0000-000000000001",
    name: "Gardens by the Bay",
    category: "Nature",
    price_band: "medium",
    is_signature_experience: true,
    popularity_score: 92,
    supplier_bookable_flag: true,
  },
  {
    id: "e0000000-0000-0000-0000-000000000005",
    area_id: "a0000000-0000-0000-0000-000000000003",
    city_id: "c1000000-0000-0000-0000-000000000001",
    name: "Orchard Road Shopping",
    category: "Shopping Malls",
    price_band: "medium",
    is_signature_experience: true,
    popularity_score: 80,
    supplier_bookable_flag: true,
  }
];

const MOCK_HOTELS: HotelCategory[] = [
  { id: "h1", city_id: "c1000000-0000-0000-0000-000000000001", tier: "3_star", avg_price_band_per_night: 6000, supplier_availability_flag: true },
  { id: "h2", city_id: "c1000000-0000-0000-0000-000000000001", tier: "4_star", avg_price_band_per_night: 12000, supplier_availability_flag: true },
  { id: "h3", city_id: "c1000000-0000-0000-0000-000000000001", tier: "5_star", avg_price_band_per_night: 22000, supplier_availability_flag: true },
  { id: "h4", city_id: "c1000000-0000-0000-0000-000000000001", tier: "luxury", avg_price_band_per_night: 35000, supplier_availability_flag: false }
];

// Helper to determine if we are running in dummy/fallback mode.
// We check if the SUPABASE url is the default dummy port or has a default test ref.
const isDummyMode = () => {
  return supabaseUrl.includes("127.0.0.1") || supabaseAnonKey.includes("dummy-anon-key");
};

// ==========================================
// DATA ACCESS METHODS
// ==========================================

export async function getDestinations() {
  if (isDummyMode()) {
    return {
      countries: MOCK_COUNTRIES,
      cities: MOCK_CITIES
    };
  }

  try {
    const { data: countries, error: ce } = await supabase.from("countries").select("*");
    const { data: cities, error: cte } = await supabase.from("cities").select("*");
    
    if (ce || cte) throw new Error(ce?.message || cte?.message);
    
    return {
      countries: countries || MOCK_COUNTRIES,
      cities: cities || MOCK_CITIES
    };
  } catch (err) {
    console.warn("Supabase query failed, falling back to seed mock data:", err);
    return {
      countries: MOCK_COUNTRIES,
      cities: MOCK_CITIES
    };
  }
}

export async function getDestinationBySlug(slug: string) {
  const normSlug = slug.toLowerCase();
  const city = MOCK_CITIES.find(c => c.name.toLowerCase() === normSlug);
  const country = city ? MOCK_COUNTRIES.find(c => c.id === city.country_id) : MOCK_COUNTRIES[0];
  const hotels = city ? MOCK_HOTELS.filter(h => h.city_id === city.id) : MOCK_HOTELS;

  if (isDummyMode()) {
    return { city, country, hotels };
  }

  try {
    const { data: cityData, error: cte } = await supabase.from("cities").select("*").ilike("name", normSlug).single();
    if (cte) throw cte;

    const { data: countryData } = await supabase.from("countries").select("*").eq("id", cityData.country_id).single();
    const { data: hotelsData } = await supabase.from("hotel_categories").select("*").eq("city_id", cityData.id);

    return {
      city: cityData || city,
      country: countryData || country,
      hotels: hotelsData || hotels
    };
  } catch (err) {
    console.warn(`Supabase getDestinationBySlug failed for '${slug}', falling back:`, err);
    return { city, country, hotels };
  }
}

// ==========================================
// ANONYMOUS AUTH & SESSION CAPTURE
// ==========================================

export async function anonymousSignUp(): Promise<string> {
  const localUserIdKey = "journey_os_anon_user_id";

  if (typeof window !== "undefined") {
    const cachedId = localStorage.getItem(localUserIdKey);
    if (cachedId) return cachedId;
  }

  if (isDummyMode()) {
    const newId = crypto.randomUUID();
    if (typeof window !== "undefined") {
      localStorage.setItem(localUserIdKey, newId);
    }
    return newId;
  }

  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    if (data.user?.id) {
      if (typeof window !== "undefined") {
        localStorage.setItem(localUserIdKey, data.user.id);
      }
      return data.user.id;
    }
    throw new Error("No user returned from anonymous sign in");
  } catch (err) {
    console.warn("Supabase anonymous sign in failed, falling back to local uuid:", err);
    const newId = crypto.randomUUID();
    if (typeof window !== "undefined") {
      localStorage.setItem(localUserIdKey, newId);
    }
    return newId;
  }
}

export async function ensureUserAndProfile(userId: string): Promise<string> {
  const localProfileIdKey = "journey_os_profile_id";

  if (typeof window !== "undefined") {
    const cachedId = localStorage.getItem(localProfileIdKey);
    if (cachedId) return cachedId;
  }

  const mockProfileId = crypto.randomUUID();

  if (isDummyMode()) {
    if (typeof window !== "undefined") {
      localStorage.setItem(localProfileIdKey, mockProfileId);
    }
    return mockProfileId;
  }

  try {
    // 1. Ensure user row exists in the custom users table
    const { data: existingUser } = await supabase.from("users").select("id, current_dna_profile_id").eq("id", userId).single();

    if (existingUser?.current_dna_profile_id) {
      if (typeof window !== "undefined") {
        localStorage.setItem(localProfileIdKey, existingUser.current_dna_profile_id);
      }
      return existingUser.current_dna_profile_id;
    }

    if (!existingUser) {
      const { error: insertUserError } = await supabase.from("users").insert({
        id: userId,
        lifecycle_stage: "lead",
        consent_status: "none"
      });
      if (insertUserError) throw insertUserError;
    }

    // 2. Create DNA profile
    const { data: newProfile, error: profileError } = await supabase.from("travel_dna_profiles").insert({
      user_id: userId
    }).select("id").single();

    if (profileError) throw profileError;

    // 3. Link profile back to user
    await supabase.from("users").update({
      current_dna_profile_id: newProfile.id
    }).eq("id", userId);

    if (typeof window !== "undefined") {
      localStorage.setItem(localProfileIdKey, newProfile.id);
    }
    return newProfile.id;
  } catch (err) {
    console.warn("Supabase user/profile linking failed, falling back to local uuid:", err);
    if (typeof window !== "undefined") {
      localStorage.setItem(localProfileIdKey, mockProfileId);
    }
    return mockProfileId;
  }
}

export async function submitQuestionnaireResponse(
  profileId: string,
  tier: number,
  questionId: string,
  answerValue: any
) {
  if (isDummyMode()) {
    console.log(`[MOCK DB] Questionnaire Response Submitted: Profile=${profileId}, Tier=${tier}, Q=${questionId}, A=`, answerValue);
    // Store in localStorage for persistence across browser refreshes during quiz click-throughs
    const responsesKey = "journey_os_mock_responses";
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem(responsesKey) || "[]");
      existing.push({ profile_id: profileId, tier, question_id: questionId, answer_value: answerValue, answered_at: new Date().toISOString() });
      localStorage.setItem(responsesKey, JSON.stringify(existing));
    }
    return { success: true };
  }

  try {
    const { error } = await supabase.from("questionnaire_responses").insert({
      profile_id: profileId,
      tier,
      question_id: questionId,
      answer_value: answerValue,
      source: "explicit"
    });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Supabase submitQuestionnaireResponse failed:", err);
    return { success: true }; // Fallback returns success to avoid UI freezing
  }
}

// ==========================================
// SCORING & PERSONA CLASSIFICATION (GAP 2)
// ==========================================

export async function calculateAndSaveScores(
  profileId: string,
  sliders: Record<string, number>,
  answers: { occasion?: string; groupType?: string; budgetValue?: number; budgetType?: string; hotelCategory?: string }
) {
  if (isDummyMode()) {
    console.log("[MOCK DB] Calculating scores for profile:", profileId);
    return;
  }

  try {
    // 1. Get dimension tags
    const { data: tags, error: te } = await supabase.from("dimension_tags").select("*");
    if (te || !tags) throw te || new Error("Failed fetching dimension tags");

    // 2. Get scoring weights config
    const { data: weights, error: we } = await supabase.from("scoring_weights_config").select("*");
    if (we || !weights) throw we || new Error("Failed fetching weights config");

    // 3. Map hotel category and budget band values for scoring
    const hotelCategory = answers.hotelCategory || "4_star";
    const hotelVal = hotelCategory === "luxury" ? 100 : hotelCategory === "5_star" ? 80 : hotelCategory === "4_star" ? 60 : hotelCategory === "3_star" ? 40 : 20;
    const budgetVal = (answers.budgetValue || 120000) >= 200000 ? 100 : (answers.budgetValue || 120000) >= 100000 ? 70 : 40;

    // 4. Calculate score for each dimension
    for (const tag of tags) {
      const tagWeights = weights.filter((w) => w.dimension_tag_id === tag.id);
      
      let score = 0;
      const sliderVal = sliders[tag.dimension_name] !== undefined ? sliders[tag.dimension_name] : 50;

      if (tagWeights.length === 0) {
        // Fallback default: 80% slider, 20% implicit (defaulting implicit to 50)
        score = sliderVal * 0.8 + 50 * 0.2;
      } else {
        for (const w of tagWeights) {
          if (w.weight_component === "slider_input") {
            score += sliderVal * Number(w.weight_value);
          } else if (w.weight_component === "hotel_category_pref") {
            score += hotelVal * Number(w.weight_value);
          } else if (w.weight_component === "budget_band") {
            score += budgetVal * Number(w.weight_value);
          } else if (w.weight_component === "implicit_signal") {
            // Default implicit signals score to 50 if no implicit events exist
            score += 50 * Number(w.weight_value);
          }
        }
      }

      // 5. Upsert dimension score
      await supabase.from("dimension_scores").upsert({
        profile_id: profileId,
        dimension_tag_id: tag.id,
        score_value: score
      }, { onConflict: "profile_id,dimension_tag_id" });
    }
  } catch (err) {
    console.error("Failed calculating or saving dimension scores:", err);
  }
}

export async function classifyTravelPersona(profileId: string): Promise<{ travelPersona: string; budgetPersona: string }> {
  // Mock fallback logic
  const mockFallback = { travelPersona: "The Practical Planner", budgetPersona: "Comfort" };

  if (isDummyMode()) {
    console.log("[MOCK DB] Classifying persona for profile:", profileId);
    return mockFallback;
  }

  try {
    // 1. Fetch user questionnaire responses
    const { data: responses, error: re } = await supabase
      .from("questionnaire_responses")
      .select("question_id, answer_value")
      .eq("profile_id", profileId);

    if (re || !responses) throw re || new Error("Failed fetching questionnaire responses");

    const answerMap: Record<string, any> = {};
    responses.forEach((r) => {
      answerMap[r.question_id] = r.answer_value;
    });

    // Extract key parameters
    const occasion = answerMap["occasion"] || "Vacation";
    const groupType = answerMap["group_type"] || "couple";
    const budgetValue = Number(answerMap["budget_value"]) || 120000;
    const budgetType = answerMap["budget_type"] || "total";
    const hotelCategory = answerMap["hotel_category"] || "4_star";
    const hiddenGems = answerMap["hidden_gems"] || "no";

    // 2. Fetch computed scores
    const { data: scores, error: se } = await supabase
      .from("dimension_scores")
      .select("dimension_tag_id, score_value")
      .eq("profile_id", profileId);

    if (se || !scores) throw se || new Error("Failed fetching dimension scores");

    const { data: tags } = await supabase.from("dimension_tags").select("*");
    const tagMap: Record<string, string> = {};
    tags?.forEach((t) => {
      tagMap[t.id] = t.dimension_name;
    });

    const scoreMap: Record<string, number> = {};
    scores.forEach((s) => {
      const name = tagMap[s.dimension_tag_id];
      if (name) scoreMap[name] = Number(s.score_value);
    });

    // Make sure all 10 dimensions have a score in our map
    const dimensions = ["Luxury", "Adventure", "Shopping", "Food", "Nature", "Nightlife", "Culture", "Photography", "Relaxation", "Local Experiences"];
    dimensions.forEach((d) => {
      if (scoreMap[d] === undefined) scoreMap[d] = 50;
    });

    // 3. Determine budget persona based on budget value and selection
    // Strict if budget per person is low, or total budget per person is low (e.g. <= 150000 INR)
    const normalizedPerPersonBudget = budgetType === "per_person" ? budgetValue : budgetValue / (groupType === "solo" ? 1 : groupType === "couple" ? 2 : groupType === "family" ? 4 : 4);
    const budgetPersona = normalizedPerPersonBudget <= 150000 ? "Value-Conscious/Strict" : "Flexible";

    // Sort dimensions to find top matches
    const sortedDims = [...dimensions].sort((a, b) => scoreMap[b] - scoreMap[a]);
    const top1 = sortedDims[0];
    const top2 = sortedDims[1];
    const top3 = sortedDims[2];

    const luxuryScore = scoreMap["Luxury"] || 50;
    const relaxationScore = scoreMap["Relaxation"] || 50;
    const cultureScore = scoreMap["Culture"] || 50;
    const foodScore = scoreMap["Food"] || 50;
    const adventureScore = scoreMap["Adventure"] || 50;

    // 4. Query classification rules ordered from DB
    const { data: rules } = await supabase
      .from("persona_classification_rules")
      .select("rule_order, condition_logic, resulting_persona_id")
      .order("rule_order", { ascending: true });

    if (rules && rules.length > 0) {
      // Fetch personas map to get names
      const { data: personasList } = await supabase.from("personas").select("id, name");
      const personaNameMap: Record<string, string> = {};
      personasList?.forEach((p) => {
        personaNameMap[p.id] = p.name;
      });

      // Sequential evaluation of rules
      for (const rule of rules) {
        const cond = rule.condition_logic as any;
        const personaName = personaNameMap[rule.resulting_persona_id || ""];
        if (!personaName) continue;

        // Evaluate Rule 1: Occasion = Business
        if (rule.rule_order === 1 && occasion === "Business") {
          return { travelPersona: personaName, budgetPersona };
        }

        // Evaluate Rule 2: Honeymoon/Anniversary AND romance-adjacent high
        if (rule.rule_order === 2 && (occasion === "Honeymoon" || occasion === "Anniversary")) {
          const romanceHigh = luxuryScore >= 60 || relaxationScore >= 60 || foodScore >= 60;
          if (romanceHigh) {
            return { travelPersona: personaName, budgetPersona };
          }
        }

        // Evaluate Rule 3: Group = Family (unless Adventure/Culture dominate heavily)
        if (rule.rule_order === 3 && groupType === "family") {
          const adventureCultureDominate = adventureScore >= 75 || cultureScore >= 75;
          if (!adventureCultureDominate) {
            return { travelPersona: personaName, budgetPersona };
          }
        }

        // Evaluate Rule 4: Luxury Score > 60 AND Budget = Value-Conscious/Strict
        if (rule.rule_order === 4 && luxuryScore > 60 && budgetPersona === "Value-Conscious/Strict") {
          return { travelPersona: personaName, budgetPersona };
        }

        // Evaluate Rule 5: Relaxation+Nature
        if (rule.rule_order === 5 && sortedDims.slice(0, 2).includes("Relaxation") && sortedDims.slice(0, 2).includes("Nature")) {
          return { travelPersona: personaName, budgetPersona };
        }

        // Evaluate Rule 6: Adventure+Nature
        if (rule.rule_order === 6 && sortedDims.slice(0, 2).includes("Adventure") && sortedDims.slice(0, 2).includes("Nature")) {
          return { travelPersona: personaName, budgetPersona };
        }

        // Evaluate Rule 7: Culture+Local Experiences+Photography (top-2/3 match rule)
        if (rule.rule_order === 7) {
          const matchCount = sortedDims.slice(0, 3).filter((d) => 
            d === "Culture" || d === "Local Experiences" || d === "Photography"
          ).length;
          if (matchCount >= 2) {
            return { travelPersona: personaName, budgetPersona };
          }
        }

        // Evaluate Rule 8: Luxury+flexible budget
        if (rule.rule_order === 8 && sortedDims.slice(0, 2).includes("Luxury") && budgetPersona === "Flexible") {
          return { travelPersona: personaName, budgetPersona };
        }

        // Evaluate Rule 9: Nightlife+Shopping
        if (rule.rule_order === 9 && sortedDims.slice(0, 2).includes("Nightlife") && sortedDims.slice(0, 2).includes("Shopping")) {
          return { travelPersona: personaName, budgetPersona };
        }

        // Evaluate Rule 10: Food+Local Experiences
        if (rule.rule_order === 10 && sortedDims.slice(0, 2).includes("Food") && sortedDims.slice(0, 2).includes("Local Experiences")) {
          return { travelPersona: personaName, budgetPersona };
        }

        // Evaluate Rule 11: Local Experiences + hidden gems
        if (rule.rule_order === 11 && sortedDims.slice(0, 2).includes("Local Experiences") && hiddenGems === "yes") {
          return { travelPersona: personaName, budgetPersona };
        }

        // Evaluate Rule 12: Fallback (no dimension > 60)
        if (rule.rule_order === 12) {
          const maxScore = Math.max(...Object.values(scoreMap));
          if (maxScore <= 60) {
            return { travelPersona: personaName, budgetPersona };
          }
        }
      }
    }

    // Default Fallback
    return { travelPersona: "The Practical Planner", budgetPersona };
  } catch (err) {
    console.error("Failed executing persona classification rules:", err);
    return mockFallback;
  }
}

export async function finalizeDNAProfile(
  profileId: string,
  sliders: Record<string, number>,
  answers: any
) {
  if (isDummyMode()) {
    console.log("[MOCK DB] Finalizing DNA profile:", profileId);
    return { travelPersona: "The Practical Planner", budgetPersona: "Comfort" };
  }

  try {
    // 1. Save hotel category to responses first
    if (answers.hotelCategory) {
      await submitQuestionnaireResponse(profileId, 0, "hotel_category", answers.hotelCategory);
    }
    if (answers.hiddenGems) {
      await submitQuestionnaireResponse(profileId, 0, "hidden_gems", answers.hiddenGems);
    }

    // 2. Calculate and save dimension scores
    await calculateAndSaveScores(profileId, sliders, answers);

    // 3. Classify persona using db rules
    const { travelPersona, budgetPersona } = await classifyTravelPersona(profileId);

    // 4. Update travel DNA profile
    const { error: pe } = await supabase
      .from("travel_dna_profiles")
      .update({
        travel_persona: travelPersona,
        budget_persona: budgetPersona,
        last_updated: new Date().toISOString()
      })
      .eq("id", profileId);

    if (pe) throw pe;

    return { travelPersona, budgetPersona };
  } catch (err) {
    console.error("Failed finalization of DNA Profile:", err);
    return { travelPersona: "The Practical Planner", budgetPersona: "Comfort" };
  }
}

export async function submitWhatsAppLead(profileId: string, whatsapp: string) {
  if (isDummyMode()) {
    console.log("[MOCK DB] WhatsApp Lead Submitted:", whatsapp);
    return { success: true };
  }

  try {
    const { data: profile, error: pe } = await supabase
      .from("travel_dna_profiles")
      .select("user_id")
      .eq("id", profileId)
      .single();
    if (pe || !profile) throw pe || new Error("Profile not found");

    const userId = profile.user_id;

    const { error: le } = await supabase.from("leads").insert({
      user_id: userId,
      capture_gate: "gate1_whatsapp",
      whatsapp_number: whatsapp,
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      consent_version: "v1"
    });
    if (le) throw le;

    const { error: ue } = await supabase
      .from("users")
      .update({
        lifecycle_stage: "engaged",
        consent_status: "gate1_whatsapp"
      })
      .eq("id", userId);
    if (ue) throw ue;

    return { success: true };
  } catch (err) {
    console.error("Failed submitting WhatsApp lead:", err);
    return { success: false, error: err };
  }
}

export async function generateItineraryForProfile(
  profileId: string,
  sliders: Record<string, number>,
  answers: any
) {
  if (isDummyMode()) {
    return { itineraryId: crypto.randomUUID() };
  }

  try {
    const { travelPersona, budgetPersona } = await finalizeDNAProfile(profileId, sliders, answers);

    const { data: profile, error: pe } = await supabase
      .from("travel_dna_profiles")
      .select("user_id")
      .eq("id", profileId)
      .single();
    if (pe || !profile) throw pe || new Error("Profile not found");
    const userId = profile.user_id;

    const destSlug = (answers.destinationSlug || "singapore").toLowerCase();
    let cityId = "c1000000-0000-0000-0000-000000000001"; // default Singapore UUID
    const { data: cityData } = await supabase.from("cities").select("id").ilike("name", destSlug).single();
    if (cityData?.id) {
      cityId = cityData.id;
    }

    const durationDays = Number(answers.durationDays) || 5;
    const budgetVal = Number(answers.budgetValue) || 120000;

    // Find a matching active package to snapshot
    const tierNormalized = (budgetPersona === "Flexible" ? "premium" : "comfort").toLowerCase();
    const { data: pkg } = await supabase
      .from("packages")
      .select("id")
      .eq("destination_city_id", cityId)
      .eq("package_tier", tierNormalized)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    let packageVersionId: string | null = null;
    if (pkg?.id) {
      try {
        const { data: snapshotId, error: snapshotErr } = await supabase.rpc("create_package_snapshot", {
          p_package_id: pkg.id
        });
        if (!snapshotErr && snapshotId) {
          packageVersionId = snapshotId;
        }
      } catch (err) {
        console.warn("Failed to create package version snapshot:", err);
      }
    }

    const { data: newItinerary, error: itError } = await supabase
      .from("itineraries")
      .insert({
        user_id: userId,
        dna_snapshot_id: profileId,
        destination_city_id: cityId,
        status: "active",
        package_tier: budgetPersona === "Flexible" ? "Premium" : "Comfort",
        total_price_estimate: budgetVal,
        package_version_id: packageVersionId
      })
      .select("id")
      .single();
    if (itError || !newItinerary) throw itError || new Error("Failed creating itinerary");

    const itineraryId = newItinerary.id;

    // 1. Proximity matching based on Travel DNA slider scores (Task 23)
    let expIds: string[] = [];
    try {
      // Query experiences in target city that are supplier bookable
      const { data: dbExperiences } = await supabase
        .from("experiences")
        .select(`
          id,
          name,
          category,
          price_band,
          experience_dimension_tags (
            weight,
            dimension_tag_id
          )
        `)
        .eq("city_id", cityId)
        .eq("supplier_bookable_flag", true);

      // Query dimension tags to match IDs to names
      const { data: dimTags } = await supabase
        .from("dimension_tags")
        .select("id, dimension_name");

      const tagIdMap: Record<string, string> = {};
      dimTags?.forEach((t) => {
        tagIdMap[t.id] = t.dimension_name;
      });

      // Compute dot-product match score: Sum(slider * tag_weight)
      const ranked = (dbExperiences || []).map((exp: any) => {
        let score = 0;
        exp.experience_dimension_tags?.forEach((link: any) => {
          const dimName = tagIdMap[link.dimension_tag_id];
          if (dimName && sliders[dimName]) {
            score += Number(link.weight || 0) * sliders[dimName];
          }
        });
        return { id: exp.id, score };
      }).sort((a, b) => b.score - a.score);

      if (ranked.length > 0) {
        expIds = ranked.map((r) => r.id);
      }
    } catch (err) {
      console.warn("Failed calculating proximity match scores, using fallbacks:", err);
    }

    // Default fallbacks if database matches are empty
    if (expIds.length === 0) {
      expIds = [
        "e0000000-0000-0000-0000-000000000004", // Gardens by the Bay
        "e0000000-0000-0000-0000-000000000003", // Marina Bay Sands
        "e0000000-0000-0000-0000-000000000001", // USS
        "e0000000-0000-0000-0000-000000000005", // Orchard Road Shopping
        "e0000000-0000-0000-0000-000000000002"  // Beach Clubs
      ];
    }

    // 2. Generate days and items
    for (let dayNum = 1; dayNum <= durationDays; dayNum++) {
      const { data: dayData, error: dayError } = await supabase
        .from("itinerary_days")
        .insert({
          itinerary_id: itineraryId,
          day_number: dayNum
        })
        .select("id")
        .single();
      if (dayError || !dayData) throw dayError || new Error("Failed creating itinerary day");

      const dayId = dayData.id;

      const primaryExpIndex = (dayNum - 1) % expIds.length;
      await supabase.from("itinerary_items").insert({
        itinerary_day_id: dayId,
        experience_id: expIds[primaryExpIndex],
        sequence_order: 1,
        upsell_flag: false
      });

      if (dayNum % 2 === 1) {
        const secondaryExpIndex = (dayNum) % expIds.length;
        await supabase.from("itinerary_items").insert({
          itinerary_day_id: dayId,
          experience_id: expIds[secondaryExpIndex],
          sequence_order: 2,
          upsell_flag: false
        });
      }
    }

    // 3. AI Validation Check on generated plan payload (Task 22)
    try {
      const validationDays = [];
      for (let d = 1; d <= durationDays; d++) {
        const pIdx = (d - 1) % expIds.length;
        const sIdx = (d) % expIds.length;
        validationDays.push({
          day: d,
          experienceIds: d % 2 === 1 ? [expIds[pIdx], expIds[sIdx]] : [expIds[pIdx]],
          highlights: `Dynamic exploration day matching travel preferences.`
        });
      }

      const valPayload = {
        itineraryName: `${answers.destinationSlug || "Singapore"} Tailored Signature Plan`,
        destinationCity: answers.destinationSlug || "Singapore",
        packageTier: budgetPersona === "Flexible" ? "premium" : "comfort",
        estimatedCost: budgetVal,
        days: validationDays
      };

      const report = await validateAIItinerary(JSON.stringify(valPayload));
      
      // Auto-flag low-confidence itineraries for admin review queue
      if (!report.isValid || report.humanReviewRequired || report.autoReject) {
        await supabase.from("content_approval_queue").insert({
          entity_type: "itinerary",
          entity_id: itineraryId,
          status: "pending",
          notes: `AUTO-FLAGGED: Validation score is ${report.confidenceScore}%. Errors: ${report.errors.join(", ")}`
        });
      }
    } catch (valErr) {
      console.warn("AI Itinerary validation pipeline execution warning:", valErr);
    }

    return { itineraryId };
  } catch (err) {
    console.error("Failed generating itinerary:", err);
    throw err;
  }
}

export async function getItinerary(itineraryId: string) {
  if (isDummyMode()) {
    return {
      itinerary: {
        id: itineraryId,
        title: "Your Custom Singapore Itinerary",
        package_tier: "Comfort",
        total_price_estimate: 120000,
        destination_city_id: "c1000000-0000-0000-0000-000000000001",
        cities: { name: "Singapore", countries: { name: "Singapore" } },
        travel_dna_profiles: { travel_persona: "The Practical Planner", budget_persona: "Comfort" }
      },
      days: [
        {
          id: "day1",
          day_number: 1,
          itinerary_items: [
            {
              id: "item1",
              sequence_order: 1,
              experiences: {
                id: "e0000000-0000-0000-0000-000000000004",
                name: "Gardens by the Bay",
                price_band: "medium",
                category: "Nature",
                is_signature_experience: true
              }
            }
          ]
        }
      ]
    };
  }

  try {
    const { data: itinerary, error: ie } = await supabase
      .from("itineraries")
      .select(`
        *,
        cities (
          name,
          countries (name)
        ),
        travel_dna_profiles (
          travel_persona,
          budget_persona
        )
      `)
      .eq("id", itineraryId)
      .single();

    if (ie || !itinerary) throw ie || new Error("Itinerary not found");

    const { data: days, error: de } = await supabase
      .from("itinerary_days")
      .select(`
        *,
        itinerary_items (
          *,
          experiences (
            *
          )
        )
      `)
      .eq("itinerary_id", itineraryId)
      .order("day_number", { ascending: true });

    if (de) throw de;

    const formattedDays = days?.map((day: any) => {
      const items = day.itinerary_items || [];
      items.sort((a: any, b: any) => a.sequence_order - b.sequence_order);
      return {
        ...day,
        itinerary_items: items
      };
    }) || [];

    return {
      itinerary,
      days: formattedDays
    };
  } catch (err) {
    console.error("Failed fetching itinerary:", err);
    throw err;
  }
}

export async function checkLifecycleStage(profileId: string): Promise<string> {
  if (isDummyMode()) return "engaged";
  try {
    const { data: profile } = await supabase.from("travel_dna_profiles").select("user_id").eq("id", profileId).single();
    if (!profile) return "lead";
    const { data: user } = await supabase.from("users").select("lifecycle_stage").eq("id", profile.user_id).single();
    return user?.lifecycle_stage || "lead";
  } catch {
    return "lead";
  }
}

export async function checkoutBookingGate(
  itineraryId: string,
  name: string,
  email: string,
  preferredTime: string
) {
  if (isDummyMode()) {
    console.log("[MOCK DB] Gate 2 checkout submitted for itinerary:", itineraryId);
    return { success: true };
  }

  try {
    const { data: itinerary, error: ie } = await supabase
      .from("itineraries")
      .select("user_id")
      .eq("id", itineraryId)
      .single();
    if (ie || !itinerary) throw ie || new Error("Itinerary not found");

    const userId = itinerary.user_id;

    const { error: le } = await supabase.from("leads").insert({
      user_id: userId,
      capture_gate: "gate2_full",
      email: email,
      name: name,
      preferred_contact_time: preferredTime,
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      consent_version: "v1"
    });
    if (le) throw le;

    const { error: ue } = await supabase
      .from("users")
      .update({
        lifecycle_stage: "booking_intent",
        consent_status: "gate2_full"
      })
      .eq("id", userId);
    if (ue) throw ue;

    return { success: true };
  } catch (err) {
    console.error("Failed submitting checkout details:", err);
    return { success: false, error: err };
  }
}

export async function submitDripResponseAndUpdateDNA(
  profileId: string,
  questionId: string,
  answerValue: string,
  dimension: string,
  scoreDelta: number
) {
  if (isDummyMode()) {
    console.log("[MOCK DB] Drip Question Submitted:", questionId, "Value:", answerValue);
    return { success: true };
  }

  try {
    await supabase.from("implicit_signals").insert({
      profile_id: profileId,
      event_type: "drip_question_select",
      event_metadata: { question_id: questionId, answer_value: answerValue, dimension, score_delta: scoreDelta }
    });

    const { data: tagData } = await supabase.from("dimension_tags").select("id").eq("dimension_name", dimension).single();
    if (tagData?.id) {
      const { data: scoreObj } = await supabase
        .from("dimension_scores")
        .select("score_value")
        .eq("profile_id", profileId)
        .eq("dimension_tag_id", tagData.id)
        .single();
      
      const currentScore = scoreObj ? Number(scoreObj.score_value) : 50;
      const newScore = Math.max(0, Math.min(100, currentScore + scoreDelta));

      await supabase.from("dimension_scores").upsert({
        profile_id: profileId,
        dimension_tag_id: tagData.id,
        score_value: newScore
      }, { onConflict: "profile_id,dimension_tag_id" });

      const { travelPersona, budgetPersona } = await classifyTravelPersona(profileId);
      await supabase.from("travel_dna_profiles").update({
        travel_persona: travelPersona,
        budget_persona: budgetPersona,
        last_updated: new Date().toISOString()
      }).eq("id", profileId);
    }

    return { success: true };
  } catch (err) {
    console.error("Failed submitting drip response:", err);
    return { success: false, error: err };
  }
}

