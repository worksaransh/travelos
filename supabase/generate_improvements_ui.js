const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/(admin)/admin/improvements/page.tsx');

const agents = [
  { name: "Founder & CEO", rating: "7.5", problem: "Lacks core competitive edge in automated flight/hotel lock-in compared to traditional OTAs.", opportunity: "Reposition as a premium curation platform connecting with boutique providers.", rec: "Focus on human-fulfilled agent console speed." },
  { name: "VC Investor", rating: "6.5", problem: "High initial AI API costs and low visible conversion loops to cover CAC.", opportunity: "B2B SaaS licensing of DNA matching module to regional travel agencies.", rec: "Adopt deterministic local rules over LLM prompts for itinerary parsing." },
  { name: "Chief Product Officer", rating: "7.0", problem: "Completely missing Bundle Builder front-end; users cannot customize flights/hotels seamlessly.", opportunity: "Design visual card-swapping timelines for hotels and activities.", rec: "Implement the DB-modeled 'bundle_templates' table in UI." },
  { name: "CTO", rating: "7.2", problem: "No real-time synchronization between Supabase database state and local fallback JSONs.", opportunity: "Implement edge-cache CDN layer for destinations and experiences database queries.", rec: "Setup database triggers to automatically sync cached static JSON files." },
  { name: "Chief Marketing Officer", rating: "6.8", problem: "No viral sharing loops for generated itineraries (e.g. public links).", opportunity: "Create a 'Share DNA Profile' badge for Instagram and WhatsApp.", rec: "Enable public view of itineraries without gating by quiz registration." },
  { name: "Chief Revenue Officer", rating: "6.0", problem: "Monetization is purely transactional; no upselling on insurance or local guides.", opportunity: "Partner with global insurance providers and local experience suppliers for split-revenue commissions.", rec: "Embed affiliate flight & transport tags on checkout screens." },
  { name: "Senior Frontend Engineer", rating: "7.5", problem: "Next.js middleware warning on convention deprecation. CSS styling lacks interactive feedback.", opportunity: "Transition to Tailwind v4 transitions and standardized border utilities.", rec: "Refactor middleware file convention and clean up unused CSS tokens." },
  { name: "Senior Backend Engineer", rating: "7.8", problem: "RLS policies for write operations are wide open for admin roles without proper check validations.", opportunity: "Refactor helper security definer functions for row level checks.", rec: "Enforce strict checks on `is_admin()` helper queries." },
  { name: "AI Architect", rating: "6.5", problem: "No RAG caching layers. Every AI validation triggers slow LLM evaluations.", opportunity: "Vectorize experiences in pgvector database and run semantic search filters.", rec: "Use cached validation reports for recurring itineraries." },
  { name: "ML Engineer", rating: "6.0", problem: "Proximity matching engine relies on basic dot-product matrix multiplication without weights update.", opportunity: "Train a light regression model on user booking signals to adjust weights.", rec: "Implement feedback updates to dimension weights config." },
  { name: "Database Architect", rating: "7.0", problem: "No unique constraint on destination question templates category combinations.", opportunity: "Improve table integrity with compound indexes.", rec: "Add unique index on `(category, applies_to_experience_category)` in `destination_question_templates`." },
  { name: "Security Engineer", rating: "7.5", problem: "Plaintext WhatsApp lead phone logging without mask controls.", opportunity: "Implement encryption on customer contact information at database level.", rec: "Encrypt phone and email in the leads database table." },
  { name: "DevOps Engineer", rating: "8.0", problem: "Vercel builds are fast but lack integration test validations.", opportunity: "Configure GitHub actions to validate SQL migrations before Vercel deploy.", rec: "Add automated lint checks on migrations." },
  { name: "QA Engineer", rating: "6.8", problem: "Soft-delete architectures are untested on database level cascading deletes.", opportunity: "Write automated tests for cascading soft-deletes.", rec: "Develop a validator test script for logical soft delete queries." },
  { name: "Performance Engineer", rating: "7.2", problem: "Unsplash heavy images block initial render times.", opportunity: "Generate and store optimized WebP thumbnails locally.", rec: "Ensure all pages load local WebP files instead of external unsplash sources." },
  { name: "UX Researcher", rating: "7.0", problem: "Teaser screen interrupts questionnaire unexpectedly.", opportunity: "Reposition teaser as a loading screen after questionnaire completes.", rec: "Redesign questionnaire flow step progression." },
  { name: "UI Designer", rating: "7.8", problem: "Admin panel dashboard KPI grids feel static and dry.", opportunity: "Introduce premium micro-animations for card transitions.", rec: "Use framer-motion or CSS keyframe animations for KPIs." },
  { name: "CRO Expert", rating: "6.5", problem: "Gated questionnaire account creation blocks drop-off rates.", opportunity: "Allow users to view itinerary draft before requesting signup.", rec: "Move account creation to booking checkouts." },
  { name: "Accessibility Expert", rating: "6.0", problem: "Low color contrast ratio on marigold badges in white background.", opportunity: "Increase typography contrast and add aria-labels to buttons.", rec: "Standardize theme colors for AA accessibility rating." },
  { name: "Mobile UX Specialist", rating: "7.5", problem: "Slider elements on questionnaire are difficult to slide on mobile touch screens.", opportunity: "Use native touch gestures and larger hit-targets for mobile sliders.", rec: "Enlarge questionnaire slider thumb UI." },
  { name: "Luxury Travel Consultant", rating: "7.2", problem: "High-end luxury packages match mid-tier budget hotels.", opportunity: "Enforce strict hotel matching based on luxury slider score > 80.", rec: "Filter hotels based on selected luxury criteria." },
  { name: "Budget Travel Consultant", rating: "8.0", problem: "Value-conscious users see high-priced signature experiences.", opportunity: "Implement price-band filtering on matching engine query.", rec: "Exclude high price-band experiences for value-conscious users." },
  { name: "Family Travel Expert", rating: "6.8", problem: "No child age suitability filtering in itineraries.", opportunity: "Filter out age-inappropriate items (e.g. nightlife bar tours) for family group types.", rec: "Check experience age suitability tags during itinerary creation." },
  { name: "Honeymoon Specialist", rating: "7.5", problem: "Honeymoon packages lack premium private details like romantic spa upgrades.", opportunity: "Upsell exclusive couple experiences directly in the summary.", rec: "Prioritize romantic tag matches for couples." },
  { name: "Adventure Travel Expert", rating: "8.0", problem: "Nature and adventure scores overlap in basic relaxation packages.", opportunity: "Strict category pairings for trek and sport bundles.", rec: "Increase adventure weight factors on query results." },
  { name: "Solo Travel Expert", rating: "7.0", problem: "Solo travelers recommended double-occupancy pricing models.", opportunity: "Introduce single supplement calculations on base package pricing.", rec: "Adjust estimated cost logic based on traveler count." },
  { name: "Corporate Travel Expert", rating: "6.5", problem: "No invoicing or business expense documentation in checkout flows.", opportunity: "Add a GST/Corporate ID field during checkout.", rec: "Provide downloadable PDF invoices." },
  { name: "International Travel Consultant", rating: "7.2", problem: "Visa policy default display is static and doesn't verify traveler passport nationality.", opportunity: "Add passport nationality dropdown in questionnaire.", rec: "Dynamic visa rule checks based on passport selection." },
  { name: "Sales Manager", rating: "7.0", problem: "Leads dashboard doesn't sort by budget or follow-up urgency.", opportunity: "Implement CRM pipeline board cards grouped by lead budget tier.", rec: "Group CRM leads by deal values." },
  { name: "CRM Manager", rating: "6.8", problem: "No automatic follow-up triggers or WhatsApp notification integration.", opportunity: "Connect Twilio/WhatsApp API on lead submission.", rec: "Add auto-trigger notification events." },
  { name: "Operations Manager", rating: "7.5", problem: "Manually checking package versions when itinerary is generated is slow.", opportunity: "Automate supplier price change mismatch warnings.", rec: "Create alert system for stale package versions." },
  { name: "Customer Support Lead", rating: "7.0", problem: "No instant support widget or chat box in itinerary pages.", opportunity: "Embed real-time chat widgets linking directly to support team.", rec: "Integrate WhatsApp chat overlay." },
  { name: "SEO Specialist", rating: "7.5", problem: "Dynamic destination pages lack SEO schema markups.", opportunity: "Add JSON-LD structure metadata for all cities and packages.", rec: "Embed structural metadata on slug pages." },
  { name: "Content Strategist", rating: "7.0", problem: "Destination overviews are basic text blocks.", opportunity: "Incorporate local hidden gems blogs directly inside destination layouts.", rec: "Include articles block in destination view." },
  { name: "Growth Hacker", rating: "6.5", problem: "No referral bonus incentive system to drive viral invites.", opportunity: "Offer travel discount vouchers for referral bookings.", rec: "Introduce share-and-earn discount system." },
  { name: "Analytics Expert", rating: "7.2", problem: "Funnel stats in admin panel are mocked arrays rather than live events.", opportunity: "Track real-time page transition times using click events.", rec: "Connect mixpanel or google analytics hooks." },
  { name: "Solo Traveler", rating: "7.8", problem: "Feels lonely; no social group joining recommendations.", opportunity: "Suggest group experiences or walking tours.", rec: "Include social tags." },
  { name: "Couple Traveler", rating: "8.5", problem: "Swapping hotels doesn't highlight romantic upgrade benefits.", opportunity: "Show beautiful couples badges on 5-star upgrades.", rec: "Tag romance hotels." },
  { name: "Honeymoon Couple", rating: "8.0", problem: "No honeymoon greeting or welcome gift customization option.", opportunity: "Add customizable room décor add-ons in bundle options.", rec: "Embed upgrade choices." },
  { name: "Family with Kids", rating: "6.0", problem: "T2_Q1 recommendations contain high-adventure white water rafting unsuitable for toddlers.", opportunity: "Filter out extreme physical activities based on child age input.", rec: "Validate age range against experience difficulty." },
  { name: "Friends Group", rating: "7.5", problem: "No feature to split payments or vote on experiences.", opportunity: "Introduce shared voting link for itinerary planning.", rec: "Implement group itinerary editor." },
  { name: "Luxury Traveler", rating: "8.0", problem: "Boutique hotels shown are below expectations.", opportunity: "Exclude budget or 3-star ratings on luxury filters.", rec: "Select luxury hotels strictly when slider is high." },
  { name: "Budget Traveler", rating: "8.5", problem: "No warning about budget overrun when applying swaps.", opportunity: "Display price difference clearly on alternative swap list.", rec: "Add price delta badge on alternatives list." },
  { name: "Senior Citizen", rating: "6.2", problem: "Text sizing is small and layout is physically demanding.", opportunity: "Add ease of access controls (large fonts).", rec: "Implement physical activity level check." },
  { name: "Digital Nomad", rating: "7.0", problem: "No wifi speed or remote working hub recommendations.", opportunity: "Highlight co-working cafes and high-speed internet hotels.", rec: "Include work-friendly tags." },
  { name: "Shopping Lover", rating: "8.2", problem: "Only basic malls listed; no local markets.", opportunity: "Seed local markets in experiences list.", rec: "Add local shopping guide." },
  { name: "Food Explorer", rating: "8.0", problem: "No dietary restrictions filter (vegan, gluten-free, halal).", opportunity: "Add dietary selection in profile.", rec: "Filter restaurants by dietary labels." },
  { name: "Adventure Seeker", rating: "8.5", problem: "No safety certifications shown for outdoor sports.", opportunity: "Show operator safety badges.", rec: "Add operator verification label." },
  { name: "Parent Planning Family Vacation", rating: "6.5", problem: "No baby sitting or kid zone filter in hotel summary.", opportunity: "List family-suited hotel features.", rec: "Include kids-club flag." },
  { name: "First-Time International Traveler", rating: "7.0", problem: "Visa instructions feel confusing.", opportunity: "Add step-by-step visa support call bookings.", rec: "Connect visa desk links." },
  { name: "Quiet Traveler", rating: "7.8", problem: "Recommended noisy tourist hotspots.", opportunity: "Prioritize off-the-beaten-path tag filters.", rec: "Filter quiet slots." },
  { name: "Culture Explorer", rating: "8.2", problem: "Museum descriptions lack historic background details.", opportunity: "Include local expert audio guides.", rec: "Add audio guide links." }
];

