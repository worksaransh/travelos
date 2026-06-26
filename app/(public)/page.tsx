"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Compass, Sparkles, MapPin, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function Homepage() {
  const featuredDestinations = [
    {
      name: "Singapore",
      tagline: "Ultra-Luxury Marina Bay Sands & Sentosa Escapes",
      price: "₹72,500",
      nights: 5,
      match: "98% Match",
      bgImage: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=600&auto=format&fit=crop",
      slug: "singapore"
    },
    {
      name: "Bali (Denpasar)",
      tagline: "Exotic beach resorts & cliffside sunset dinners",
      price: "₹54,000",
      nights: 6,
      match: "94% Match",
      bgImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600&auto=format&fit=crop",
      slug: "bali"
    },
    {
      name: "Dubai",
      tagline: "Modern skyscraper skylines & private desert safaris",
      price: "₹89,000",
      nights: 5,
      match: "91% Match",
      bgImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop",
      slug: "dubai"
    },
    {
      name: "Male (Maldives)",
      tagline: "Romantic overwater bungalows & coral reefs lagoons",
      price: "₹1,45,000",
      nights: 4,
      match: "95% Match",
      bgImage: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=600&auto=format&fit=crop",
      slug: "maldives"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-sand/10 text-deep-charcoal font-sans">
      {/* Immersive Search Hero Header */}
      <section className="relative overflow-hidden bg-ink-indigo text-white px-6 py-24 sm:py-32 flex flex-col items-center text-center">
        {/* Decorative backdrop gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,159,40,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(196,112,126,0.1),transparent_50%)]" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-6">
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-marigold px-3 py-1 rounded-full bg-marigold/15 border border-marigold/20 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bespoke Handcrafted Travel Journeys</span>
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight max-w-3xl leading-none">
            Where should you go next? <br className="hidden sm:inline" />
            <span className="italic text-marigold">Decoded in 60 seconds.</span>
          </h1>
          
          <p className="text-sm sm:text-base text-sand/80 max-w-2xl leading-relaxed">
            Stop digging through generic travel review sites. Journey OS decodes your unique travel preferences across 10 sub-dimensional scores to match you with signature, agent-refined packages.
          </p>

          {/* Core Interactive Search & Decode CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto justify-center">
            <Link href="/quiz">
              <Button className="w-full sm:w-auto bg-marigold hover:bg-marigold/90 text-ink-indigo hover:text-ink-indigo font-bold py-6.5 px-8 rounded-xl shadow-lg transition-all text-base border border-marigold">
                Find Your Perfect Travel Style
              </Button>
            </Link>
            <Link href="/destinations">
              <Button variant="outline" className="w-full sm:w-auto border-white/20 hover:border-white text-white hover:bg-white/5 py-6.5 px-8 rounded-xl text-base transition">
                Explore 16 Countries
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Immersive Destination Cards Section (PHASE 3 Requirement) */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/20 pb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-indigo flex items-center gap-2">
              <MapPin className="w-6 h-6 text-marigold" />
              <span>Immersive Signature Destinations</span>
            </h2>
            <p className="text-xs sm:text-sm text-dusk-teal mt-1">
              Select a catalog match to customize using your explicit preferences.
            </p>
          </div>
          <Link href="/destinations" className="text-marigold hover:underline font-bold text-xs flex items-center gap-1 shrink-0">
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDestinations.map((dest) => (
            <Link 
              key={dest.name} 
              href={`/quiz?destination=${dest.slug}`}
              className="group bg-white border border-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative"
            >
              {/* Cover Image */}
              <div className="h-48 w-full relative overflow-hidden bg-sand/35">
                <img 
                  src={dest.bgImage} 
                  alt={dest.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80";
                  }}
                />
                {/* Match Tag Overlay */}
                <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {dest.match}
                </span>
              </div>

              {/* Info Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-ink-indigo font-display group-hover:text-marigold transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-dusk-teal leading-relaxed">
                    {dest.tagline}
                  </p>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-border/10">
                  <span className="text-[10px] text-dusk-teal font-mono">{dest.nights} Nights Stay</span>
                  <span className="text-sm font-mono font-bold text-marigold">{dest.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Pitch & Safety Trust Bar */}
      <section className="bg-sand/30 border-y border-border/40 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-ink-indigo/10 text-ink-indigo flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-left">
              <h4 className="font-bold text-ink-indigo text-sm">Real-time Matching Engine</h4>
              <p className="text-xs text-dusk-teal leading-relaxed">
                Matches itinerary experience weights to your subconscious priorities automatically using dot-product proximity.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-ink-indigo/10 text-ink-indigo flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-left">
              <h4 className="font-bold text-ink-indigo text-sm">Disappointment Mitigation</h4>
              <p className="text-xs text-dusk-teal leading-relaxed">
                Rules scan exclusions (e.g. group companion restrictions) to remove bad hotel matches or travel overlaps.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-ink-indigo/10 text-ink-indigo flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-left">
              <h4 className="font-bold text-ink-indigo text-sm">GDPR/Compliance Protected</h4>
              <p className="text-xs text-dusk-teal leading-relaxed">
                Strict consent logs registry protects user preferences. Fully irreversible data-wipe soft deletes enabled.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
