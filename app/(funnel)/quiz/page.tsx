"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

// Question Card Component to capture constraints
interface ResponseData {
  occasion: string;
  groupType: "solo" | "couple" | "family" | "group";
  childAges: number[];
  durationDays: number;
  budgetType: "per_person" | "total";
  budgetValue: number;
  destinationSlug: string;
}

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDestination = searchParams.get("destination") || "";

  // Dest setup
  const [destinations, setDestinations] = useState<{ countries: Country[]; cities: City[] } | null>(null);

  // States
  const [step, setStep] = useState<"tier0" | "teaser" | "tier1" | "gate1" | "complete">("tier0");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeQuestion, setActiveQuestion] = useState(0); // 0 to 4
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Answers State
  const [answers, setAnswers] = useState<ResponseData>({
    occasion: "Vacation",
    groupType: "couple",
    childAges: [],
    durationDays: 7,
    budgetType: "total",
    budgetValue: 120000,
    destinationSlug: initialDestination,
  });

  // Slider values for Tier 1
  const [sliders, setSliders] = useState<{ [key: string]: number }>({
    Luxury: 50,
    Adventure: 50,
    Shopping: 50,
    Food: 50,
    Nature: 50,
    Nightlife: 50,
    Culture: 50,
  });

  // Child ages counts
  const [numChildren, setNumChildren] = useState(0);

  useEffect(() => {
    getDestinations().then(setDestinations);
  }, []);

  // Update children ages array when count changes
  useEffect(() => {
    setAnswers((prev) => ({
      ...prev,
      childAges: Array(numChildren).fill(8), // default age 8
    }));
  }, [numChildren]);

  const handleChildAgeChange = (index: number, age: number) => {
    setAnswers((prev) => {
      const newAges = [...prev.childAges];
      newAges[index] = age;
      return { ...prev, childAges: newAges };
    });
  };

  // Step validation
  const progressPercent = Math.round(((activeQuestion) / 4) * 100);

  // Handle tier 0 submission
  const handleTier0Submit = async () => {
    setStep("teaser");
    
    // Perform anonymous signup and register profile
    try {
      const anonUid = await anonymousSignUp();
      setUserId(anonUid);
      const profId = await ensureUserAndProfile(anonUid);
      setProfileId(profId);

      // Submit each answer row
      await submitQuestionnaireResponse(profId, 0, "occasion", answers.occasion);
      await submitQuestionnaireResponse(profId, 0, "group_type", answers.groupType);
      if (answers.groupType === "family") {
        await submitQuestionnaireResponse(profId, 0, "child_ages", answers.childAges);
      }
      await submitQuestionnaireResponse(profId, 0, "duration_days", answers.durationDays);
      await submitQuestionnaireResponse(profId, 0, "budget_type", answers.budgetType);
      await submitQuestionnaireResponse(profId, 0, "budget_value", answers.budgetValue);
      await submitQuestionnaireResponse(profId, 0, "destination_slug", answers.destinationSlug);
    } catch (err) {
      console.error("Failed storing questionnaire responses:", err);
    }
  };

  // Handle tier 1 submission
  const handleTier1Submit = async () => {
    if (profileId) {
      try {
        await submitQuestionnaireResponse(profileId, 1, "personality_sliders", sliders);
      } catch (err) {
        console.error("Failed submitting Tier 1 sliders:", err);
      }
    }
    setStep("gate1");
  };

  // Handle WhatsApp capture submit
  const handleGate1Submit = async () => {
    if (!whatsapp.trim()) {
      setErrorMsg("Please enter a valid WhatsApp number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      if (profileId) {
        // 1. Submit lead details (RLS bypassed on insert)
        await submitWhatsAppLead(profileId, whatsapp);

        // 2. Compute Travel DNA and generate Itinerary
        const res = await generateItineraryForProfile(profileId, sliders, answers);

        if (res?.itineraryId) {
          // 3. Redirect to /itinerary/[id]
          router.push(`/itinerary/${res.itineraryId}`);
          return;
        }
      }
      setErrorMsg("Failed to generate itinerary. Please try again.");
    } catch (err) {
      console.error("Failed submitting Gate 1:", err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Rendering Functions
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 sm:p-8 bg-sand text-deep-charcoal font-sans transition-all duration-300">
      <div className="w-full max-w-lg">
        {step === "tier0" && (
          <div
            className="theme-surface bg-white p-8 border border-border/40 flex flex-col gap-6"
            style={{
              borderRadius: "var(--radius)",
              boxShadow: "var(--theme-shadow)",
            }}
          >
            {/* Progress bar */}
            <div className="w-full bg-sand/80 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-marigold h-full transition-all duration-300"
                style={{ width: `${progressPercent || 10}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs font-mono text-dusk-teal">
              <span>Question {activeQuestion + 1} of 5</span>
              <span>{progressPercent}% Complete</span>
            </div>

            {/* Q0: Destination Selection */}
            {activeQuestion === 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-display font-bold text-ink-indigo">
                  Where would you like to travel?
                </h2>
                <div className="flex flex-col gap-2">
                  <select
                    value={answers.destinationSlug}
                    onChange={(e) => setAnswers(prev => ({ ...prev, destinationSlug: e.target.value }))}
                    className="p-3 border border-border rounded-xl bg-transparent text-sm focus:ring-1 focus:ring-marigold"
                  >
                    <option value="">Let AI suggest (Undecided)</option>
                    {destinations?.cities.map((city) => (
                      <option key={city.id} value={city.name.toLowerCase()}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Q1: Group Type & Companion */}
            {activeQuestion === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-display font-bold text-ink-indigo">
                  Who is traveling with you?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {(["solo", "couple", "family", "group"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setAnswers(prev => ({ ...prev, groupType: t }))}
                      className={`p-4 rounded-xl border text-sm capitalize font-medium transition-all ${
                        answers.groupType === t
                          ? "border-marigold bg-marigold/10 text-marigold"
                          : "border-border/60 hover:border-marigold"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Conditional Family details */}
                {answers.groupType === "family" && (
                  <div className="flex flex-col gap-3 bg-sand/30 p-4 rounded-xl mt-2">
                    <label className="text-xs font-semibold text-dusk-teal">Number of Children</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={numChildren}
                      onChange={(e) => setNumChildren(Math.max(0, parseInt(e.target.value) || 0))}
                      className="p-2 border border-border rounded bg-white text-sm"
                    />

                    {numChildren > 0 && (
                      <div className="flex flex-col gap-2 mt-2">
                        <label className="text-xs font-semibold text-dusk-teal">Ages of Children</label>
                        <div className="grid grid-cols-3 gap-2">
                          {answers.childAges.map((age, idx) => (
                            <input
                              key={idx}
                              type="number"
                              min={0}
                              max={18}
                              value={age}
                              onChange={(e) => handleChildAgeChange(idx, parseInt(e.target.value) || 0)}
                              placeholder={`Child ${idx + 1}`}
                              className="p-2 border border-border rounded bg-white text-xs text-center"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Q2: Occasion */}
            {activeQuestion === 2 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-display font-bold text-ink-indigo">
                  What is the occasion?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {["Honeymoon", "Anniversary", "Birthday", "Family Vacation", "Business", "Leisure"].map((occ) => (
                    <button
                      key={occ}
                      onClick={() => setAnswers(prev => ({ ...prev, occasion: occ }))}
                      className={`p-4 rounded-xl border text-sm transition-all ${
                        answers.occasion === occ
                          ? "border-marigold bg-marigold/10 text-marigold"
                          : "border-border/60 hover:border-marigold"
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q3: Trip Duration */}
            {activeQuestion === 3 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-display font-bold text-ink-indigo">
                  How long will you stay?
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[3, 5, 7, 10, 14, 21].map((d) => (
                      <button
                        key={d}
                        onClick={() => setAnswers(prev => ({ ...prev, durationDays: d }))}
                        className={`p-3 rounded-xl border text-sm font-mono ${
                          answers.durationDays === d
                            ? "border-marigold bg-marigold/10 text-marigold"
                            : "border-border/60 hover:border-marigold"
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-dusk-teal/80 px-1 mt-2">
                    <span>Custom Days:</span>
                    <input
                      type="number"
                      value={answers.durationDays}
                      onChange={(e) => setAnswers(prev => ({ ...prev, durationDays: Math.max(1, parseInt(e.target.value) || 1) }))}
                      className="p-1.5 border border-border rounded text-center w-20 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Q4: Budget selection */}
            {activeQuestion === 4 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-display font-bold text-ink-indigo">
                  What is your travel budget?
                </h2>
                
                {/* Budget Type Toggle */}
                <div className="flex rounded-xl bg-sand/50 p-1 border border-border">
                  <button
                    onClick={() => setAnswers(prev => ({ ...prev, budgetType: "per_person" }))}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      answers.budgetType === "per_person" ? "bg-white text-ink-indigo shadow-sm" : "text-dusk-teal"
                    }`}
                  >
                    Per Person
                  </button>
                  <button
                    onClick={() => setAnswers(prev => ({ ...prev, budgetType: "total" }))}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      answers.budgetType === "total" ? "bg-white text-ink-indigo shadow-sm" : "text-dusk-teal"
                    }`}
                  >
                    Total Budget
                  </button>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-dusk-teal uppercase tracking-wider font-mono">Amount:</span>
                    <span className="text-2xl font-mono font-bold text-marigold">
                      {answers.budgetType === "per_person" ? "₹" : "Total: ₹"}{answers.budgetValue.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20000}
                    max={500000}
                    step={10000}
                    value={answers.budgetValue}
                    onChange={(e) => setAnswers(prev => ({ ...prev, budgetValue: parseInt(e.target.value) }))}
                    className="w-full accent-marigold"
                  />
                  <div className="flex justify-between text-[10px] text-dusk-teal/80 font-mono">
                    <span>₹20,000</span>
                    <span>₹2,50,000</span>
                    <span>₹5,000,000+</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-4">
              <Button
                variant="ghost"
                disabled={activeQuestion === 0}
                onClick={() => setActiveQuestion(prev => prev - 1)}
                className="text-dusk-teal"
              >
                Back
              </Button>
              {activeQuestion < 4 ? (
                <Button
                  onClick={() => setActiveQuestion(prev => prev + 1)}
                  className="bg-ink-indigo text-white px-6"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleTier0Submit}
                  className="bg-marigold hover:bg-marigold/90 text-white font-semibold px-8"
                >
                  Submit & Preview Match
                </Button>
              )}
            </div>
          </div>
        )}

        {/* D3 Teaser Itinerary Screen */}
        {step === "teaser" && (
          <div
            className="theme-surface bg-white p-8 border border-border/40 flex flex-col gap-6 text-center animate-fade-in"
            style={{
              borderRadius: "var(--radius)",
              boxShadow: "var(--theme-shadow)",
            }}
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-clay-rose uppercase tracking-widest font-mono">
                Decoded Travel DNA
              </span>
              <h2 className="text-3xl font-display font-bold text-ink-indigo">
                Analyzing Your Signature Match...
              </h2>
            </div>

            <div className="my-6 p-4 rounded-xl bg-sand/30 text-left text-sm leading-relaxed border border-border/20 flex flex-col gap-3 font-mono">
              <div>
                <strong>Destination:</strong> {answers.destinationSlug || "Singapore (Recommended)"}
              </div>
              <div>
                <strong>Occasion:</strong> {answers.occasion}
              </div>
              <div>
                <strong>Party Size:</strong> {answers.groupType === "family" ? `Family (${answers.childAges.length} children)` : answers.groupType}
              </div>
              <div>
                <strong>Budget:</strong> {answers.budgetType.replace("_", " ")}: ₹{answers.budgetValue.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Simulated AI matches */}
            <div className="flex flex-col gap-3 text-left">
              <h4 className="text-xs font-bold uppercase text-marigold tracking-widest font-mono">
                Top Decoded Candidates:
              </h4>
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-white border border-border/30 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-xs text-ink-indigo">Marina Bay Sands SkyPark (Luxury)</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">98% Match</span>
                </div>
                <div className="p-3 bg-white border border-border/30 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-xs text-ink-indigo">Gardens by the Bay (Nature & Photography)</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">92% Match</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep("tier1")}
              className="bg-marigold hover:bg-marigold/90 text-white font-semibold py-4 w-full mt-4"
            >
              Sharpen Your Match (Tier 1)
            </Button>
          </div>
        )}

        {/* D4 Tier 1 sliders screen */}
        {step === "tier1" && (
          <div
            className="theme-surface bg-white p-8 border border-border/40 flex flex-col gap-6"
            style={{
              borderRadius: "var(--radius)",
              boxShadow: "var(--theme-shadow)",
            }}
          >
            <div className="flex flex-col gap-1 text-center">
              <span className="text-xs font-bold text-clay-rose uppercase tracking-widest font-mono">
                Stage 2 (Tier 1)
              </span>
              <h2 className="text-2xl font-display font-bold text-ink-indigo">
                Sharpen Your Travel DNA
              </h2>
              <p className="text-xs text-dusk-teal">
                Drag the sliders to indicate which dimensions you prioritize for this trip.
              </p>
            </div>

            <div className="flex flex-col gap-5 mt-4">
              {Object.keys(sliders).map((dim) => (
                <div key={dim} className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-semibold text-ink-indigo">
                    <span>{dim}</span>
                    <span className="font-mono text-marigold">{sliders[dim]}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sliders[dim]}
                    onChange={(e) => setSliders(prev => ({ ...prev, [dim]: parseInt(e.target.value) }))}
                    className="w-full accent-marigold"
                  />
                </div>
              ))}
            </div>

            <Button
              onClick={handleTier1Submit}
              className="bg-ink-indigo hover:bg-ink-indigo/90 text-white py-4 w-full mt-4"
            >
              Confirm DNA Profile
            </Button>
          </div>
        )}

        {step === "gate1" && (
          <div
            className="theme-surface bg-white p-8 border border-border/40 flex flex-col gap-6 text-center animate-fade-in"
            style={{
              borderRadius: "var(--radius)",
              boxShadow: "var(--theme-shadow)",
            }}
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-clay-rose uppercase tracking-widest font-mono">
                Final Step
              </span>
              <h2 className="text-2xl font-display font-bold text-ink-indigo">
                Get Your Curated Itinerary
              </h2>
              <p className="text-xs text-dusk-teal">
                We'll text you the complete travel plan on WhatsApp.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-left">
              <label htmlFor="whatsapp" className="text-xs font-semibold text-dusk-teal">
                WhatsApp Number
              </label>
              <input
                id="whatsapp"
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="p-3 border border-border rounded-xl bg-transparent text-sm focus:ring-1 focus:ring-marigold outline-none"
              />
              <span className="text-[10px] text-dusk-teal/70 leading-normal">
                By clicking below, you consent to receive curated travel plans and marketing messages from JourneyOS.
              </span>
            </div>

            {errorMsg && (
              <span className="text-xs text-rose-500 text-left font-semibold">
                {errorMsg}
              </span>
            )}

            <Button
              onClick={handleGate1Submit}
              disabled={loading}
              className="bg-marigold hover:bg-marigold/90 text-white font-semibold py-4 w-full mt-2"
            >
              {loading ? "Generating Full Itinerary..." : "Send me my full itinerary"}
            </Button>
          </div>
        )}

        {step === "complete" && (
          <div
            className="theme-surface bg-white p-8 border border-border/40 flex flex-col gap-6 text-center"
            style={{
              borderRadius: "var(--radius)",
              boxShadow: "var(--theme-shadow)",
            }}
          >
            <h2 className="text-3xl font-display font-bold text-ink-indigo">DNA Profile Decoded!</h2>
            <p className="text-dusk-teal text-sm leading-relaxed">
              Congratulations! Your subconscious travel signature has been successfully decoded. It has been synced securely to your anonymous session.
            </p>
            <div className="p-4 bg-sand/30 rounded-xl border border-border/20 font-mono text-xs text-left leading-relaxed flex flex-col gap-2">
              <div><strong>User Session ID:</strong> {userId}</div>
              <div><strong>DNA Profile ID:</strong> {profileId}</div>
              <div><strong>Active Dimensions:</strong> {Object.entries(sliders).filter(([_, val]) => val > 60).map(([key]) => key).join(", ") || "Balanced"}</div>
            </div>
            <Link href="/">
              <Button className="bg-ink-indigo text-white py-3 w-full">Return to Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div>Loading quiz components...</div>}>
      <QuizContent />
    </Suspense>
  );
}