const categories = {
  "Missing Features": [
    "Interactive real-time map showing distance between selected itinerary items.",
    "Multi-currency converter support at booking checkout (USD, EUR, SGD, INR).",
    "Visual hotel card room preview switcher directly in summary view.",
    "Integrate Google Maps Directions API to show route times between experiences.",
    "Flight pricing comparison widget from Skyscanner/Amadeus APIs.",
    "Group voting system where companions can vote on alternative experiences.",
    "Custom day scheduler allowing users to drag and drop items in time slots.",
    "Dietary preference filter to swap food experiences (vegan, halal, kosher, gluten-free).",
    "Dynamic visa assistance dashboard with required document checklist upload.",
    "Add weather warning alerts indicating seasonal rain/storms for selected dates.",
    "Travel insurance checkout add-on with quick claims filing.",
    "Live WhatsApp status updates for booking confirmation vouchers.",
    "PDF export button for printable itineraries with QR codes.",
    "Add-on local sim card and pocket Wi-Fi rental booking checkbox.",
    "Airport transfer shuttle vehicle type selection (Sedan, SUV, Luxury).",
    "User-uploaded photo reviews for experience cards.",
    "Local expert tour guide hire add-on based on spoken languages.",
    "Split-payment feature allowing friends to split the total package price.",
    "Interactive calendar with local public holidays and festival dates overlay.",
    "Luggage delivery service integration from airport to hotel.",
    "Audio guides integration for historical monument landmarks.",
    "Dynamic pricing countdown timers for booking lock-in discounts.",
    "Loyalty points wallet balance tracking system in account pages.",
    "Add visa-on-arrival pre-fill application forms.",
    "Interactive quiz step showing real-time estimated trip cost counters.",
    "Integrate global event tickets booking (e.g. concert, formula 1 tickets).",
    "B2B agent login panel with custom markup controls.",
    "Client-facing proposal link generator for agents.",
    "Automatic flight check-in assistance preference settings.",
    "Detailed pack list recommendation checklist tailored to weather.",
    "Integrate carbon offset donation tracker.",
    "Global emergency local support hotline display on dashboard.",
    "Hotel check-in instructions with late check-in request toggle.",
    "Offline access mode for saving itineraries in PDF cache.",
    "Public referral link dashboard with discount tracking.",
    "Child-care booking options in hotel selection summaries.",
    "Co-working space checkins mapping for digital nomads.",
    "Activity difficulty ratings (Easy, Moderate, Hard) for treks.",
    "Add customized welcome hamper package options.",
    "Corporate billing invoice automation with company registration numbers.",
    "Multi-city flight routing configuration options in builder.",
    "Interactive 3D tours for premium luxury hotel upgrade options.",
    "Integrated booking ledger showing payment installment histories.",
    "Operator safety credentials and regulatory approval display.",
    "Save-to-Google-Wallet button for tickets and vouchers.",
    "Dark mode visual UI theme toggler.",
    "Dynamic slot availability indicator for timed attractions.",
    "Local emergency clinic mapper tool.",
    "Public transit map overlays inside the route maps.",
    "Wheelchair accessibility details on all experience cards."
  ],
  "UX Improvements": [
    "Standardize all Next.js page transitions with smooth CSS fade animations.",
    "Improve touch gestures on mobile devices for the Travel DNA sliders.",
    "Add skeleton loading cards while itinerary results are computed.",
    "Standardize focus state borders across all interactive buttons for screen readers.",
    "Replace high-res Unsplash JPEG background patterns with quick-load SVG vectors.",
    "Optimize mobile layout of the day-by-day itinerary hub navigation.",
    "Add clear visual badges comparing pricing bands (Comfort vs VIP Premium).",
    "Reduce font sizes of long headers on mobile viewport sizes.",
    "Increase visual spacing between experiences in the daily timeline.",
    "Add tooltips explaining the 10 dimension tags (e.g. 'Local Experiences').",
    "Add an auto-dismissing toast notification on saving items to wishlist.",
    "Standardize all popup modals to close when clicking the overlay backdrop.",
    "Optimize the checkout input flow for family traveler forms.",
    "Add a visual timeline progress track line in the itinerary details.",
    "Increase target hit sizes for interactive elements to at least 48px.",
    "Redesign the landing page hero illustration with local WebP thumbnails.",
    "Show real-time price changes when clicking experience swaps.",
    "Improve contrast of input placeholders on dark backgrounds.",
    "Add dynamic confirmation checks before deleting saved wishlists.",
    "Prevent layout shifts on destination slug pages during image loads.",
    "Optimize mobile vertical scroll heights on mobile admin dashboards.",
    "Standardize card radius values across the dashboard blocks.",
    "Highlight search input active borders in the autocomplete boxes.",
    "Optimize spacing of the admin funnel analytics charts.",
    "Provide instant validation message displays during password creation.",
    "Improve text color contrast inside the marigold status badges.",
    "Display child age drop-down boxes inside neat flex boxes.",
    "Add page navigation breadcrumbs for nested itinerary steps.",
    "Smooth transition animations on accordion blocks inside FAQs.",
    "Use local fonts to prevent flash of unstyled text (FOUT) on load.",
    "Optimize display order of city guides on destinations catalog.",
    "Add hover scale effects on destination card preview images.",
    "Display current active persona details on dashboard home.",
    "Improve scroll behaviors on the experience swap dropdown drawer.",
    "Show actual currency symbols instead of generic pricing indicators.",
    "Add custom error boundary fallbacks for failed map interfaces.",
    "Highlight active day indicators on the timeline headers during scroll.",
    "Include direct link to booking checkout at both top and bottom of page.",
    "Center alignment of the signup verification text on mobile screens.",
    "Simplify input fields for WhatsApp OTP checks.",
    "Use descriptive labels on sliders instead of numeric index ratings.",
    "Adjust opacity on secondary navigation links for better focus.",
    "Optimize the visibility of the privacy consent toggles on mobile screens.",
    "Smooth transition animations when sliding dashboard filters.",
    "Display clear warning badges when selected dates are out of season.",
    "Standardize scrollbar styling across all dashboard interfaces.",
    "Add quick-reset buttons to filters in destinations page.",
    "Group admin dashboard settings pages cleanly into visual tabs.",
    "Show active loaders inside buttons when submit requests run.",
    "Display tooltips showing price differences on alternative packages."
  ],
  "Database & Backend": [
    "Add unique constraint on `(category, applies_to_experience_category)` in `destination_question_templates`.",
    "Implement database level index on `experiences(city_id, supplier_bookable_flag)` for fast matching queries.",
    "Enforce cascading deletes on `dimension_scores` when a `travel_dna_profile` is removed.",
    "Add constraint check `similarity_score BETWEEN 0 AND 1` on `related_destinations` table.",
    "Create database indexing on `questionnaire_responses(profile_id, question_id)`.",
    "Implement database logical soft-deletes trigger to automatically clean orphan components.",
    "Add foreign key checks on `packages(destination_city_id)` pointing to cities table.",
    "Use `uuid` data types instead of text fields for database primary keys.",
    "Implement database partitioning on `consent_records` for long-term audit storage.",
    "Create compound index on `packages(destination_city_id, package_tier, is_active)`.",
    "Add trigger function to log schema alterations to audit log tables.",
    "Enforce constraints on `packages(base_price)` to prevent negative values.",
    "Establish indexes on `itinerary_items(itinerary_day_id, experience_id)`.",
    "Optimize RLS policies on `users` table to check authenticated credentials strictly.",
    "Define database view `active_packages_summary` for faster admin dashboard queries.",
    "Add unique key combination on `related_destinations(city_id, related_city_id)`.",
    "Establish constraints on `itinerary_days(day_number)` to block values less than 1.",
    "Set up daily database auto-backups with storage backups replication.",
    "Add logical check constraints on `question_bank(weight)` to remain between 0 and 1.",
    "Optimize user profile references on `travel_dna_profiles(user_id)`.",
    "Write automated test scripts validating all relational constraints in Supabase.",
    "Create indexes on `bookings(user_id, status)` for fast customer lookups.",
    "Add constraint checks on hotel price fields to ensure realistic values.",
    "Configure pg_cron extensions to clean up expired anonymous sessions nightly.",
    "Add database check triggers to enforce valid email formats in the leads table."
  ],
  "AI & Matching": [
    "Implement semantic RAG queries on experiences database using pgvector.",
    "Set up semantic caching on LLM itinerary validations to reduce API costs.",
    "Use local small language models (SLMs) for initial local validation gates.",
    "Build multi-modal image matching to match visual layouts to user style.",
    "Add real-time parsing of WhatsApp text prompts into Travel DNA scores.",
    "Optimize system prompts for visa claim contradiction checks.",
    "Train regression models to adjust scoring weights on successful bookings.",
    "Implement prompt chaining for multi-day itineraries instead of single calls.",
    "Create automated AI review rating score logs in the admin dashboard.",
    "Use LLM function-calling schema interfaces for structured itinerary feeds.",
    "Implement automatic translation logic for travel itineraries using AI translator APIs.",
    "Cache frequently searched destination answers.",
    "Generate custom destination blogs using AI from static data inputs.",
    "Implement AI customer sentiment checks on review submissions.",
    "Optimize token context windows to control OpenAI usage pricing.",
    "Establish auto-fallback rules to deterministic code when AI times out.",
    "Build AI agent itinerary repair loops for conflicting validation reports.",
    "Create semantic classifications of new user comments on questionnaires.",
    "Generate automated SEO keywords for destination landing pages.",
    "Train classifier on customer profile updates to refine tags.",
    "Implement multi-agent discussions to review hotel choices.",
    "Optimize AI prompts for family travel risk checks.",
    "Enable AI-based flight delay predictor notifications.",
    "Build automated AI test scenarios to validate questionnaire branching.",
    "Enable dynamic prompt optimization based on traveler region."
  ],
  "Revenue & Conversion": [
    "Introduce a premium VIP travel planning tier with private agent consults.",
    "Add affiliate commissions on flight bookings via partner integration.",
    "Upsell travel insurance add-ons during checkout steps.",
    "Charge sub-agent white-label software licensing fees.",
    "Partner with local boutique hotels for exclusive booking commission cuts.",
    "Introduce premium localized audio guide subscription upgrades.",
    "Sell fast-track visa processing services.",
    "Offer carbon offset program donations at checkout with administrative margins.",
    "Create sponsored experiences placement options for local suppliers.",
    "Provide custom corporate team building retreat organization modules.",
    "Implement exit-intent popup modal offering free personalized itinerary guides.",
    "Display customer social proof and reviews near the checkout confirm buttons.",
    "Introduce automatic WhatsApp lead capture trigger on questionnaire step 3.",
    "Add clear visual countdown timers on price lock guarantee options.",
    "Allow users to preview itinerary dashboard before requiring email signup.",
    "Include live agent assistance widgets on booking pages.",
    "Display trust badges (e.g. secure checkout, operator verified) on payments.",
    "Send cart abandonment email reminders to registered leads.",
    "Provide instant chat support overlays linking directly to sales teams.",
    "Display clear bullet summaries of packages instead of long texts."
  ],
  "Bugs & Competitor Advantage": [
    "Session merging fails if anonymous user and logged-in user profiles mismatch.",
    "Negative budget values are accepted in the questionnaire database inserts.",
    "Timezone offsets shift itinerary day schedules to incorrect calendar days.",
    "Special characters in user names break SQL insert queries in validation files.",
    "Slider values fail to register if touch gestures are completed rapidly.",
    "Null check failures on `weather_profile_json` properties on landing page.",
    "RLS update blocks when admin attempts to modify another user's profile.",
    "Unsplash hotlink failures return broken images on destination banners.",
    "Cascading deletes fail to remove component versions on package delete.",
    "Staged mock responses conflict with live Supabase database outputs.",
    "MakeMyTrip: Direct API integrations with national flight carriers for instant booking.",
    "Pickyourtrail: Fully interactive drag-and-drop itinerary routing editor dashboard.",
    "Mindtrip: Generative AI natural language chat that builds plans on the fly.",
    "Airbnb: Deep catalog of unique local stays and home experience guides.",
    "Booking.com: Flexible cancellation policies and immediate room locking setups.",
    "Klook: Instant booking vouchers and tickets QR codes for local attractions.",
    "TUI: Complete flight-hotel charter packages pricing control models.",
    "TripAdvisor: Massive database of traveler reviews and photos for experiences.",
    "GetYourGuide: Exclusive rights partnerships with top local landmark operators.",
    "Viator: Seamless local tour operator portal and inventory management."
  ]
};

