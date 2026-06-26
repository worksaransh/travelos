"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { signOutUser, getCurrentSession } from "@/lib/auth";
import {
  User,
  Mail,
  Phone,
  Lock,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  LogOut,
  RefreshCw,
  Plus,
  Compass,
  ArrowRight,
  ShieldAlert,
  Smartphone,
  Info
} from "lucide-react";

// Types for user profile & scores
interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  lifecycle_stage: string;
  consent_status: string;
  current_dna_profile_id?: string;
}

interface TravelDnaData {
  travelPersona: string;
  budgetPersona: string;
  scores: { name: string; score: number }[];
}

interface ItineraryRecord {
  id: string;
  destination: string;
  tier: string;
  price: number;
  status: string;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  
  // Loading & state management
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [travelDna, setTravelDna] = useState<TravelDnaData | null>(null);
  const [itineraries, setItineraries] = useState<ItineraryRecord[]>([]);

  // Editing forms state
  const [editingProfile, setEditingProfile] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  
  // Credentials / Logins linking forms state
  const [linkEmailOpen, setLinkEmailOpen] = useState(false);
  const [linkPhoneOpen, setLinkPhoneOpen] = useState(false);
  
  const [linkEmail, setLinkEmail] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  
  const [linkPhone, setLinkPhone] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  // Status/Messages
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" });
  const [loginMsg, setLoginMsg] = useState({ text: "", type: "" });
  const [formLoading, setFormLoading] = useState(false);

  // Checks for linked providers
  const [hasEmailLogin, setHasEmailLogin] = useState(false);
  const [hasPhoneLogin, setHasPhoneLogin] = useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setProfileMsg({ text: "", type: "" });
    setLoginMsg({ text: "", type: "" });

