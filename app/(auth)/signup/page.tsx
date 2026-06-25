"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { mergeAnonymousProfile } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [consentWhatsApp, setConsentWhatsApp] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (!consentTerms) {
      setErrorMsg("You must accept the Terms of Service & Privacy Policy.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      // 1. Sign up user in Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.user) {
        // 2. Log consent in consent_records
        await supabase.from("consent_records").insert([
          {
            user_id: data.user.id,
            consent_type: "signup_terms_and_privacy",
            consent_version: "v1.0",
            consent_given: true,
          },
          {
            user_id: data.user.id,
            consent_type: "whatsapp_updates",
            consent_version: "v1.0",
            consent_given: consentWhatsApp,
          }
        ]);

        setMessage("Registration successful! Check your email for confirmation.");
        
        // 3. Merge anonymous session profile if applicable
        if (typeof window !== "undefined") {
          const anonId = localStorage.getItem("journey_os_anon_user_id");
          if (anonId && anonId !== data.user.id) {
            await mergeAnonymousProfile(anonId, data.user.id);
          }
        }

        setTimeout(() => {
          router.push("/account");
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold font-display text-ink-indigo">Create Account</h1>
        <p className="text-sm text-dusk-teal">
          Save your preferences and start planning custom trips in minutes.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-clay-rose/10 border border-clay-rose/20 text-clay-rose text-sm rounded-xl">
          {errorMsg}
        </div>
      )}

      {message && (
        <div className="p-3 bg-dusk-teal/10 border border-dusk-teal/20 text-dusk-teal text-sm rounded-xl">
          {message}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-deep-charcoal uppercase tracking-wider mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-sand/30 border border-border/40 rounded-xl text-sm focus:outline-none focus:border-marigold"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-deep-charcoal uppercase tracking-wider mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-sand/30 border border-border/40 rounded-xl text-sm focus:outline-none focus:border-marigold"
            placeholder="name@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-deep-charcoal uppercase tracking-wider mb-1">
            WhatsApp / Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 bg-sand/30 border border-border/40 rounded-xl text-sm focus:outline-none focus:border-marigold"
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-deep-charcoal uppercase tracking-wider mb-1">
            Password *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-sand/30 border border-border/40 rounded-xl text-sm focus:outline-none focus:border-marigold"
            placeholder="Min. 8 characters"
            minLength={8}
            required
          />
        </div>

        {/* Consent Checkboxes */}
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentWhatsApp}
              onChange={(e) => setConsentWhatsApp(e.target.checked)}
              className="mt-1 accent-marigold"
            />
            <span className="text-xs text-deep-charcoal/80 leading-snug">
              I consent to receive travel itinerary updates and package recommendations directly via WhatsApp.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentTerms}
              onChange={(e) => setConsentTerms(e.target.checked)}
              className="mt-1 accent-marigold"
              required
            />
            <span className="text-xs text-deep-charcoal/80 leading-snug">
              I accept the{" "}
              <Link href="/terms" target="_blank" className="font-semibold text-clay-rose hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" target="_blank" className="font-semibold text-clay-rose hover:underline">
                Privacy Policy
              </Link>{" "}
              governing my data usage. *
            </span>
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-2 bg-marigold hover:bg-marigold/90 text-white rounded-xl text-sm font-semibold transition"
        >
          {loading ? "Registering..." : "Create Account"}
        </Button>
      </form>

      <div className="pt-4 text-center border-t border-border/20">
        <p className="text-xs text-dusk-teal">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-clay-rose hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
