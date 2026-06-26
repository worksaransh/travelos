// Automatically generated static data fallbacks from CSV inputs.
// Do not edit directly, use parse_csv_to_ts.js instead.

export interface QuestionBankItem {
  question_id: string;
  category: string;
  subcategory: string | null;
  question_text_conversational: string;
  type: string;
  conditional_logic: string | null;
  weight: number;
  impact_on_recommendations: string | null;
}

export interface RelatedDestinationItem {
  city_id: string;
  city_name: string;
  related_city_id: string;
  related_city_name: string;
  similarity_score: number;
}

export interface MoodCategoryItem {
  mood_name: string;
  filter_rule_json: any;
}

export interface DestQuestionTemplateItem {
  category: string;
  template_question_text: string;
  applies_to_experience_category: string;
}

export const QUESTION_BANK_STATIC: QuestionBankItem[] = [
  {
    "question_id": "B01",
    "category": "Basic",
    "subcategory": "Destination Status",
    "question_text_conversational": "Got a place in mind, or should we surprise you?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 1,
    "impact_on_recommendations": "Routes to destination recommendation vs known-destination flow"
  },
  {
    "question_id": "B02",
    "category": "Basic",
    "subcategory": "Trip Type",
    "question_text_conversational": "Sticking close to home, or going further afield?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 1,
    "impact_on_recommendations": "Sets domestic/international branching for Tier 2 questions"
  },
  {
    "question_id": "B03",
    "category": "Basic",
    "subcategory": "Departure",
    "question_text_conversational": "Where are you setting off from?",
    "type": "city_autocomplete",
    "conditional_logic": null,
    "weight": 1,
    "impact_on_recommendations": "Drives flight_routes matching and cost/duration filtering"
  },
  {
    "question_id": "B04",
    "category": "Basic",
    "subcategory": "Timing",
    "question_text_conversational": "When's this trip happening?",
    "type": "month_picker",
    "conditional_logic": null,
    "weight": 1,
    "impact_on_recommendations": "Seasonal/weather matching, festival advisory checks"
  },
  {
    "question_id": "B05",
    "category": "Basic",
    "subcategory": "Flexibility",
    "question_text_conversational": "Any specific dates you're locked into, or is there wiggle room?",
    "type": "toggle",
    "conditional_logic": null,
    "weight": 0.6,
    "impact_on_recommendations": "Affects pricing-tier and availability messaging"
  },
  {
    "question_id": "B06",
    "category": "Basic",
    "subcategory": "Duration",
    "question_text_conversational": "How many days do you actually have?",
    "type": "number",
    "conditional_logic": null,
    "weight": 1,
    "impact_on_recommendations": "Filters packages by duration_nights"
  },
  {
    "question_id": "B07",
    "category": "Basic",
    "subcategory": "Group Size",
    "question_text_conversational": "Just you, or is this a crew?",
    "type": "number_split",
    "conditional_logic": null,
    "weight": 1,
    "impact_on_recommendations": "Drives per-person vs total pricing logic"
  },
  {
    "question_id": "B08",
    "category": "Basic",
    "subcategory": "Group Type",
    "question_text_conversational": "Who's coming with you on this one?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 1,
    "impact_on_recommendations": "Drives conditional occasion options and persona hard-overrides"
  },
  {
    "question_id": "B09",
    "category": "Basic",
    "subcategory": "Group Type Detail",
    "question_text_conversational": "Kids in the mix? What ages?",
    "type": "multi_number",
    "conditional_logic": "group_type==Family",
    "weight": 0.8,
    "impact_on_recommendations": "Filters experiences by age_suitability"
  },
  {
    "question_id": "B10",
    "category": "Basic",
    "subcategory": "Occasion",
    "question_text_conversational": "What's the story behind this trip?",
    "type": "single_select (conditional options)",
    "conditional_logic": null,
    "weight": 1,
    "impact_on_recommendations": "Drives persona hard-override rules"
  },
  {
    "question_id": "B11",
    "category": "Basic",
    "subcategory": "Budget",
    "question_text_conversational": "If this trip becomes unforgettable, how much are you comfortable spending?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 1,
    "impact_on_recommendations": "Primary budget-band filter"
  },
  {
    "question_id": "B12",
    "category": "Basic",
    "subcategory": "Budget Scope",
    "question_text_conversational": "Is that for everyone, or just you?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.7,
    "impact_on_recommendations": "Per-person vs total trip budget normalization"
  },
  {
    "question_id": "B13",
    "category": "Basic",
    "subcategory": "Stay Style",
    "question_text_conversational": "When you picture where you're staying, what's the vibe?",
    "type": "visual_card_select",
    "conditional_logic": null,
    "weight": 0.9,
    "impact_on_recommendations": "Hotel category preference, feeds Luxury dimension score"
  },
  {
    "question_id": "B14",
    "category": "Basic",
    "subcategory": "Repeat Traveler",
    "question_text_conversational": "Have you done a trip like this before, or is this a first?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.4,
    "impact_on_recommendations": "Confidence-score weighting, novelty-seeking signal"
  },
  {
    "question_id": "B15",
    "category": "Basic",
    "subcategory": "Trip Stakes",
    "question_text_conversational": "On a scale of 'nice to have' to 'this has to be perfect' - where does this trip sit?",
    "type": "slider",
    "conditional_logic": null,
    "weight": 0.6,
    "impact_on_recommendations": "Affects how aggressively upsells/hidden-gems get surfaced"
  },
  {
    "question_id": "P01",
    "category": "Personality",
    "subcategory": "Luxury (depth)",
    "question_text_conversational": "When you say luxury, is it more 'quiet private villa' or 'rooftop bar everyone's watching'?",
    "type": "single_select",
    "conditional_logic": "luxury_score>=60",
    "weight": 0.7,
    "impact_on_recommendations": "Refines Luxury dimension into a quiet/social sub-axis for hotel & experience matching"
  },
  {
    "question_id": "P02",
    "category": "Personality",
    "subcategory": "Adventure (depth)",
    "question_text_conversational": "Adrenaline rush, or just want to feel like you're somewhere wild?",
    "type": "single_select",
    "conditional_logic": "adventure_score>=50",
    "weight": 0.6,
    "impact_on_recommendations": "Distinguishes high-intensity activities from scenic/nature-adjacent ones"
  },
  {
    "question_id": "P03",
    "category": "Personality",
    "subcategory": "Food (depth)",
    "question_text_conversational": "Street food chaos or a proper sit-down table?",
    "type": "single_select",
    "conditional_logic": "food_score>=50",
    "weight": 0.5,
    "impact_on_recommendations": "Filters Food-tagged experiences by formality"
  },
  {
    "question_id": "P04",
    "category": "Personality",
    "subcategory": "Culture (depth)",
    "question_text_conversational": "More into the history and stories, or the art and architecture?",
    "type": "single_select",
    "conditional_logic": "culture_score>=50",
    "weight": 0.5,
    "impact_on_recommendations": "Sub-tags Culture experiences for finer matching"
  },
  {
    "question_id": "P05",
    "category": "Personality",
    "subcategory": "Nightlife (depth)",
    "question_text_conversational": "Dancing till 2am, or a couple of good drinks and done?",
    "type": "single_select",
    "conditional_logic": "nightlife_score>=40",
    "weight": 0.5,
    "impact_on_recommendations": "Filters Nightlife intensity"
  },
  {
    "question_id": "P06",
    "category": "Personality",
    "subcategory": "Relaxation (depth)",
    "question_text_conversational": "Total stillness, or relaxed but still moving around?",
    "type": "single_select",
    "conditional_logic": "relaxation_score>=50",
    "weight": 0.5,
    "impact_on_recommendations": "Feeds Pace Preference alongside the dedicated pace question"
  },
  {
    "question_id": "P07",
    "category": "Personality",
    "subcategory": "Photography (depth)",
    "question_text_conversational": "Are you planning the trip around the photos, or just happy if a few come out well?",
    "type": "single_select",
    "conditional_logic": "photography_score>=50",
    "weight": 0.4,
    "impact_on_recommendations": "Affects whether Photography-tagged experiences get prioritized in sequencing"
  },
  {
    "question_id": "P08",
    "category": "Personality",
    "subcategory": "Local Experiences (depth)",
    "question_text_conversational": "Want to meet locals and do what they do, or happy observing from a comfortable distance?",
    "type": "single_select",
    "conditional_logic": "local_exp_score>=50",
    "weight": 0.6,
    "impact_on_recommendations": "Strong Hidden-Gem-Hunter persona signal"
  },
  {
    "question_id": "P09",
    "category": "Personality",
    "subcategory": "Shopping (depth)",
    "question_text_conversational": "Hunting for something specific, or just enjoy browsing?",
    "type": "single_select",
    "conditional_logic": "shopping_score>=40",
    "weight": 0.4,
    "impact_on_recommendations": "Filters Shopping experiences by market vs mall type"
  },
  {
    "question_id": "P10",
    "category": "Personality",
    "subcategory": "Nature (depth)",
    "question_text_conversational": "Watching from a viewpoint, or actually getting into it (hiking, swimming, etc.)?",
    "type": "single_select",
    "conditional_logic": "nature_score>=50",
    "weight": 0.5,
    "impact_on_recommendations": "Distinguishes passive-scenic from active-nature experiences"
  },
  {
    "question_id": "H01",
    "category": "Hidden Preferences",
    "subcategory": "Crowds",
    "question_text_conversational": "Big famous landmarks even if it means crowds, or smaller and quieter wins every time?",
    "type": "slider",
    "conditional_logic": null,
    "weight": 0.8,
    "impact_on_recommendations": "Direct input to disappointment-tag exclusion logic"
  },
  {
    "question_id": "H02",
    "category": "Hidden Preferences",
    "subcategory": "Walking",
    "question_text_conversational": "Honestly, how much walking are you up for in a day?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.6,
    "impact_on_recommendations": "Excludes 'Too Much Walking' tagged experiences if low tolerance"
  },
  {
    "question_id": "H03",
    "category": "Hidden Preferences",
    "subcategory": "Long Flights",
    "question_text_conversational": "Be honest - how do you feel about long-haul flights?",
    "type": "single_select",
    "conditional_logic": "trip_type==International",
    "weight": 0.7,
    "impact_on_recommendations": "Filters destinations by flight_routes duration"
  },
  {
    "question_id": "H04",
    "category": "Hidden Preferences",
    "subcategory": "Kid-Friendliness",
    "question_text_conversational": "If kids are coming, how important is it that everything is genuinely kid-proof, not just kid-tolerant?",
    "type": "slider",
    "conditional_logic": "group_type==Family",
    "weight": 0.7,
    "impact_on_recommendations": "Tightens age_suitability filtering"
  },
  {
    "question_id": "H05",
    "category": "Hidden Preferences",
    "subcategory": "Elderly Comfort",
    "question_text_conversational": "Anyone in the group who needs a gentler pace or easier mobility?",
    "type": "toggle",
    "conditional_logic": null,
    "weight": 0.7,
    "impact_on_recommendations": "Filters out high-physical-intensity experiences"
  },
  {
    "question_id": "H06",
    "category": "Hidden Preferences",
    "subcategory": "Noise Sensitivity",
    "question_text_conversational": "Buzzing energy or peace and quiet - which recharges you?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.4,
    "impact_on_recommendations": "Secondary filter on Nightlife/Local Market experiences"
  },
  {
    "question_id": "H07",
    "category": "Hidden Preferences",
    "subcategory": "Connectivity",
    "question_text_conversational": "How much do you need to stay connected (work, calls) during this trip?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.3,
    "impact_on_recommendations": "Flags destinations/stays with known connectivity gaps"
  },
  {
    "question_id": "H08",
    "category": "Hidden Preferences",
    "subcategory": "Spice Tolerance",
    "question_text_conversational": "How adventurous are you with spicy or unfamiliar food?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.3,
    "impact_on_recommendations": "Tunes Food experience recommendations"
  },
  {
    "question_id": "H09",
    "category": "Hidden Preferences",
    "subcategory": "Heat/Sun Tolerance",
    "question_text_conversational": "Be honest about your heat tolerance - it changes everything about pacing.",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.5,
    "impact_on_recommendations": "Affects itinerary time-of-day sequencing in hot destinations"
  },
  {
    "question_id": "H10",
    "category": "Hidden Preferences",
    "subcategory": "Motion Sensitivity",
    "question_text_conversational": "Do boats, winding roads, or turbulence get to you?",
    "type": "toggle",
    "conditional_logic": null,
    "weight": 0.4,
    "impact_on_recommendations": "Flags Cruise/Road Trip experiences for a caution note"
  },
  {
    "question_id": "H11",
    "category": "Hidden Preferences",
    "subcategory": "Spontaneity",
    "question_text_conversational": "Do you want a tight plan, or just the highlights with room to wander?",
    "type": "slider",
    "conditional_logic": null,
    "weight": 0.6,
    "impact_on_recommendations": "Feeds Pace Preference directly"
  },
  {
    "question_id": "H12",
    "category": "Hidden Preferences",
    "subcategory": "Social Battery",
    "question_text_conversational": "Even on a group trip, do you need pockets of alone time?",
    "type": "toggle",
    "conditional_logic": "group_type!=Solo",
    "weight": 0.4,
    "impact_on_recommendations": "Flags itinerary density warnings for group trips"
  },
  {
    "question_id": "H13",
    "category": "Hidden Preferences",
    "subcategory": "Morning vs Night",
    "question_text_conversational": "Are you up and out early, or a slower starter?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.4,
    "impact_on_recommendations": "Affects time-of-day sequencing of activities"
  },
  {
    "question_id": "H14",
    "category": "Hidden Preferences",
    "subcategory": "Photography Priority",
    "question_text_conversational": "Will you actually stop the group to get the shot?",
    "type": "toggle",
    "conditional_logic": "photography_score>=60",
    "weight": 0.3,
    "impact_on_recommendations": "Pads itinerary timing around high-Photography experiences"
  },
  {
    "question_id": "H15",
    "category": "Hidden Preferences",
    "subcategory": "Dietary",
    "question_text_conversational": "Any dietary needs we should plan meals around?",
    "type": "multi_select",
    "conditional_logic": null,
    "weight": 0.8,
    "impact_on_recommendations": "Hard filter on Food-relevant experiences"
  },
  {
    "question_id": "H16",
    "category": "Hidden Preferences",
    "subcategory": "Accessibility",
    "question_text_conversational": "Any mobility or accessibility needs we should know about?",
    "type": "free_text",
    "conditional_logic": null,
    "weight": 0.8,
    "impact_on_recommendations": "Hard filter, flagged for human Agent review before confirming"
  },
  {
    "question_id": "H17",
    "category": "Hidden Preferences",
    "subcategory": "Safety Priority",
    "question_text_conversational": "How much does the safety reputation of a place factor into where you'll go?",
    "type": "slider",
    "conditional_logic": null,
    "weight": 0.5,
    "impact_on_recommendations": "Weights destination recommendation alongside visa/supplier-coverage filters"
  },
  {
    "question_id": "H18",
    "category": "Hidden Preferences",
    "subcategory": "Souvenir Shopping",
    "question_text_conversational": "Do you usually set aside separate money for shopping/souvenirs?",
    "type": "toggle",
    "conditional_logic": null,
    "weight": 0.3,
    "impact_on_recommendations": "Informs whether Shopping experiences get budget-aware framing"
  },
  {
    "question_id": "H19",
    "category": "Hidden Preferences",
    "subcategory": "Jet Lag Sensitivity",
    "question_text_conversational": "Does jet lag hit you hard?",
    "type": "toggle",
    "conditional_logic": "trip_type==International",
    "weight": 0.3,
    "impact_on_recommendations": "Affects suggested arrival-day pacing"
  },
  {
    "question_id": "H20",
    "category": "Hidden Preferences",
    "subcategory": "Control vs Surprise",
    "question_text_conversational": "Do you want to know exactly what's happening each day, or are you fine being surprised?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.5,
    "impact_on_recommendations": "Affects how much itinerary detail gets shown upfront vs revealed day-of"
  },
  {
    "question_id": "S01",
    "category": "Spending Psychology",
    "subcategory": "Budget Rigidity",
    "question_text_conversational": "Is that budget a hard line, or is there some give if something's worth it?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 1,
    "impact_on_recommendations": "Sets Budget Persona flexibility tier directly"
  },
  {
    "question_id": "S02",
    "category": "Spending Psychology",
    "subcategory": "Extend Willingness",
    "question_text_conversational": "If one extra day made the trip noticeably better, would you consider it?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.7,
    "impact_on_recommendations": "Feeds Extra-Day upsell eligibility (Upsell Score input)"
  },
  {
    "question_id": "S03",
    "category": "Spending Psychology",
    "subcategory": "Hotel Upgrade Willingness",
    "question_text_conversational": "Would you pay more for a noticeably nicer place to stay?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.7,
    "impact_on_recommendations": "Feeds Hotel Upgrade upsell eligibility"
  },
  {
    "question_id": "S04",
    "category": "Spending Psychology",
    "subcategory": "Experience Upgrade Willingness",
    "question_text_conversational": "Same question, but for experiences instead of hotels - worth paying more for the better version?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.7,
    "impact_on_recommendations": "Feeds Premium Experience upsell eligibility"
  },
  {
    "question_id": "S05",
    "category": "Spending Psychology",
    "subcategory": "Splurge Pattern",
    "question_text_conversational": "Do you usually splurge on one big thing, or spread the budget evenly?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.5,
    "impact_on_recommendations": "Informs whether upsells get framed as one big splurge vs small add-ons"
  },
  {
    "question_id": "S06",
    "category": "Spending Psychology",
    "subcategory": "Flight vs Experience Priority",
    "question_text_conversational": "If you had to cut cost somewhere, would it be the flight or the experiences?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.5,
    "impact_on_recommendations": "Tunes package tier recommendation tradeoffs"
  },
  {
    "question_id": "S07",
    "category": "Spending Psychology",
    "subcategory": "Booking Timing",
    "question_text_conversational": "Do you usually lock things in early, or wait for a deal?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.3,
    "impact_on_recommendations": "Informs urgency/scarcity messaging appropriateness"
  },
  {
    "question_id": "S08",
    "category": "Spending Psychology",
    "subcategory": "Installment Interest",
    "question_text_conversational": "Would paying in installments make a bigger trip feel more doable?",
    "type": "toggle",
    "conditional_logic": null,
    "weight": 0.4,
    "impact_on_recommendations": "Flags interest in EMI/payment-plan options for the booking step"
  },
  {
    "question_id": "S09",
    "category": "Spending Psychology",
    "subcategory": "Insurance Interest",
    "question_text_conversational": "How much do you think about travel insurance when booking?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.3,
    "impact_on_recommendations": "Informs whether insurance is offered proactively or left optional"
  },
  {
    "question_id": "S10",
    "category": "Spending Psychology",
    "subcategory": "On-Trip Upgrade Openness",
    "question_text_conversational": "Once you're actually there, are you usually open to a spontaneous upgrade (better table, better view)?",
    "type": "toggle",
    "conditional_logic": null,
    "weight": 0.5,
    "impact_on_recommendations": "Signals for Agent to mention day-of upgrade options"
  },
  {
    "question_id": "S11",
    "category": "Spending Psychology",
    "subcategory": "Group Cost Splitting",
    "question_text_conversational": "If this is a group trip, is everyone splitting evenly, or is the budget really just yours?",
    "type": "single_select",
    "conditional_logic": "group_size>1",
    "weight": 0.4,
    "impact_on_recommendations": "Affects whether budget questions are answered as 'total' or 'my share'"
  },
  {
    "question_id": "S12",
    "category": "Spending Psychology",
    "subcategory": "Hidden Gems Value",
    "question_text_conversational": "Would you pay a bit more for something only locals would know about?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.5,
    "impact_on_recommendations": "Direct input to Hidden Gems framing, though this upsell is always offered regardless"
  },
  {
    "question_id": "S13",
    "category": "Spending Psychology",
    "subcategory": "Tipping Comfort",
    "question_text_conversational": "How comfortable are you with tipping norms in unfamiliar places?",
    "type": "single_select",
    "conditional_logic": "trip_type==International",
    "weight": 0.2,
    "impact_on_recommendations": "Minor - informs pre-trip guidance content, not recommendation logic"
  },
  {
    "question_id": "S14",
    "category": "Spending Psychology",
    "subcategory": "Currency Anxiety",
    "question_text_conversational": "Does thinking in a foreign currency make you over- or under-spend?",
    "type": "single_select",
    "conditional_logic": "trip_type==International",
    "weight": 0.2,
    "impact_on_recommendations": "Informs whether running price shows INR-only or dual-currency"
  },
  {
    "question_id": "S15",
    "category": "Spending Psychology",
    "subcategory": "Regret Aversion",
    "question_text_conversational": "After a trip, are you more likely to regret spending too much, or not spending enough?",
    "type": "single_select",
    "conditional_logic": null,
    "weight": 0.6,
    "impact_on_recommendations": "Strong signal for Aspirational Dreamer vs Luxury Indulger persona disambiguation"
  }
];

