"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UpsellBottomSheetProps {
  itineraryId: string;
  travelPersona: string;
  onUpgrade: (upgradeType: string) => void;
}

export default function UpsellBottomSheet({ itineraryId, travelPersona, onUpgrade }: UpsellBottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show after scrolling a bit (e.g., scroll threshold of 200px)
    const handleScroll = () => {
      if (window.scrollY > 200 && !dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dismissed]);

  const handleUpgrade = (type: string) => {
    onUpgrade(type);
    setIsVisible(false);
    setDismissed(true);
  };

  if (!isVisible) return null;

  // Determine upsell copy based on travel persona
  const getUpsellCopy = () => {
    if (travelPersona.includes("Luxury") || travelPersona.includes("Romantic")) {
      return {
        title: "Indulge in Ultimate Luxury",
        description: "Upgrade your stay to a premium Marina Bay Sands Club Suite + Private Airport Transfers.",
        price: "+₹45,000 / couple",
        type: "luxury_hotel_upgrade"
      };
    } else if (travelPersona.includes("Adventure") || travelPersona.includes("Family")) {
      return {
        title: "VIP Experience Pass",
        description: "Add Skip-the-line VIP access to USS and frontline seating at Gardens by the Bay Light Show.",
        price: "+₹18,000 total",
        type: "vip_experience_upgrade"
      };
    }
    // Fallback/Comfort upsell
    return {
      title: "Unlock Signature Experiences",
      description: "Upgrade your Comfort plan to include private guided city exploration & standard airport cab transfers.",
      price: "+₹12,000 total",
      type: "private_guided_upgrade"
    };
  };

  const upsell = getUpsellCopy();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-deep-charcoal text-white rounded-t-3xl shadow-2xl transition-all duration-500 ease-in-out translate-y-0 max-w-lg mx-auto border-t border-white/10 animate-slide-up">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] bg-marigold text-deep-charcoal font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Exclusive DNA Upgrade
        </span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/60 hover:text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full bg-white/10"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-5 text-left">
        <h3 className="text-lg font-display font-bold text-marigold">
          {upsell.title}
        </h3>
        <p className="text-xs text-sand/80 leading-relaxed">
          {upsell.description}
        </p>
        <div className="text-xl font-mono font-bold text-white mt-1">
          {upsell.price}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => handleUpgrade(upsell.type)}
          className="flex-1 bg-marigold hover:bg-marigold/90 text-deep-charcoal font-bold py-3.5"
        >
          Apply Upgrade
        </Button>
        <Link href={`/itinerary/${itineraryId}/book`} className="flex-1">
          <Button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 border border-white/20">
            Book Now
          </Button>
        </Link>
      </div>
    </div>
  );
}
