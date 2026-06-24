"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { checkoutBookingGate } from "@/lib/supabase";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const itineraryId = params.itinerary_id as string;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    preferredTime: "morning",
    consent: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg("Please fill out your Name and Email address.");
      return;
    }

    if (!formData.consent) {
      setErrorMsg("You must check the box to consent to receiving travel plans.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await checkoutBookingGate(
        itineraryId,
        formData.name,
        formData.email,
        formData.preferredTime
      );

      if (res?.success) {
        setSuccess(true);
      } else {
        setErrorMsg("Failed to register booking intent. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setErrorMsg("An error occurred during booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-sand text-deep-charcoal flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white border border-border/40 p-8 rounded-2xl shadow-lg text-center animate-fade-in">
          <span className="text-4xl">✈️</span>
          <h2 className="text-2xl font-display font-bold text-ink-indigo mt-4">
            Booking Intent Registered!
          </h2>
          <p className="text-xs text-dusk-teal leading-relaxed mt-2">
            Thank you <strong className="text-deep-charcoal">{formData.name}</strong>! We've updated your session lifecycle to <strong className="text-marigold">booking_intent</strong>.
          </p>
          <div className="my-6 p-4 rounded-xl bg-sand/30 text-left text-xs leading-relaxed border border-border/20 font-mono flex flex-col gap-2">
            <div>
              <strong>Email:</strong> {formData.email}
            </div>
            <div>
              <strong>Preferred Time:</strong> {formData.preferredTime}
            </div>
            <div>
              <strong>Itinerary Code:</strong> {itineraryId.substring(0, 8)}...
            </div>
          </div>
          <p className="text-xs text-dusk-teal/80 leading-normal mb-6">
            A travel concierge will reach out to you via email/WhatsApp during your preferred contact window.
          </p>
          <Link href={`/itinerary/${itineraryId}`}>
            <Button className="w-full bg-ink-indigo hover:bg-ink-indigo/90 text-white font-bold py-3.5 rounded-xl">
              Back to Itinerary
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand text-deep-charcoal flex items-center justify-center p-4 sm:p-8 font-sans pb-16">
      <div className="w-full max-w-md bg-white border border-border/40 p-8 rounded-2xl shadow-lg">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-4 text-xs font-mono text-dusk-teal text-left">
          <Link href={`/itinerary/${itineraryId}`} className="hover:underline">
            ← Back to Itinerary Hub
          </Link>
        </div>

        <div className="flex flex-col gap-1 mb-6 text-left">
          <span className="text-xs font-bold text-clay-rose uppercase tracking-widest font-mono">
            Booking checkout
          </span>
          <h1 className="text-2xl font-display font-bold text-ink-indigo">
            Lock In Your Adventure
          </h1>
          <p className="text-xs text-dusk-teal leading-relaxed mt-1">
            Complete the checkout details. A travel concierge will verify dates, flight options, and final pricing before confirmation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-dusk-teal">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Sara Jones"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="p-3 border border-border rounded-xl bg-transparent text-sm focus:ring-1 focus:ring-marigold outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-dusk-teal">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="e.g. sara.jones@example.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="p-3 border border-border rounded-xl bg-transparent text-sm focus:ring-1 focus:ring-marigold outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="preferredTime" className="text-xs font-semibold text-dusk-teal">
              Preferred Contact Time
            </label>
            <select
              id="preferredTime"
              value={formData.preferredTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, preferredTime: e.target.value }))}
              className="p-3 border border-border rounded-xl bg-transparent text-sm focus:ring-1 focus:ring-marigold"
            >
              <option value="morning">Morning (9 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
              <option value="evening">Evening (5 PM - 8 PM)</option>
            </select>
          </div>

          <div className="flex gap-2.5 items-start bg-sand/30 p-4 rounded-xl border border-border/20 mt-2">
            <input
              id="consent"
              type="checkbox"
              checked={formData.consent}
              onChange={(e) => setFormData((prev) => ({ ...prev, consent: e.target.checked }))}
              className="w-4 h-4 mt-0.5 accent-marigold"
            />
            <label htmlFor="consent" className="text-[10px] text-dusk-teal/80 leading-normal cursor-pointer select-none">
              I consent to receiving customized travel itineraries on WhatsApp/Email. I understand that my travel DNA profile will be stored securely.
            </label>
          </div>

          {errorMsg && (
            <span className="text-xs text-rose-500 font-semibold mt-1">
              {errorMsg}
            </span>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="bg-marigold hover:bg-marigold/90 text-white font-bold py-4 rounded-xl mt-4 shadow-md w-full"
          >
            {loading ? "Registering Request..." : "Request Booking Details"}
          </Button>
        </form>

      </div>
    </div>
  );
}
