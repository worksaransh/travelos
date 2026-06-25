"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/account/update-password`,
      });

      if (error) throw error;
      setMessage("A password reset link has been sent to your email. Check your inbox.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to request password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold font-display text-ink-indigo">Reset Password</h1>
        <p className="text-sm text-dusk-teal">
          Enter your email address and we'll send you a recovery link.
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

      <form onSubmit={handleReset} className="space-y-4">
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
          {loading ? "Sending..." : "Request Reset Link"}
        </Button>
      </form>

      <div className="pt-4 text-center border-t border-border/20">
        <p className="text-xs text-dusk-teal">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-clay-rose hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
