"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitDripResponseAndUpdateDNA } from "@/lib/supabase";

interface DripCardProps {
  profileId: string;
  onUpdate: () => void;
}

export default function DripCard({ profileId, onUpdate }: DripCardProps) {
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = async (option: "beach" | "safari") => {
    setSelectedOption(option);
    setAnswered(true);

    const questionId = "drip_beach_vs_safari";
    const answerValue = option === "beach" ? "Beachfront Dinner" : "Night Safari";
    const dimension = option === "beach" ? "Relaxation" : "Adventure";
    const scoreDelta = 15;

    await submitDripResponseAndUpdateDNA(profileId, questionId, answerValue, dimension, scoreDelta);
    onUpdate(); // Trigger refresh of itinerary data to reflect updated DNA
  };

  return (
    <div className="my-8 p-6 bg-white border border-marigold/30 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] bg-marigold/10 text-marigold font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          DNA Drip Choice
        </span>
      </div>
      
      {!answered ? (
        <div className="flex flex-col gap-4">
          <h4 className="text-base font-bold text-ink-indigo">
            Customize your evening: What is your vibe tonight?
          </h4>
          <p className="text-xs text-dusk-teal leading-relaxed">
            Your selection instantly updates your travel DNA scores and tunes future recommendation matches.
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <button
              onClick={() => handleSelect("beach")}
              className="w-full text-left p-3.5 border border-border rounded-xl text-xs font-semibold hover:border-marigold hover:bg-marigold/5 transition-all text-deep-charcoal"
            >
              🌅 Quiet beachfront candlelight dinner in Sentosa
            </button>
            <button
              onClick={() => handleSelect("safari")}
              className="w-full text-left p-3.5 border border-border rounded-xl text-xs font-semibold hover:border-marigold hover:bg-marigold/5 transition-all text-deep-charcoal"
            >
              🐾 Night Safari wild tram ride and animal encounter
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 text-center py-4">
          <span className="text-xl">✅</span>
          <h4 className="text-sm font-bold text-ink-indigo">Subconscious Vibe Locked!</h4>
          <p className="text-xs text-dusk-teal">
            Adjusted score for <strong className="text-marigold">{selectedOption === "beach" ? "Relaxation" : "Adventure"}</strong> by +15.
          </p>
        </div>
      )}
    </div>
  );
}