// Next.js client component output string
const componentCode = `"use client";

import React, { useState, useEffect } from "react";
import { 
  ClipboardList, 
  Search, 
  Users, 
  Settings2, 
  Activity, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  Brain,
  DollarSign,
  Bug,
  ListTodo,
  TrendingUp
} from "lucide-react";

interface Agent {
  name: string;
  rating: string;
  problem: string;
  opportunity: string;
  rec: string;
}

const initialAgents: Agent[] = ${JSON.stringify(agents, null, 2)};
const logsCategories: Record<string, string[]> = ${JSON.stringify(categories, null, 2)};

export default function ActionableImprovementDashboard() {
  const [activeTab, setActiveTab] = useState<"board" | "logs" | "roadmap">("board");
  const [selectedCategory, setSelectedCategory] = useState<string>("Missing Features");
  const [searchQuery, setSearchQuery] = useState("");
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  
  // Roadmap Sprint items
  const [sprintProgress, setSprintProgress] = useState<Record<string, boolean>>({
    "s1-t1": false,
    "s1-t2": false,
    "s1-t3": false,
    "s1-t4": false,
    "s2-t1": false,
    "s2-t2": false,
    "s2-t3": false,
    "s3-t1": false,
    "s3-t2": false,
    "s4-t1": false,
  });

  // Load checkbox selections from localStorage on client render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedLogs = localStorage.getItem("travelos_completed_logs");
      const cachedRoadmap = localStorage.getItem("travelos_completed_roadmap");
      if (cachedLogs) setCompletedItems(JSON.parse(cachedLogs));
      if (cachedRoadmap) setSprintProgress(JSON.parse(cachedRoadmap));
    }
  }, []);

  const toggleLogCheck = (item: string) => {
    const updated = { ...completedItems, [item]: !completedItems[item] };
    setCompletedItems(updated);
    localStorage.setItem("travelos_completed_logs", JSON.stringify(updated));
  };

  const toggleRoadmapCheck = (key: string) => {
    const updated = { ...sprintProgress, [key]: !sprintProgress[key] };
    setSprintProgress(updated);
    localStorage.setItem("travelos_completed_roadmap", JSON.stringify(updated));
  };

  // Compute stats
  const totalLogs = Object.values(logsCategories).flat().length;
  const totalCompletedLogs = Object.values(completedItems).filter(Boolean).length;
  const logsProgressPercent = totalLogs > 0 ? Math.round((totalCompletedLogs / totalLogs) * 100) : 0;

  const filteredLogs = (logsCategories[selectedCategory] || [])
    .filter(log => log.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-indigo">Actionable Improvement Logs</h1>
          <p className="text-xs text-dusk-teal mt-0.5">
            Compiled findings, agent ratings, and execution checklist for product scaling.
          </p>
        </div>
        
        {/* KPI Counter Widget */}
        <div className="flex items-center gap-4 bg-white px-4 py-2 border border-border/40 rounded-xl shadow-sm">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-dusk-teal uppercase">Implementation Progress</span>
            <span className="text-sm font-mono font-bold text-ink-indigo">
              {totalCompletedLogs} / {totalLogs} Resolved ({logsProgressPercent}%)
            </span>
          </div>
          <div className="w-16 h-2 bg-sand/45 rounded-full overflow-hidden">
            <div className="h-full bg-marigold transition-all duration-300" style={{ width: \`\${logsProgressPercent}%\` }} />
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex space-x-1 p-1 bg-white/60 backdrop-blur border border-border/40 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab("board")}
          className={\`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 \${
            activeTab === "board"
              ? "bg-ink-indigo text-white shadow-md"
              : "text-dusk-teal hover:bg-sand/30"
          }\`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Board Review</span>
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={\`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 \${
            activeTab === "logs"
              ? "bg-ink-indigo text-white shadow-md"
              : "text-dusk-teal hover:bg-sand/30"
          }\`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Improvement Logs</span>
        </button>
        <button
          onClick={() => setActiveTab("roadmap")}
          className={\`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 \${
            activeTab === "roadmap"
              ? "bg-ink-indigo text-white shadow-md"
              : "text-dusk-teal hover:bg-sand/30"
          }\`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>90-Day Roadmap</span>
        </button>
      </div>

      {/* Tab 1: Simulated Board Review */}
      {activeTab === "board" && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-border/40 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-ink-indigo font-display">Expert Agent Board Panel</h3>
            <p className="text-[11px] text-dusk-teal mt-0.5">
              Review individual rating scores and critical feedback guidelines logged by 52 expert simulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialAgents.map((agent, i) => {
              const ratingNum = parseFloat(agent.rating);
              const ratingColor = ratingNum >= 8.0 ? "text-emerald-700 bg-emerald-100" : ratingNum >= 7.0 ? "text-marigold bg-marigold/10" : "text-clay-rose bg-clay-rose/10";
              
              return (
                <div key={i} className="bg-white border border-border/30 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-marigold/50 transition">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-ink-indigo text-sm">{agent.name}</h4>
                      <span className={\`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold \${ratingColor}\`}>
                        {agent.rating}/10
                      </span>
                    </div>
                    <div className="text-xs text-dusk-teal space-y-2 leading-relaxed pt-1.5 border-t border-border/10">
                      <div>
                        <strong className="text-deep-charcoal block">Problem:</strong>
                        <p>{agent.problem}</p>
                      </div>
                      <div>
                        <strong className="text-deep-charcoal block">Opportunity:</strong>
                        <p>{agent.opportunity}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-sand/30 border border-border/25 rounded-lg p-2.5 text-[10px] italic text-ink-indigo font-medium">
                    <strong>Rec:</strong> {agent.rec}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Categorized Actionable Logs */}
      {activeTab === "logs" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1 bg-white border border-border/40 rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-bold text-dusk-teal uppercase px-2 block mb-2">Logs Divisions</span>
            {Object.keys(logsCategories).map(catName => (
              <button
                key={catName}
                onClick={() => { setSelectedCategory(catName); setSearchQuery(""); }}
                className={\`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-between \${
                  selectedCategory === catName
                    ? "bg-marigold/10 text-marigold"
                    : "text-dusk-teal hover:bg-sand/30 hover:text-ink-indigo"
                }\`}
              >
                <span>{catName}</span>
                <span className="bg-sand/80 text-dusk-teal/80 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  {logsCategories[catName].length}
                </span>
              </button>
            ))}
          </div>

          {/* Logs List Pane */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-border/40 p-4 rounded-xl flex items-center gap-3 shadow-sm">
              <Search className="w-4 h-4 text-dusk-teal/50" />
              <input
                type="text"
                placeholder={\`Search through \${selectedCategory} logs...\`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs focus:outline-none bg-transparent text-deep-charcoal"
              />
            </div>

            <div className="bg-white border border-border/40 rounded-xl shadow-sm overflow-hidden divide-y divide-border/20">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => {
                  const isDone = !!completedItems[log];
                  return (
                    <div
                      key={index}
                      onClick={() => toggleLogCheck(log)}
                      className={\`p-4 flex items-start gap-3 cursor-pointer hover:bg-sand/15 transition \${
                        isDone ? "bg-emerald-50/10 text-dusk-teal/60 line-through" : "text-deep-charcoal"
                      }\`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        readOnly
                        className="w-4 h-4 mt-0.5 rounded border-border accent-emerald-600 pointer-events-none"
                      />
                      <div className="text-xs">
                        <span className="font-mono text-dusk-teal/60 mr-2 text-[10px]">
                          #{index + 1}
                        </span>
                        <span className="font-medium leading-relaxed">{log}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-xs text-dusk-teal/60 italic">
                  No matching improvement items found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 90-Day Sprint Roadmap */}
      {activeTab === "roadmap" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="p-5 bg-white border border-border/40 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-ink-indigo font-display">90-Day Implementation Timeline</h3>
            <p className="text-[11px] text-dusk-teal mt-0.5">
              Follow and check off key sprints mapped to scale Journey OS into a premium platform.
            </p>
          </div>

          <div className="space-y-6 relative border-l-2 border-border/30 ml-4 pl-6 py-2">
            {/* Sprint 1 */}
            <div className="space-y-3 relative">
              <div className="absolute -left-9.5 top-0.5 bg-ink-indigo text-white font-mono font-bold text-[9px] w-6 h-6 rounded-full flex items-center justify-center border border-white">
                S1
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-indigo">Sprint 1: Critical Core Fixes (Days 1 - 22)</h4>
                <p className="text-[10px] text-dusk-teal">Build essential missing layouts and fix rule engines.</p>
              </div>
              <div className="space-y-2 pl-2">
                <div onClick={() => toggleRoadmapCheck("s1-t1")} className="flex items-center gap-2.5 text-xs text-deep-charcoal cursor-pointer">
                  <input type="checkbox" checked={sprintProgress["s1-t1"]} readOnly className="w-3.5 h-3.5 accent-emerald-600 pointer-events-none" />
                  <span className={sprintProgress["s1-t1"] ? "line-through text-dusk-teal/60" : "font-medium"}>
                    Implement Bundle Builder UI components (Hotels, Swaps & checkout flow).
                  </span>
                </div>
                <div onClick={() => toggleRoadmapCheck("s1-t2")} className="flex items-center gap-2.5 text-xs text-deep-charcoal cursor-pointer">
                  <input type="checkbox" checked={sprintProgress["s1-t2"]} readOnly className="w-3.5 h-3.5 accent-emerald-600 pointer-events-none" />
                  <span className={sprintProgress["s1-t2"] ? "line-through text-dusk-teal/60" : "font-medium"}>
                    Decouple hardcoded scoring rules from typescript models into database execution queries.
                  </span>
                </div>
                <div onClick={() => toggleRoadmapCheck("s1-t3")} className="flex items-center gap-2.5 text-xs text-deep-charcoal cursor-pointer">
                  <input type="checkbox" checked={sprintProgress["s1-t3"]} readOnly className="w-3.5 h-3.5 accent-emerald-600 pointer-events-none" />
                  <span className={sprintProgress["s1-t3"] ? "line-through text-dusk-teal/60" : "font-medium"}>
                    Setup checks to screen out age-unsuitable experiences (nightlife, bars) for kid-friendly trips.
                  </span>
                </div>
                <div onClick={() => toggleRoadmapCheck("s1-t4")} className="flex items-center gap-2.5 text-xs text-deep-charcoal cursor-pointer">
                  <input type="checkbox" checked={sprintProgress["s1-t4"]} readOnly className="w-3.5 h-3.5 accent-emerald-600 pointer-events-none" />
                  <span className={sprintProgress["s1-t4"] ? "line-through text-dusk-teal/60" : "font-medium"}>
                    Encrypt client phone logs and email parameters in database tables.
                  </span>
                </div>
              </div>
            </div>

            {/* Sprint 2 */}
            <div className="space-y-3 relative">
              <div className="absolute -left-9.5 top-0.5 bg-dusk-teal text-white font-mono font-bold text-[9px] w-6 h-6 rounded-full flex items-center justify-center border border-white">
                S2
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-indigo">Sprint 2: AI & Semantic search (Days 23 - 45)</h4>
                <p className="text-[10px] text-dusk-teal">Setup vector databases and semantic validation caching.</p>
              </div>
              <div className="space-y-2 pl-2">
                <div onClick={() => toggleRoadmapCheck("s2-t1")} className="flex items-center gap-2.5 text-xs text-deep-charcoal cursor-pointer">
                  <input type="checkbox" checked={sprintProgress["s2-t1"]} readOnly className="w-3.5 h-3.5 accent-emerald-600 pointer-events-none" />
                  <span className={sprintProgress["s2-t1"] ? "line-through text-dusk-teal/60" : "font-medium"}>
                    Implement pgvector RAG matching indexes on experiences templates.
                  </span>
                </div>
                <div onClick={() => toggleRoadmapCheck("s2-t2")} className="flex items-center gap-2.5 text-xs text-deep-charcoal cursor-pointer">
                  <input type="checkbox" checked={sprintProgress["s2-t2"]} readOnly className="w-3.5 h-3.5 accent-emerald-600 pointer-events-none" />
                  <span className={sprintProgress["s2-t2"] ? "line-through text-dusk-teal/60" : "font-medium"}>
                    Integrate Redis semantic cache logic on AI validation checks to control cost.
                  </span>
                </div>
                <div onClick={() => toggleRoadmapCheck("s2-t3")} className="flex items-center gap-2.5 text-xs text-deep-charcoal cursor-pointer">
                  <input type="checkbox" checked={sprintProgress["s2-t3"]} readOnly className="w-3.5 h-3.5 accent-emerald-600 pointer-events-none" />
                  <span className={sprintProgress["s2-t3"] ? "line-through text-dusk-teal/60" : "font-medium"}>
                    Automate WhatsApp webhook updates to trigger client alerts on CRM updates.
                  </span>
                </div>
              </div>
            </div>

            {/* Sprint 3 */}
            <div className="space-y-3 relative">
              <div className="absolute -left-9.5 top-0.5 bg-marigold text-white font-mono font-bold text-[9px] w-6 h-6 rounded-full flex items-center justify-center border border-white">
                S3
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-indigo">Sprint 3: Operations & Admin Console (Days 46 - 68)</h4>
                <p className="text-[10px] text-dusk-teal">Implement drag-and-drop question flows and SQL editors.</p>
              </div>
              <div className="space-y-2 pl-2">
                <div onClick={() => toggleRoadmapCheck("s3-t1")} className="flex items-center gap-2.5 text-xs text-deep-charcoal cursor-pointer">
                  <input type="checkbox" checked={sprintProgress["s3-t1"]} readOnly className="w-3.5 h-3.5 accent-emerald-600 pointer-events-none" />
                  <span className={sprintProgress["s3-t1"] ? "line-through text-dusk-teal/60" : "font-medium"}>
                    Build direct questionnaire editor drag UI page inside admin dashboard.
                  </span>
                </div>
                <div onClick={() => toggleRoadmapCheck("s3-t2")} className="flex items-center gap-2.5 text-xs text-deep-charcoal cursor-pointer">
                  <input type="checkbox" checked={sprintProgress["s3-t2"]} readOnly className="w-3.5 h-3.5 accent-emerald-600 pointer-events-none" />
                  <span className={sprintProgress["s3-t2"] ? "line-through text-dusk-teal/60" : "font-medium"}>
                    Connect metrics charts in admin dashboards to live database records counters.
                  </span>
                </div>
              </div>
            </div>

            {/* Sprint 4 */}
            <div className="space-y-3 relative">
              <div className="absolute -left-9.5 top-0.5 bg-clay-rose text-white font-mono font-bold text-[9px] w-6 h-6 rounded-full flex items-center justify-center border border-white">
                S4
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-indigo">Sprint 4: Growth & Scaling (Days 69 - 90)</h4>
                <p className="text-[10px] text-dusk-teal">Establish dynamic map routing views and shared group voting.</p>
              </div>
              <div className="space-y-2 pl-2">
                <div onClick={() => toggleRoadmapCheck("s4-t1")} className="flex items-center gap-2.5 text-xs text-deep-charcoal cursor-pointer">
                  <input type="checkbox" checked={sprintProgress["s4-t1"]} readOnly className="w-3.5 h-3.5 accent-emerald-600 pointer-events-none" />
                  <span className={sprintProgress["s4-t1"] ? "line-through text-dusk-teal/60" : "font-medium"}>
                    Launch dynamic Google/OpenStreetMap route graphs and shared voter link triggers for friends groups.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.mkdirSync(path.dirname(targetFile), { recursive: true });
fs.writeFileSync(targetFile, componentCode, 'utf-8');
console.log('Successfully generated improvements admin UI page at: ' + targetFile);