export const RELATED_DESTINATIONS_STATIC: RelatedDestinationItem[] = [
  {
    "city_id": "c26ec203-53b1-4b83-9958-90bcfb3a01de",
    "city_name": "Singapore",
    "related_city_id": "ea99d447-5524-437d-87fe-fb95036f6143",
    "related_city_name": "Dubai",
    "similarity_score": 0.813
  },
  {
    "city_id": "c26ec203-53b1-4b83-9958-90bcfb3a01de",
    "city_name": "Singapore",
    "related_city_id": "beb54bd5-465a-441b-acf6-b7d3f76e5a8e",
    "related_city_name": "Kuala Lumpur / Langkawi",
    "similarity_score": 0.772
  },
  {
    "city_id": "c26ec203-53b1-4b83-9958-90bcfb3a01de",
    "city_name": "Singapore",
    "related_city_id": "e58e1f8b-f08b-4c15-a474-bd781f996220",
    "related_city_name": "Male / Resort Atolls",
    "similarity_score": 0.739
  },
  {
    "city_id": "ea99d447-5524-437d-87fe-fb95036f6143",
    "city_name": "Dubai",
    "related_city_id": "314bdfff-84fd-4054-9549-ffad084044dc",
    "related_city_name": "Jaipur / Udaipur",
    "similarity_score": 0.846
  },
  {
    "city_id": "ea99d447-5524-437d-87fe-fb95036f6143",
    "city_name": "Dubai",
    "related_city_id": "c26ec203-53b1-4b83-9958-90bcfb3a01de",
    "related_city_name": "Singapore",
    "similarity_score": 0.813
  },
  {
    "city_id": "ea99d447-5524-437d-87fe-fb95036f6143",
    "city_name": "Dubai",
    "related_city_id": "e58e1f8b-f08b-4c15-a474-bd781f996220",
    "related_city_name": "Male / Resort Atolls",
    "similarity_score": 0.803
  },
  {
    "city_id": "52b3a5dc-9eb7-4a77-b7b0-b567aee57404",
    "city_name": "Bangkok",
    "related_city_id": "69a879f7-3e51-46b2-b73c-54fdb82b6bf9",
    "related_city_name": "Port Louis / Grand Baie",
    "similarity_score": 0.985
  },
  {
    "city_id": "52b3a5dc-9eb7-4a77-b7b0-b567aee57404",
    "city_name": "Bangkok",
    "related_city_id": "6057aad2-c3e7-4733-9c57-202eccfc52a6",
    "related_city_name": "Hanoi / Halong / Ho Chi Minh City",
    "similarity_score": 0.945
  },
  {
    "city_id": "52b3a5dc-9eb7-4a77-b7b0-b567aee57404",
    "city_name": "Bangkok",
    "related_city_id": "48a72c99-011c-46bb-96c0-e82aad486a29",
    "related_city_name": "Kochi / Munnar / Alleppey",
    "similarity_score": 0.903
  },
  {
    "city_id": "504d8137-8e84-4199-8978-b821f5213233",
    "city_name": "Bali (Denpasar)",
    "related_city_id": "48a72c99-011c-46bb-96c0-e82aad486a29",
    "related_city_name": "Kochi / Munnar / Alleppey",
    "similarity_score": 0.909
  },
  {
    "city_id": "504d8137-8e84-4199-8978-b821f5213233",
    "city_name": "Bali (Denpasar)",
    "related_city_id": "396e7fc0-3d4c-4301-9296-dc9b83d91632",
    "related_city_name": "Srinagar / Gulmarg / Pahalgam",
    "similarity_score": 0.902
  },
  {
    "city_id": "504d8137-8e84-4199-8978-b821f5213233",
    "city_name": "Bali (Denpasar)",
    "related_city_id": "d35c15d9-03c1-4a83-8aef-e6bcbf1184a6",
    "related_city_name": "Port Blair / Havelock",
    "similarity_score": 0.874
  },
  {
    "city_id": "e58e1f8b-f08b-4c15-a474-bd781f996220",
    "city_name": "Male / Resort Atolls",
    "related_city_id": "beb54bd5-465a-441b-acf6-b7d3f76e5a8e",
    "related_city_name": "Kuala Lumpur / Langkawi",
    "similarity_score": 0.903
  },
  {
    "city_id": "e58e1f8b-f08b-4c15-a474-bd781f996220",
    "city_name": "Male / Resort Atolls",
    "related_city_id": "48a72c99-011c-46bb-96c0-e82aad486a29",
    "related_city_name": "Kochi / Munnar / Alleppey",
    "similarity_score": 0.866
  },
  {
    "city_id": "e58e1f8b-f08b-4c15-a474-bd781f996220",
    "city_name": "Male / Resort Atolls",
    "related_city_id": "504d8137-8e84-4199-8978-b821f5213233",
    "related_city_name": "Bali (Denpasar)",
    "similarity_score": 0.807
  },
  {
    "city_id": "6057aad2-c3e7-4733-9c57-202eccfc52a6",
    "city_name": "Hanoi / Halong / Ho Chi Minh City",
    "related_city_id": "69a879f7-3e51-46b2-b73c-54fdb82b6bf9",
    "related_city_name": "Port Louis / Grand Baie",
    "similarity_score": 0.967
  },
  {
    "city_id": "6057aad2-c3e7-4733-9c57-202eccfc52a6",
    "city_name": "Hanoi / Halong / Ho Chi Minh City",
    "related_city_id": "52b3a5dc-9eb7-4a77-b7b0-b567aee57404",
    "related_city_name": "Bangkok",
    "similarity_score": 0.945
  },
  {
    "city_id": "6057aad2-c3e7-4733-9c57-202eccfc52a6",
    "city_name": "Hanoi / Halong / Ho Chi Minh City",
    "related_city_id": "48a72c99-011c-46bb-96c0-e82aad486a29",
    "related_city_name": "Kochi / Munnar / Alleppey",
    "similarity_score": 0.823
  },
  {
    "city_id": "61ea5494-aa76-49be-a659-0b270db3d2cc",
    "city_name": "Colombo / Kandy / Galle",
    "related_city_id": "78eea878-3122-45ce-a2da-48cc70c873a5",
    "related_city_name": "Thimphu / Paro / Punakha",
    "similarity_score": 0.976
  },
  {
    "city_id": "61ea5494-aa76-49be-a659-0b270db3d2cc",
    "city_name": "Colombo / Kandy / Galle",
    "related_city_id": "52b3a5dc-9eb7-4a77-b7b0-b567aee57404",
    "related_city_name": "Bangkok",
    "similarity_score": 0.854
  },
  {
    "city_id": "61ea5494-aa76-49be-a659-0b270db3d2cc",
    "city_name": "Colombo / Kandy / Galle",
    "related_city_id": "48a72c99-011c-46bb-96c0-e82aad486a29",
    "related_city_name": "Kochi / Munnar / Alleppey",
    "similarity_score": 0.849
  },
  {
    "city_id": "beb54bd5-465a-441b-acf6-b7d3f76e5a8e",
    "city_name": "Kuala Lumpur / Langkawi",
    "related_city_id": "d35c15d9-03c1-4a83-8aef-e6bcbf1184a6",
    "related_city_name": "Port Blair / Havelock",
    "similarity_score": 0.927
  },
  {
    "city_id": "beb54bd5-465a-441b-acf6-b7d3f76e5a8e",
    "city_name": "Kuala Lumpur / Langkawi",
    "related_city_id": "e58e1f8b-f08b-4c15-a474-bd781f996220",
    "related_city_name": "Male / Resort Atolls",
    "similarity_score": 0.903
  },
  {
    "city_id": "beb54bd5-465a-441b-acf6-b7d3f76e5a8e",
    "city_name": "Kuala Lumpur / Langkawi",
    "related_city_id": "48a72c99-011c-46bb-96c0-e82aad486a29",
    "related_city_name": "Kochi / Munnar / Alleppey",
    "similarity_score": 0.868
  },
  {
    "city_id": "69a879f7-3e51-46b2-b73c-54fdb82b6bf9",
    "city_name": "Port Louis / Grand Baie",
    "related_city_id": "52b3a5dc-9eb7-4a77-b7b0-b567aee57404",
    "related_city_name": "Bangkok",
    "similarity_score": 0.985
  },
  {
    "city_id": "69a879f7-3e51-46b2-b73c-54fdb82b6bf9",
    "city_name": "Port Louis / Grand Baie",
    "related_city_id": "6057aad2-c3e7-4733-9c57-202eccfc52a6",
    "related_city_name": "Hanoi / Halong / Ho Chi Minh City",
    "similarity_score": 0.967
  },
  {
    "city_id": "69a879f7-3e51-46b2-b73c-54fdb82b6bf9",
    "city_name": "Port Louis / Grand Baie",
    "related_city_id": "1ea2ebfc-0e67-48a5-93e2-3875f5306c81",
    "related_city_name": "Manali / Kullu",
    "similarity_score": 0.912
  },
  {
    "city_id": "78eea878-3122-45ce-a2da-48cc70c873a5",
    "city_name": "Thimphu / Paro / Punakha",
    "related_city_id": "61ea5494-aa76-49be-a659-0b270db3d2cc",
    "related_city_name": "Colombo / Kandy / Galle",
    "similarity_score": 0.976
  },
  {
    "city_id": "78eea878-3122-45ce-a2da-48cc70c873a5",
    "city_name": "Thimphu / Paro / Punakha",
    "related_city_id": "52b3a5dc-9eb7-4a77-b7b0-b567aee57404",
    "related_city_name": "Bangkok",
    "similarity_score": 0.842
  },
  {
    "city_id": "78eea878-3122-45ce-a2da-48cc70c873a5",
    "city_name": "Thimphu / Paro / Punakha",
    "related_city_id": "48a72c99-011c-46bb-96c0-e82aad486a29",
    "related_city_name": "Kochi / Munnar / Alleppey",
    "similarity_score": 0.823
  },
  {
    "city_id": "7bdcd9b8-4a8e-49a0-862a-b1c9213dc30b",
    "city_name": "Goa",
    "related_city_id": "48a72c99-011c-46bb-96c0-e82aad486a29",
    "related_city_name": "Kochi / Munnar / Alleppey",
    "similarity_score": 0.823
  },
  {
    "city_id": "7bdcd9b8-4a8e-49a0-862a-b1c9213dc30b",
    "city_name": "Goa",
    "related_city_id": "504d8137-8e84-4199-8978-b821f5213233",
    "related_city_name": "Bali (Denpasar)",
    "similarity_score": 0.806
  },
  {
    "city_id": "7bdcd9b8-4a8e-49a0-862a-b1c9213dc30b",
    "city_name": "Goa",
    "related_city_id": "69a879f7-3e51-46b2-b73c-54fdb82b6bf9",
    "related_city_name": "Port Louis / Grand Baie",
    "similarity_score": 0.741
  },
  {
    "city_id": "48a72c99-011c-46bb-96c0-e82aad486a29",
    "city_name": "Kochi / Munnar / Alleppey",
    "related_city_id": "d35c15d9-03c1-4a83-8aef-e6bcbf1184a6",
    "related_city_name": "Port Blair / Havelock",
    "similarity_score": 0.911
  },
  {
    "city_id": "48a72c99-011c-46bb-96c0-e82aad486a29",
    "city_name": "Kochi / Munnar / Alleppey",
    "related_city_id": "504d8137-8e84-4199-8978-b821f5213233",
    "related_city_name": "Bali (Denpasar)",
    "similarity_score": 0.909
  },
  {
    "city_id": "48a72c99-011c-46bb-96c0-e82aad486a29",
    "city_name": "Kochi / Munnar / Alleppey",
    "related_city_id": "52b3a5dc-9eb7-4a77-b7b0-b567aee57404",
    "related_city_name": "Bangkok",
    "similarity_score": 0.903
  },
  {
    "city_id": "1ea2ebfc-0e67-48a5-93e2-3875f5306c81",
    "city_name": "Manali / Kullu",
    "related_city_id": "396e7fc0-3d4c-4301-9296-dc9b83d91632",
    "related_city_name": "Srinagar / Gulmarg / Pahalgam",
    "similarity_score": 0.931
  },
  {
    "city_id": "1ea2ebfc-0e67-48a5-93e2-3875f5306c81",
    "city_name": "Manali / Kullu",
    "related_city_id": "69a879f7-3e51-46b2-b73c-54fdb82b6bf9",
    "related_city_name": "Port Louis / Grand Baie",
    "similarity_score": 0.912
  },
  {
    "city_id": "1ea2ebfc-0e67-48a5-93e2-3875f5306c81",
    "city_name": "Manali / Kullu",
    "related_city_id": "52b3a5dc-9eb7-4a77-b7b0-b567aee57404",
    "related_city_name": "Bangkok",
    "similarity_score": 0.892
  },
  {
    "city_id": "314bdfff-84fd-4054-9549-ffad084044dc",
    "city_name": "Jaipur / Udaipur",
    "related_city_id": "ea99d447-5524-437d-87fe-fb95036f6143",
    "related_city_name": "Dubai",
    "similarity_score": 0.846
  },
  {
    "city_id": "314bdfff-84fd-4054-9549-ffad084044dc",
    "city_name": "Jaipur / Udaipur",
    "related_city_id": "7bdcd9b8-4a8e-49a0-862a-b1c9213dc30b",
    "related_city_name": "Goa",
    "similarity_score": 0.709
  },
  {
    "city_id": "314bdfff-84fd-4054-9549-ffad084044dc",
    "city_name": "Jaipur / Udaipur",
    "related_city_id": "78eea878-3122-45ce-a2da-48cc70c873a5",
    "related_city_name": "Thimphu / Paro / Punakha",
    "similarity_score": 0.642
  },
  {
    "city_id": "d35c15d9-03c1-4a83-8aef-e6bcbf1184a6",
    "city_name": "Port Blair / Havelock",
    "related_city_id": "beb54bd5-465a-441b-acf6-b7d3f76e5a8e",
    "related_city_name": "Kuala Lumpur / Langkawi",
    "similarity_score": 0.927
  },
  {
    "city_id": "d35c15d9-03c1-4a83-8aef-e6bcbf1184a6",
    "city_name": "Port Blair / Havelock",
    "related_city_id": "48a72c99-011c-46bb-96c0-e82aad486a29",
    "related_city_name": "Kochi / Munnar / Alleppey",
    "similarity_score": 0.911
  },
  {
    "city_id": "d35c15d9-03c1-4a83-8aef-e6bcbf1184a6",
    "city_name": "Port Blair / Havelock",
    "related_city_id": "504d8137-8e84-4199-8978-b821f5213233",
    "related_city_name": "Bali (Denpasar)",
    "similarity_score": 0.874
  },
  {
    "city_id": "396e7fc0-3d4c-4301-9296-dc9b83d91632",
    "city_name": "Srinagar / Gulmarg / Pahalgam",
    "related_city_id": "1ea2ebfc-0e67-48a5-93e2-3875f5306c81",
    "related_city_name": "Manali / Kullu",
    "similarity_score": 0.931
  },
  {
    "city_id": "396e7fc0-3d4c-4301-9296-dc9b83d91632",
    "city_name": "Srinagar / Gulmarg / Pahalgam",
    "related_city_id": "504d8137-8e84-4199-8978-b821f5213233",
    "related_city_name": "Bali (Denpasar)",
    "similarity_score": 0.902
  },
  {
    "city_id": "396e7fc0-3d4c-4301-9296-dc9b83d91632",
    "city_name": "Srinagar / Gulmarg / Pahalgam",
    "related_city_id": "48a72c99-011c-46bb-96c0-e82aad486a29",
    "related_city_name": "Kochi / Munnar / Alleppey",
    "similarity_score": 0.885
  }
];

