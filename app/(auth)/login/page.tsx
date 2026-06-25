"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { mergeAnonymousProfile } from "@/lib/auth";

type LoginMethod = "password" | "magic" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<LoginMethod>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Clear messages on tab swap
  useEffect(() => {
    setMessage("");
    setErrorMsg("");
  }, [method]);

  // Merge anonymous profile if it exists after successful auth
  const handlePostAuth = async (userId: string) => {
    if (typeof window !== "undefined") {
      const anonId = localStorage.getItem("journey_os_anon_user_id");
      if (anonId && anonId !== userId) {
        await mergeAnonymousProfile(anonId, userId);
      }
    }
    // Route to dashboard/home page
    router.push("/account");
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setMessage("Success! Logging you in...");
        await handlePostAuth(data.user.id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) throw error;
      setMessage("A magic link has been sent to your email. Check your inbox.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOTPRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setErrorMsg("Please enter your WhatsApp/Phone number.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;
      setOtpSent(true);
      setMessage("An OTP code has been sent to your WhatsApp/SMS.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !otp) {
      setErrorMsg("Please fill in both fields.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });

      if (error) throw error;

      if (data.user) {
        setMessage("Success! Code verified.");
        await handlePostAuth(data.user.id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold font-display text-ink-indigo">Sign In</h1>
        <p className="text-sm text-dusk-teal">
          Welcome back to Journey OS. Access your personalized journey.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-sand/60 rounded-xl border border-border/20">
        <button
          onClick={() => setMethod("password")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
            method === "password"
              ? "bg-white text-ink-indigo shadow-sm"
              : "text-dusk-teal/80 hover:text-ink-indigo"
          }`}
        >
          Password
        </button>
        <button
          onClick={() => setMethod("magic")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
            method === "magic"
              ? "bg-white text-ink-indigo shadow-sm"
              : "text-dusk-teal/80 hover:text-ink-indigo"
          }`}
        >
          Magic Link
        </button>
        <button
          onClick={() => setMethod("phone")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
            method === "phone"
              ? "bg-white text-ink-indigo shadow-sm"
              : "text-dusk-teal/80 hover:text-ink-indigo"
          }`}
        >
          Phone OTP
        </button>
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

      {method === "password" && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-deep-charcoal uppercase tracking-wider mb-1">
              Email Address
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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-deep-charcoal uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/reset-password"
                className="text-xs text-clay-rose hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-sand/30 border border-border/40 rounded-xl text-sm focus:outline-none focus:border-marigold"
              placeholder="••••••••"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-marigold hover:bg-marigold/90 text-white rounded-xl text-sm font-semibold transition"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      )}

      {method === "magic" && (
        <form onSubmit={handleMagicLinkLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-deep-charcoal uppercase tracking-wider mb-1">
              Email Address
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
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-marigold hover:bg-marigold/90 text-white rounded-xl text-sm font-semibold transition"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </Button>
        </form>
      )}

      {method === "phone" && (
        <div className="space-y-4">
          {!otpSent ? (
            <form onSubmit={handlePhoneOTPRequest} className="space-y-4">
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
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-marigold hover:bg-marigold/90 text-white rounded-xl text-sm font-semibold transition"
              >
                {loading ? "Sending..." : "Send WhatsApp OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePhoneOTPVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-deep-charcoal uppercase tracking-wider mb-1">
                  Enter One-Time Password (OTP)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 bg-sand/30 border border-border/40 rounded-xl text-sm focus:outline-none focus:border-marigold tracking-widest text-center text-lg font-bold"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  variant="outline"
                  className="w-1/3 py-3 border-border rounded-xl text-sm"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 bg-marigold hover:bg-marigold/90 text-white rounded-xl text-sm font-semibold transition"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="pt-4 text-center border-t border-border/20">
        <p className="text-xs text-dusk-teal">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-clay-rose hover:underline">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
