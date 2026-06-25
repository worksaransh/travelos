import { supabase, ensureUserAndProfile } from "./supabase";

/**
 * Merges anonymous profile data into a newly authenticated user account.
 * This runs the security definer function 'merge_anonymous_profile' in the database,
 * and updates local storage keys.
 * 
 * @param anonId The anonymous user's ID (stored in localStorage)
 * @param authId The new authenticated user's ID
 */
export async function mergeAnonymousProfile(anonId: string, authId: string): Promise<boolean> {
  if (!anonId || !authId || anonId === authId) {
    return false;
  }

  try {
    // 1. Ensure the new authenticated user exists in the public.users table
    await ensureUserAndProfile(authId);

    // 2. Call the database function to re-point all anonymous data to the new user ID
    const { error } = await supabase.rpc("merge_anonymous_profile", {
      p_anon_id: anonId,
      p_auth_id: authId
    });

    if (error) {
      console.error("Database error during anonymous profile merge:", error.message);
      return false;
    }

    // 3. Update local storage to point to the new authenticated user ID
    if (typeof window !== "undefined") {
      localStorage.setItem("journey_os_anon_user_id", authId);
      
      // Fetch the updated profile ID to ensure local storage sync
      const { data: userData } = await supabase
        .from("users")
        .select("current_dna_profile_id")
        .eq("id", authId)
        .single();
      
      if (userData?.current_dna_profile_id) {
        localStorage.setItem("journey_os_profile_id", userData.current_dna_profile_id);
      }
    }

    return true;
  } catch (err) {
    console.error("Failed to merge anonymous profile:", err);
    return false;
  }
}

/**
 * Gets the current active user session from Supabase.
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (err) {
    console.error("Error getting active session:", err);
    return null;
  }
}

/**
 * Sign out helper that clears the cached session details.
 */
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("journey_os_anon_user_id");
      localStorage.removeItem("journey_os_profile_id");
      localStorage.removeItem("journey_os_mock_responses");
    }
  } catch (err) {
    console.error("Error signing out:", err);
  }
}