export const MOOD_CATEGORIES_STATIC: MoodCategoryItem[] = [
  {
    "mood_name": "Romantic Escapes",
    "filter_rule_json": {
      "top_dims": [
        "Relaxation",
        "Luxury"
      ],
      "tag_match": "Romantic"
    }
  },
  {
    "mood_name": "Beach Holidays",
    "filter_rule_json": {
      "categories": [
        "Beaches",
        "Water Sports"
      ]
    }
  },
  {
    "mood_name": "Adventure",
    "filter_rule_json": {
      "top_dims": [
        "Adventure"
      ],
      "categories": [
        "Trekking",
        "Theme Parks"
      ]
    }
  },
  {
    "mood_name": "Family",
    "filter_rule_json": {
      "top_dims": [
        "Family Experiences",
        "Relaxation"
      ]
    }
  },
  {
    "mood_name": "Luxury",
    "filter_rule_json": {
      "top_dims": [
        "Luxury"
      ],
      "pricing_bands": [
        "high",
        "premium"
      ]
    }
  },
  {
    "mood_name": "Solo Explorer",
    "filter_rule_json": {
      "top_dims": [
        "Local Experiences",
        "Culture"
      ]
    }
  }
];

export const DEST_QUESTION_TEMPLATES_STATIC: DestQuestionTemplateItem[] = [
  {
    "category": "Theme Parks",
    "template_question_text": "Interested in visiting {SignatureExperienceName}?",
    "applies_to_experience_category": "Theme Parks"
  },
  {
    "category": "Beaches",
    "template_question_text": "Would chilling at {SignatureExperienceName} be part of your ideal day?",
    "applies_to_experience_category": "Beaches"
  },
  {
    "category": "Luxury Hotels",
    "template_question_text": "Could you see yourself staying somewhere like {SignatureExperienceName}?",
    "applies_to_experience_category": "Luxury Hotels"
  },
  {
    "category": "Culture",
    "template_question_text": "Does exploring {SignatureExperienceName} sound like your kind of experience?",
    "applies_to_experience_category": "Culture"
  },
  {
    "category": "Nightlife",
    "template_question_text": "Up for a night out at {SignatureExperienceName}?",
    "applies_to_experience_category": "Nightlife"
  },
  {
    "category": "Local Markets",
    "template_question_text": "Interested in exploring the local vibe at {SignatureExperienceName}?",
    "applies_to_experience_category": "Local Markets"
  }
];
