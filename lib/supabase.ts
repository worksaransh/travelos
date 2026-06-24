import { createClient } from "@supabase/supabase-js";

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
