import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Homepage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-sand px-6 py-24 sm:py-32 lg:px-8 flex flex-col items-center text-center">
        {/* Subtle background graphics */}
        <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(circle_at_center,var(--color-marigold)_0%,transparent_60%)]" />

        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
          <span className="text-xs font-semibold tracking-widest uppercase text-clay-rose px-3 py-1 rounded-full bg-clay-rose/10 font-mono">
            Introducing Journey OS
          </span>
          <h1 className="text-5xl sm:text-6xl font-display font-bold text-ink-indigo tracking-tight leading-none">
            Your Travel Preferences. <span className="italic text-marigold">Decoded.</span>
          </h1>
          <p className="text-lg text-dusk-teal leading-relaxed max-w-2xl">
            We plan your flights, match your stays, and handpick local experiences by mapping your subconscious tastes into a bespoke signature travel profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto justify-center">
            <Link href="/quiz">
              <Button className="w-full sm:w-auto bg-marigold hover:bg-marigold/90 text-white font-semibold py-6 px-8 rounded-lg shadow-md transition-all duration-200 text-base">
                Discover Your Trip Style
              </Button>
            </Link>
            <Link href="/destinations">
              <Button variant="outline" className="w-full sm:w-auto border-ink-indigo text-ink-indigo hover:bg-ink-indigo/10 py-6 px-8 rounded-lg text-base">
                Explore Destinations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Pitch / How It Works */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-ink-indigo">
            How Journey OS Crafting Works
          </h2>
          <p className="text-dusk-teal">
            Combining RAG AI precision with human agency for flawless execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="theme-surface p-8 bg-white border border-border/40 rounded-3xl flex flex-col gap-4 text-left">
            <div className="w-12 h-12 bg-sand text-marigold flex items-center justify-center rounded-xl font-mono text-xl font-bold">
              01
            </div>
            <h3 className="text-xl font-display font-bold text-ink-indigo">
              Take the Questionnaire
            </h3>
            <p className="text-sm text-deep-charcoal/80 leading-relaxed">
              Complete Tier 0 (mandatory constraints) and Tier 1 (sliders) in minutes to establish your baseline preferences.
            </p>
          </div>

          {/* Card 2 */}
          <div className="theme-surface p-8 bg-white border border-border/40 rounded-3xl flex flex-col gap-4 text-left">
            <div className="w-12 h-12 bg-sand text-clay-rose flex items-center justify-center rounded-xl font-mono text-xl font-bold">
              02
            </div>
            <h3 className="text-xl font-display font-bold text-ink-indigo">
              AI Decodes the Profile
            </h3>
            <p className="text-sm text-deep-charcoal/80 leading-relaxed">
              Our Recommendation Engine scores your profile across 10 dimensions, matching tags and excluding disappointments.
            </p>
          </div>

          {/* Card 3 */}
          <div className="theme-surface p-8 bg-white border border-border/40 rounded-3xl flex flex-col gap-4 text-left">
            <div className="w-12 h-12 bg-sand text-dusk-teal flex items-center justify-center rounded-xl font-mono text-xl font-bold">
              03
            </div>
            <h3 className="text-xl font-display font-bold text-ink-indigo">
              Human Agents Refine & Book
            </h3>
            <p className="text-sm text-deep-charcoal/80 leading-relaxed">
              Your match is assigned to a certified specialist who customizes the itinerary and securely sources the travel products.
            </p>
          </div>
        </div>
      </section>

      {/* Subtle CTA Footer Section */}
      <section className="bg-ink-indigo text-white py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-3xl font-display font-bold">Ready to travel differently?</h2>
          <p className="text-sand/80 text-sm leading-relaxed max-w-lg">
            Stop relying on generic travel listings. Decode your subconscious travel signature and let our RAG agents find your perfect matches.
          </p>
          <Link href="/quiz">
            <Button className="bg-marigold hover:bg-marigold/95 text-white py-5 px-8 rounded-lg shadow-lg font-semibold mt-2">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