    try {
      // 1. Get active session
      const session = await getCurrentSession();
      const user = session?.user || null;
      setSessionUser(user);

      // Determine linked login methods from providers list
      if (user) {
        const providers = user.app_metadata?.providers || [];
        setHasEmailLogin(providers.includes("email") || !!user.email);
        setHasPhoneLogin(providers.includes("phone") || !!user.phone);
      }

      // Check if we are running in dummy/local mock mode
      const isDummyMode =
        process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("127.0.0.1") ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes("dummy-anon-key");

      if (isDummyMode || !user) {
        // High fidelity mock fallbacks
        const mockUserId = user?.id || "mock-user-123";
        const mockProfile: ProfileData = {
          id: mockUserId,
          name: "Saransh Gulati",
          email: user?.email || "saransh@gmail.com",
          phone: user?.phone || "+91 98765 43210",
          lifecycle_stage: "engaged",
          consent_status: "gate1_whatsapp",
          current_dna_profile_id: "mock-dna-id"
        };
        
        setProfile(mockProfile);
        setFormName(mockProfile.name);
        setFormEmail(mockProfile.email);
        setFormPhone(mockProfile.phone);

        // Mock Travel DNA
        const mockDna: TravelDnaData = {
          travelPersona: "The Practical Planner",
          budgetPersona: "Comfort",
          scores: [
            { name: "Luxury", score: 45 },
            { name: "Adventure", score: 65 },
            { name: "Shopping", score: 40 },
            { name: "Food", score: 85 },
            { name: "Nature", score: 70 },
            { name: "Nightlife", score: 30 },
            { name: "Culture", score: 80 },
            { name: "Photography", score: 75 },
            { name: "Relaxation", score: 60 },
            { name: "Local Experiences", score: 90 }
          ]
        };
        setTravelDna(mockDna);

        // Mock Itineraries
        setItineraries([
          {
            id: "mock-itinerary-1",
            destination: "Singapore",
            tier: "Comfort",
            price: 120000,
            status: "active",
            created_at: new Date(Date.now() - 2 * 86400000).toISOString()
          },
          {
            id: "mock-itinerary-2",
            destination: "Bali (Denpasar)",
            tier: "Comfort",
            price: 54000,
            status: "draft",
            created_at: new Date(Date.now() - 5 * 86400000).toISOString()
          }
        ]);

        if (!user) {
          // If no actual user session, simulate providers linked
          setHasEmailLogin(true);
          setHasPhoneLogin(true);
        }
      } else {
        // Real Supabase queries
        // 2. Fetch User Custom Table Record
        const { data: dbUser, error: dbUserErr } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (dbUserErr && dbUserErr.code !== "PGRST116") {
          throw dbUserErr;
        }

        const activeProfile: ProfileData = {
          id: user.id,
          name: dbUser?.name || user.user_metadata?.name || "Traveler",
          email: dbUser?.email || user.email || "",
          phone: dbUser?.phone || user.phone || "",
          lifecycle_stage: dbUser?.lifecycle_stage || "lead",
          consent_status: dbUser?.consent_status || "none",
          current_dna_profile_id: dbUser?.current_dna_profile_id
        };

        setProfile(activeProfile);
        setFormName(activeProfile.name);
        setFormEmail(activeProfile.email);
        setFormPhone(activeProfile.phone);

        // 3. Fetch Travel DNA profile & dimension scores if linking profile exists
        if (activeProfile.current_dna_profile_id) {
          const { data: dnaRow } = await supabase
            .from("travel_dna_profiles")
            .select("travel_persona, budget_persona")
            .eq("id", activeProfile.current_dna_profile_id)
            .single();

          if (dnaRow) {
            const { data: scoreRows } = await supabase
              .from("dimension_scores")
              .select("score_value, dimension_tag_id")
              .eq("profile_id", activeProfile.current_dna_profile_id);

            const { data: tags } = await supabase.from("dimension_tags").select("id, dimension_name");
            const tagMap: Record<string, string> = {};
            tags?.forEach((t) => {
              tagMap[t.id] = t.dimension_name;
            });

            const scores = (scoreRows || []).map((s) => ({
              name: tagMap[s.dimension_tag_id] || "Dimension",
              score: Number(s.score_value)
            }));

            // Sort scores descending by default to show high preferences first
            scores.sort((a, b) => b.score - a.score);

            setTravelDna({
              travelPersona: dnaRow.travel_persona || "Not Classified",
              budgetPersona: dnaRow.budget_persona || "Comfort",
              scores: scores.length > 0 ? scores : []
            });
          }
        }

        // 4. Fetch User Itineraries
        const { data: itineraryRows } = await supabase
          .from("itineraries")
          .select(`
            id,
            total_price_estimate,
            package_tier,
            status,
            created_at,
            cities (
              name
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (itineraryRows) {
          const formatted: ItineraryRecord[] = itineraryRows.map((it: any) => ({
            id: it.id,
            destination: it.cities?.name || "Signature Escape",
            tier: it.package_tier || "Comfort",
            price: it.total_price_estimate || 0,
            status: it.status || "draft",
            created_at: it.created_at
          }));
          setItineraries(formatted);
        }
      }
    } catch (err: any) {
      console.error("Error loading account data:", err);
      setProfileMsg({ text: "Failed to load profile from server. Active offline fallbacks.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setFormLoading(true);
    setProfileMsg({ text: "", type: "" });

    try {
      const isDummyMode = !sessionUser || process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("127.0.0.1");

      if (isDummyMode) {
        // Simulate local profile update
        setProfile({
          ...profile,
          name: formName,
          email: formEmail,
          phone: formPhone
        });
        setEditingProfile(false);
        setProfileMsg({ text: "Profile details updated successfully (Mock Mode).", type: "success" });
      } else {
        // 1. Update Supabase Auth metadata
        const { error: authError } = await supabase.auth.updateUser({
          data: { name: formName }
        });
        if (authError) throw authError;

        // 2. Update custom users table
        const { error: dbError } = await supabase
          .from("users")
          .update({
            name: formName,
            email: formEmail,
            phone: formPhone
          })
          .eq("id", profile.id);

        if (dbError) throw dbError;

        setProfile({
          ...profile,
          name: formName,
          email: formEmail,
          phone: formPhone
        });
        setEditingProfile(false);
        setProfileMsg({ text: "Profile updated successfully.", type: "success" });
      }
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setProfileMsg({ text: err.message || "Failed to update profile.", type: "error" });
    } finally {
      setFormLoading(false);
    }
  };

  // SECURING ACCOUNT / ADDING LOGINS
  const handleLinkEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkEmail || !linkPassword) {
      setLoginMsg({ text: "Please enter both email and password.", type: "error" });
      return;
    }
    
    setFormLoading(true);
    setLoginMsg({ text: "", type: "" });

    try {
      const isDummyMode = !sessionUser || process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("127.0.0.1");

      if (isDummyMode) {
        setHasEmailLogin(true);
        setLinkEmailOpen(false);
        setLinkEmail("");
        setLinkPassword("");
        setLoginMsg({ text: "Email & Password login credentials linked successfully (Mock Mode).", type: "success" });
      } else {
        // Link email and password credentials to the active anonymous session
        const { error } = await supabase.auth.updateUser({
          email: linkEmail,
          password: linkPassword
        });

        if (error) throw error;

        // If email was updated, Supabase triggers confirmation emails
        setHasEmailLogin(true);
        setLinkEmailOpen(false);
        setLinkEmail("");
        setLinkPassword("");
        setLoginMsg({
          text: "Login method added! Please check your email inbox to verify the connection.",
          type: "success"
        });
      }
    } catch (err: any) {
      console.error("Failed linking email/password:", err);
      setLoginMsg({ text: err.message || "Failed to link email login.", type: "error" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleSendPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkPhone) {
      setLoginMsg({ text: "Please enter your phone number.", type: "error" });
      return;
    }

    setFormLoading(true);
    setLoginMsg({ text: "", type: "" });

    try {
      const isDummyMode = !sessionUser || process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("127.0.0.1");

      if (isDummyMode) {
        setPhoneOtpSent(true);
        setOtpTimer(60);
        setLoginMsg({ text: "Mock OTP Sent to phone! Use verification code '123456'.", type: "success" });
      } else {
        // Trigger phone OTP linking using updateUser
        const { error } = await supabase.auth.updateUser({
          phone: linkPhone
        });

        if (error) throw error;

        setPhoneOtpSent(true);
        setOtpTimer(60);
        setLoginMsg({ text: "An OTP has been sent via SMS/WhatsApp to link your number.", type: "success" });
      }
    } catch (err: any) {
      console.error("Failed sending phone OTP:", err);
      setLoginMsg({ text: err.message || "Failed to send verification OTP.", type: "error" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleVerifyPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOtpCode) {
      setLoginMsg({ text: "Please enter the OTP verification code.", type: "error" });
      return;
    }

    setFormLoading(true);
    setLoginMsg({ text: "", type: "" });

    try {
      const isDummyMode = !sessionUser || process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("127.0.0.1");

      if (isDummyMode) {
        if (phoneOtpCode === "123456" || phoneOtpCode.length === 6) {
          setHasPhoneLogin(true);
          setPhoneOtpSent(false);
          setLinkPhoneOpen(false);
          setLinkPhone("");
          setPhoneOtpCode("");
          setLoginMsg({ text: "Phone OTP login linked successfully (Mock Mode).", type: "success" });
          
          if (profile) {
            setProfile({ ...profile, phone: linkPhone });
            setFormPhone(linkPhone);
          }
        } else {
          throw new Error("Invalid OTP code. For testing, please enter '123456'.");
        }
      } else {
        // Verify phone linking change
        const { error } = await supabase.auth.verifyOtp({
          phone: linkPhone,
          token: phoneOtpCode,
          type: "phone_change"
        });

        if (error) throw error;

        setHasPhoneLogin(true);
        setPhoneOtpSent(false);
        setLinkPhoneOpen(false);
        setLinkPhone("");
        setPhoneOtpCode("");
        setLoginMsg({ text: "Phone and WhatsApp login active! Security configuration updated.", type: "success" });

        // Update local profile state
        if (profile) {
          setProfile({ ...profile, phone: linkPhone });
          setFormPhone(linkPhone);
          
          // Sync with database table users
          await supabase.from("users").update({ phone: linkPhone }).eq("id", profile.id);
        }
      }
    } catch (err: any) {
      console.error("OTP Verification failed:", err);
      setLoginMsg({ text: err.message || "Verification code failed. Please check the OTP.", type: "error" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await signOutUser();
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand/15 text-deep-charcoal flex flex-col justify-center items-center p-6" data-theme="consumer">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <RefreshCw className="w-10 h-10 text-marigold animate-spin" />
          <h2 className="text-xl font-display font-bold text-ink-indigo">Mapping Your Journey</h2>
          <p className="text-xs text-dusk-teal leading-relaxed">
            Synchronizing security tokens, loading travel preferences, and fetching customized package files...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand/15 text-deep-charcoal pb-16 font-sans" data-theme="consumer">
      {/* Sticky Global Topbar */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-border/20 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-marigold" />
          <span className="font-display font-bold text-lg text-ink-indigo tracking-tight">Journey OS</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/quiz">
            <Button variant="outline" className="text-xs border-border/60 text-ink-indigo hover:bg-sand/30 font-semibold py-1.5 px-3.5">
              DNA Quiz
            </Button>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-clay-rose hover:text-clay-rose/85 px-3 py-1.5 rounded-xl hover:bg-clay-rose/5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Welcome Header Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-r from-ink-indigo to-dusk-teal text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,159,40,0.12),transparent_40%)]" />
          <div className="relative z-10 flex items-center gap-4.5">
            <div className="w-16 h-16 rounded-2xl bg-marigold flex items-center justify-center text-ink-indigo font-display text-2xl font-bold shadow-md shrink-0">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : "T"}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
                Welcome back, {profile?.name || "Explorer"}!
              </h1>
              <p className="text-xs text-sand/80 flex items-center gap-2">
                <span>Status:</span>
                <span className="bg-marigold/20 text-marigold border border-marigold/30 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider">
                  {profile?.lifecycle_stage || "Lead"}
                </span>
                <span className="text-sand/55">•</span>
                <span className="italic">Traveler Account</span>
              </p>
            </div>
          </div>
          
          <div className="relative z-10 text-xs bg-white/10 backdrop-blur-md border border-white/15 px-4.5 py-3 rounded-2xl max-w-xs space-y-1">
            <p className="font-bold text-marigold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lifecycle Stage Stage Guide</span>
            </p>
            <p className="text-white/80 leading-relaxed text-[11px]">
              {profile?.lifecycle_stage === "lead" && "Take the Travel Style Quiz to unlock personalized escapes tailored to your pace & accommodation level."}
              {profile?.lifecycle_stage === "profiled" && "Style profile generated! Head to destinations page to snapshot packages matched with your scores."}
              {profile?.lifecycle_stage === "engaged" && "Custom preferences logged. Review recommendations, customize items, or chat with agents."}
              {profile?.lifecycle_stage === "itinerary_generated" && "Itinerary generated by AI pipeline. Submit checkout details to block bookings."}
              {profile?.lifecycle_stage === "booking_intent" && "Booking details sent. An agent will contact you on WhatsApp to secure flights & slots."}
              {profile?.lifecycle_stage === "booked" && "Trip booked! Check WhatsApp notifications for hotel coupons & flight tickets."}
              {(!profile?.lifecycle_stage || profile?.lifecycle_stage === "") && "Access tailored travel decoders and review saved itineraries."}
            </p>
          </div>
        </section>

        {/* Two-Column Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDE: Profiles and Auth Settings */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* CARD 1: Basic Profile Details */}
            <div className="bg-white/85 backdrop-blur-md border border-border/40 shadow-md rounded-3xl p-6 sm:p-7 space-y-6">
              <div className="flex justify-between items-center border-b border-border/10 pb-4">
                <h3 className="text-lg font-display font-bold text-ink-indigo flex items-center gap-2">
                  <User className="w-5 h-5 text-marigold" />
                  <span>Personal Profile Details</span>
                </h3>
                {!editingProfile && (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="text-xs font-bold text-marigold hover:underline"
                  >
                    Edit Details
                  </button>
                )}
              </div>

              {profileMsg.text && (
                <div
                  className={`p-3 text-xs rounded-xl flex items-start gap-2 border ${
                    profileMsg.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700"
                      : "bg-clay-rose/10 border-clay-rose/25 text-clay-rose"
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {!editingProfile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                  <div className="space-y-1">
                    <span className="block text-[10px] uppercase font-bold text-dusk-teal/70 tracking-wider">
                      Full Name
                    </span>
                    <span className="text-sm font-semibold text-ink-indigo">{profile?.name || "Not Specified"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] uppercase font-bold text-dusk-teal/70 tracking-wider">
                      Email Address
                    </span>
                    <span className="text-sm font-semibold text-ink-indigo">{profile?.email || "No Email linked"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] uppercase font-bold text-dusk-teal/70 tracking-wider">
                      WhatsApp / Phone
                    </span>
                    <span className="text-sm font-semibold text-ink-indigo">{profile?.phone || "No Phone linked"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] uppercase font-bold text-dusk-teal/70 tracking-wider">
                      Consent Scope
                    </span>
                    <span className="text-xs font-semibold text-ink-indigo">
                      {profile?.consent_status === "gate1_whatsapp" && "WhatsApp Updates Only (Gate 1)"}
                      {profile?.consent_status === "gate2_full" && "Full Contact Consent (Gate 2)"}
                      {profile?.consent_status === "none" && "No contact consent records"}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-ink-indigo mb-1 tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 bg-sand/20 border border-border/30 rounded-xl focus:outline-none focus:border-marigold text-ink-indigo font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-ink-indigo mb-1 tracking-wider">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 bg-sand/20 border border-border/30 rounded-xl focus:outline-none focus:border-marigold text-ink-indigo font-medium"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-ink-indigo mb-1 tracking-wider">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 bg-sand/20 border border-border/30 rounded-xl focus:outline-none focus:border-marigold text-ink-indigo font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingProfile(false);
                        setFormName(profile?.name || "");
                        setFormEmail(profile?.email || "");
                        setFormPhone(profile?.phone || "");
                        setProfileMsg({ text: "", type: "" });
                      }}
                      className="text-xs px-4 py-2 border-border/60 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={formLoading}
                      className="text-xs px-5 py-2 bg-marigold hover:bg-marigold/95 text-white rounded-xl font-semibold shadow-sm"
                    >
                      {formLoading ? "Saving..." : "Save Updates"}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* CARD 2: Security & Login Methods ("logins account add") */}
            <div className="bg-white/85 backdrop-blur-md border border-border/40 shadow-md rounded-3xl p-6 sm:p-7 space-y-6">
              <div className="border-b border-border/10 pb-4">
                <h3 className="text-lg font-display font-bold text-ink-indigo flex items-center gap-2">
                  <Lock className="w-5 h-5 text-marigold" />
                  <span>Linked Logins & Security</span>
                </h3>
                <p className="text-[11px] text-dusk-teal mt-1">
                  Secure your account by linking multiple authentication systems. You can access your travel files with any active channel.
                </p>
              </div>

              {loginMsg.text && (
                <div
                  className={`p-3 text-xs rounded-xl flex items-start gap-2 border ${
                    loginMsg.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700"
                      : "bg-clay-rose/10 border-clay-rose/25 text-clay-rose"
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginMsg.text}</span>
                </div>
              )}

              <div className="space-y-4">
                
                {/* Method 1: Email and Password */}
                <div className="border border-border/30 rounded-2xl p-4 bg-sand/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-ink-indigo/5 flex items-center justify-center text-ink-indigo shrink-0">
                        <Mail className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-ink-indigo">Email & Password Credentials</h4>
                        <p className="text-[10px] text-dusk-teal">
                          {hasEmailLogin ? "Linked and secured" : "Not connected to account"}
                        </p>
                      </div>
                    </div>
                    {hasEmailLogin ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        <CheckCircle className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setLinkEmailOpen(!linkEmailOpen);
                          setLinkPhoneOpen(false);
                          setLoginMsg({ text: "", type: "" });
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold text-marigold border border-marigold/30 hover:border-marigold px-2.5 py-1 rounded-xl transition bg-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Link Login</span>
                      </button>
                    )}
                  </div>

                  {/* Expanded Form to Link/Add Email Login */}
                  {linkEmailOpen && !hasEmailLogin && (
                    <form onSubmit={handleLinkEmailPassword} className="pt-3 border-t border-border/10 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-0.5 tracking-wider">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={linkEmail}
                            onChange={(e) => setLinkEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full text-xs px-3 py-2 bg-white border border-border/30 rounded-xl focus:outline-none focus:border-marigold"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-0.5 tracking-wider">
                            Create Password
                          </label>
                          <input
                            type="password"
                            value={linkPassword}
                            onChange={(e) => setLinkPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                            className="w-full text-xs px-3 py-2 bg-white border border-border/30 rounded-xl focus:outline-none focus:border-marigold"
                            minLength={8}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setLinkEmailOpen(false)}
                          className="text-[11px] h-8 px-3 rounded-lg text-dusk-teal"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={formLoading}
                          className="text-[11px] h-8 px-4 bg-marigold text-white rounded-lg font-semibold shadow-sm"
                        >
                          {formLoading ? "Linking..." : "Link Email"}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* If already linked, display update password capabilities */}
                  {hasEmailLogin && (
                    <div className="pt-3 border-t border-border/10">
                      <details className="group">
                        <summary className="text-[11px] font-bold text-dusk-teal hover:text-ink-indigo cursor-pointer list-none flex items-center justify-between">
                          <span>Modify Password / Change credentials</span>
                          <span className="text-[10px] font-semibold text-marigold group-open:hidden">Expand Setup</span>
                          <span className="text-[10px] font-semibold text-marigold hidden group-open:inline">Collapse Setup</span>
                        </summary>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setFormLoading(true);
                            setLoginMsg({ text: "", type: "" });
                            try {
                              const isDummy = !sessionUser || process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("127.0.0.1");
                              if (isDummy) {
                                setLoginMsg({ text: "Password updated successfully (Mock Mode).", type: "success" });
                              } else {
                                const { error } = await supabase.auth.updateUser({
                                  password: linkPassword
                                });
                                if (error) throw error;
                                setLoginMsg({ text: "Password updated successfully.", type: "success" });
                              }
                              setLinkPassword("");
                            } catch (err: any) {
                              setLoginMsg({ text: err.message || "Failed to update password.", type: "error" });
                            } finally {
                              setFormLoading(false);
                            }
                          }}
                          className="mt-3.5 space-y-3 pt-2"
                        >
                          <div className="max-w-xs">
                            <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-0.5 tracking-wider">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={linkPassword}
                              onChange={(e) => setLinkPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full text-xs px-3 py-2 bg-white border border-border/30 rounded-xl focus:outline-none focus:border-marigold"
                              minLength={8}
                              required
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={formLoading}
                            className="text-[11px] h-8 px-4 bg-marigold text-white rounded-lg font-semibold"
                          >
                            Update Password
                          </Button>
                        </form>
                      </details>
                    </div>
                  )}
                </div>

                {/* Method 2: Phone OTP (WhatsApp) */}
                <div className="border border-border/30 rounded-2xl p-4 bg-sand/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-ink-indigo/5 flex items-center justify-center text-ink-indigo shrink-0">
                        <Smartphone className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-ink-indigo">WhatsApp & Phone OTP Login</h4>
                        <p className="text-[10px] text-dusk-teal">
                          {hasPhoneLogin ? "Linked and secured" : "Not connected to account"}
                        </p>
                      </div>
                    </div>
                    {hasPhoneLogin ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        <CheckCircle className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setLinkPhoneOpen(!linkPhoneOpen);
                          setLinkEmailOpen(false);
                          setPhoneOtpSent(false);
                          setLoginMsg({ text: "", type: "" });
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold text-marigold border border-marigold/30 hover:border-marigold px-2.5 py-1 rounded-xl transition bg-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Link Login</span>
                      </button>
                    )}
                  </div>

                  {/* Expanded Form to Link/Add Phone OTP Login */}
                  {linkPhoneOpen && !hasPhoneLogin && (
                    <div className="pt-3 border-t border-border/10">
                      {!phoneOtpSent ? (
                        <form onSubmit={handleSendPhoneOTP} className="space-y-3">
                          <div className="max-w-sm">
                            <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-0.5 tracking-wider">
                              WhatsApp / Phone Number
                            </label>
                            <input
                              type="tel"
                              value={linkPhone}
                              onChange={(e) => setLinkPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className="w-full text-xs px-3 py-2 bg-white border border-border/30 rounded-xl focus:outline-none focus:border-marigold"
                              required
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setLinkPhoneOpen(false)}
                              className="text-[11px] h-8 px-3 rounded-lg text-dusk-teal"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={formLoading}
                              className="text-[11px] h-8 px-4 bg-marigold text-white rounded-lg font-semibold shadow-sm"
                            >
                              {formLoading ? "Sending..." : "Send OTP"}
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={handleVerifyPhoneOTP} className="space-y-3">
                          <div className="max-w-xs">
                            <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-0.5 tracking-wider">
                              Enter 6-Digit OTP Code
                            </label>
                            <input
                              type="text"
                              value={phoneOtpCode}
                              onChange={(e) => setPhoneOtpCode(e.target.value)}
                              placeholder="123456"
                              className="w-full text-xs px-3 py-2 bg-white border border-border/30 rounded-xl text-center tracking-widest font-mono font-bold focus:outline-none focus:border-marigold"
                              maxLength={6}
                              required
                            />
                            {otpTimer > 0 ? (
                              <span className="block text-[9px] text-dusk-teal mt-1 font-mono">
                                Resend code in {otpTimer}s
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSendPhoneOTP}
                                className="block text-[9px] text-marigold hover:underline mt-1 font-bold"
                              >
                                Resend OTP Code
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setPhoneOtpSent(false)}
                              className="text-[11px] h-8 px-3 rounded-lg border-border"
                            >
                              Back
                            </Button>
                            <Button
                              type="submit"
                              disabled={formLoading}
                              className="text-[11px] h-8 px-4 bg-marigold text-white rounded-lg font-semibold"
                            >
                              {formLoading ? "Verifying..." : "Verify OTP"}
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* If phone is linked, display change phone controls */}
                  {hasPhoneLogin && (
                    <div className="pt-3 border-t border-border/10">
                      <details className="group">
                        <summary className="text-[11px] font-bold text-dusk-teal hover:text-ink-indigo cursor-pointer list-none flex items-center justify-between">
                          <span>Modify phone number</span>
                          <span className="text-[10px] font-semibold text-marigold group-open:hidden">Expand Setup</span>
                          <span className="text-[10px] font-semibold text-marigold hidden group-open:inline">Collapse Setup</span>
                        </summary>
                        <div className="mt-3.5 space-y-4 pt-2">
                          {!phoneOtpSent ? (
                            <form onSubmit={handleSendPhoneOTP} className="space-y-3">
                              <div className="max-w-xs">
                                <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-0.5 tracking-wider">
                                  New Phone Number
                                </label>
                                <input
                                  type="tel"
                                  value={linkPhone}
                                  onChange={(e) => setLinkPhone(e.target.value)}
                                  placeholder="+91 98765 43210"
                                  className="w-full text-xs px-3 py-2 bg-white border border-border/30 rounded-xl focus:outline-none focus:border-marigold"
                                  required
                                />
                              </div>
                              <Button
                                type="submit"
                                disabled={formLoading}
                                className="text-[11px] h-8 px-4 bg-marigold text-white rounded-lg font-semibold shadow-sm"
                              >
                                Send Link OTP
                              </Button>
                            </form>
                          ) : (
                            <form onSubmit={handleVerifyPhoneOTP} className="space-y-3">
                              <div className="max-w-xs">
                                <label className="block text-[9px] uppercase font-bold text-ink-indigo mb-0.5 tracking-wider">
                                  Verify OTP Code
                                </label>
                                <input
                                  type="text"
                                  value={phoneOtpCode}
                                  onChange={(e) => setPhoneOtpCode(e.target.value)}
                                  placeholder="123456"
                                  className="w-full text-xs px-3 py-2 bg-white border border-border/30 rounded-xl text-center tracking-widest font-mono font-bold focus:outline-none focus:border-marigold"
                                  maxLength={6}
                                  required
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setPhoneOtpSent(false)}
                                  className="text-[11px] h-8 px-3 rounded-lg border-border"
                                >
                                  Back
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={formLoading}
                                  className="text-[11px] h-8 px-4 bg-marigold text-white rounded-lg font-semibold"
                                >
                                  {formLoading ? "Verifying..." : "Verify OTP"}
                                </Button>
                              </div>
                            </form>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Travel DNA scores and Itineraries list */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* CARD 3: Travel DNA Scores Visualizer */}
            <div className="bg-white/85 backdrop-blur-md border border-border/40 shadow-md rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-border/10 pb-4">
                <h3 className="text-base font-display font-bold text-ink-indigo flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-marigold" />
                  <span>My Travel Style Profile</span>
                </h3>
                {travelDna && (
                  <Link href="/quiz">
                    <button className="text-[11px] font-bold text-marigold hover:underline">
                      Recalibrate Style
                    </button>
                  </Link>
                )}
              </div>

              {travelDna ? (
                <div className="space-y-5">
                  <div className="bg-sand/30 border border-border/20 rounded-2xl p-4 space-y-1.5">
                    <span className="block text-[10px] uppercase font-bold text-dusk-teal/70 tracking-wider">
                      Assigned Budget Classification
                    </span>
                    <h4 className="text-base font-display font-bold text-marigold">
                      {travelDna.budgetPersona} Option
                    </h4>
                    <p className="text-[11px] text-ink-indigo/80 leading-relaxed">
                      Matches destinations with {travelDna.budgetPersona === "Flexible" ? "premium accommodations & high-comfort itineraries" : "value-optimized cost indexes & mid-tier hotels"} based on your preferences.
                    </p>
                  </div>

                  {/* Dimensions Scores Bars */}
                  <div className="space-y-3">
                    <span className="block text-[10px] uppercase font-bold text-dusk-teal/70 tracking-wider">
                      Sub-Dimensional Style Scores
                    </span>
                    <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                      {travelDna.scores.map((item) => (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold text-ink-indigo">
                            <span>{item.name}</span>
                            <span className="font-mono text-[10px] text-dusk-teal">{item.score}% Match</span>
                          </div>
                          <div className="h-2 w-full bg-sand/60 rounded-full overflow-hidden border border-border/10">
                            <div
                              className="h-full bg-gradient-to-r from-marigold/70 to-marigold rounded-full transition-all duration-500"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4 bg-sand/15 border border-dashed border-border/40 rounded-2xl p-4">
                  <Compass className="w-10 h-10 text-dusk-teal/35 mx-auto" />
                  <div className="space-y-1 max-w-xs mx-auto">
                    <h4 className="text-xs font-bold text-ink-indigo">No Travel Style profile found</h4>
                    <p className="text-[10px] text-dusk-teal leading-relaxed">
                      Take our 60-second travel decoder quiz to analyze your unique sub-dimensional preferences.
                    </p>
                  </div>
                  <Link href="/quiz" className="inline-block">
                    <Button className="text-xs py-2 px-4.5 bg-marigold text-ink-indigo font-bold rounded-xl border border-marigold/10">
                      Start Decoding Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* CARD 4: User Itinerary History list */}
            <div className="bg-white/85 backdrop-blur-md border border-border/40 shadow-md rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-border/10 pb-4">
                <h3 className="text-base font-display font-bold text-ink-indigo flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-marigold" />
                  <span>My Saved Escape Plans</span>
                </h3>
                <span className="text-[10px] font-mono font-bold text-dusk-teal/60">
                  {itineraries.length} Generated
                </span>
              </div>

              {itineraries.length > 0 ? (
                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                  {itineraries.map((it) => (
                    <div
                      key={it.id}
                      className="border border-border/30 rounded-2xl p-4 bg-sand/10 hover:bg-sand/20 transition flex justify-between items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-marigold" />
                          <h4 className="text-xs font-bold text-ink-indigo leading-none">{it.destination}</h4>
                        </div>
                        <p className="text-[10px] text-dusk-teal">
                          <span>{it.tier} Tier</span>
                          <span className="mx-1.5 opacity-40">•</span>
                          <span className="font-mono text-ink-indigo/80">₹{it.price.toLocaleString("en-IN")}</span>
                        </p>
                        <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-white text-ink-indigo border border-border/30">
                          {it.status}
                        </span>
                      </div>
                      <Link href={`/itinerary/${it.id}`} className="shrink-0">
                        <button className="w-8 h-8 rounded-xl bg-white border border-border/35 flex items-center justify-center text-marigold hover:bg-marigold hover:text-white transition shadow-sm">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-4 bg-sand/15 border border-dashed border-border/40 rounded-2xl p-4">
                  <Calendar className="w-10 h-10 text-dusk-teal/35 mx-auto" />
                  <div className="space-y-1 max-w-xs mx-auto">
                    <h4 className="text-xs font-bold text-ink-indigo">No escape plans created</h4>
                    <p className="text-[10px] text-dusk-teal leading-relaxed">
                      Select a featured destination to snapshot and structure custom items.
                    </p>
                  </div>
                  <Link href="/#destinations" className="inline-block">
                    <Button variant="outline" className="text-xs py-2 px-4.5 border-border rounded-xl">
                      Browse Destinations
                    </Button>
                  </Link>
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
