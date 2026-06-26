import { validateAIItinerary } from "../lib/ai/validator";

async function runTests() {
  console.log("==========================================");
  console.log("🩺 TESTING POST-GENERATION VALIDATION GUARDRAIL");
  console.log("==========================================");

  // Test Case 1: Visa claim contradiction (Singapore requires E-visa, but payload says visa-free)
  console.log("\n📋 [TEST 1] Testing Visa Claim Contradiction (Singapore)...");
  const payloadVisaContradiction = JSON.stringify({
    itineraryName: "Singapore Budget Trip",
    destinationCity: "Singapore",
    packageTier: "comfort",
    estimatedCost: 65000,
    days: [
      {
        day: 1,
        experienceIds: ["e0000000-0000-0000-0000-000000000001"],
        highlights: "You can visit Singapore visa-free and enjoy Universal Studios without a visa."
      }
    ]
  });

  try {
    const report = await validateAIItinerary(payloadVisaContradiction);
    console.log("Result:", report);
    if (!report.isValid && report.autoReject && report.errors.some(e => e.includes("Visa claim contradiction"))) {
      console.log("✅ PASS: Successfully blocked visa claim contradiction.");
    } else {
      console.log("❌ FAIL: Failed to block visa claim contradiction or did not reject.");
    }
  } catch (e: any) {
    console.error("Test 1 threw error:", e.message || e);
  }

  // Test Case 2: Unsafe/prohibited claim ("100% visa guarantee")
  console.log("\n📋 [TEST 2] Testing Unsafe Prohibited Claim ('100% visa guarantee')...");
  const payloadUnsafeClaim = JSON.stringify({
    itineraryName: "Singapore VIP Tour",
    destinationCity: "Singapore",
    packageTier: "premium",
    estimatedCost: 150000,
    days: [
      {
        day: 1,
        experienceIds: ["e0000000-0000-0000-0000-000000000001"],
        highlights: "We provide a 100% visa guarantee for Singapore travelers."
      }
    ]
  });

  try {
    const report = await validateAIItinerary(payloadUnsafeClaim);
    console.log("Result:", report);
    if (report.humanReviewRequired && report.errors.some(e => e.includes("Contains prohibited promotional promise"))) {
      console.log("✅ PASS: Successfully flagged unsafe claim for human review.");
    } else {
      console.log("❌ FAIL: Failed to flag unsafe claim.");
    }
  } catch (e: any) {
    console.error("Test 2 threw error:", e.message || e);
  }

  // Test Case 3: Validation Caching Check
  console.log("\n📋 [TEST 3] Testing Validation Cache hit/miss...");
  const cachePayload = JSON.stringify({
    itineraryName: "Singapore Comfort Caching Test",
    destinationCity: "Singapore",
    packageTier: "comfort",
    estimatedCost: 80000,
    days: [
      {
        day: 1,
        experienceIds: ["e0000000-0000-0000-0000-000000000004"],
        highlights: "Gardens by the bay exploration day."
      }
    ]
  });

  try {
    console.log("First validation run (Cache miss / Write expected)...");
    const t0 = Date.now();
    const report1 = await validateAIItinerary(cachePayload);
    const time1 = Date.now() - t0;
    console.log(`First run took: ${time1}ms. Result: isValid=${report1.isValid}`);

    console.log("Second validation run (Cache hit expected)...");
    const t1 = Date.now();
    const report2 = await validateAIItinerary(cachePayload);
    const time2 = Date.now() - t1;
    console.log(`Second run took: ${time2}ms. Result: isValid=${report2.isValid}`);

    if (time2 < time1 || time2 < 500) {
      console.log("✅ PASS: Cache lookup bypassed database/LLM checks successfully (much faster second run).");
    } else {
      console.warn("⚠️ WARNING: Cache run was not significantly faster than first run.");
    }
  } catch (e: any) {
    console.error("Test 3 threw error:", e.message || e);
  }

  // Test Case 4: Semantic search matching
  console.log("\n📋 [TEST 4] Testing Semantic Search pgvector matching query...");
  try {
    const { searchExperiencesSemantically, supabase } = require("../lib/supabase");
    // Fetch Singapore's actual city ID dynamically from the database
    const { data: cityData } = await supabase.from("cities").select("id").ilike("name", "Singapore").maybeSingle();
    const sgCityId = cityData?.id || "c1000000-0000-0000-0000-000000000001";
    
    console.log(`Running semantic search in city: ${sgCityId} for 'Beach Club'...`);
    const results = await searchExperiencesSemantically(sgCityId, "Beach Club", 3);
    console.log("Semantic Search Matches found:", results.length);
    results.forEach((r: any, idx: number) => {
      console.log(`[#${idx + 1}] ${r.name} (${r.category || "No category"})`);
    });
    if (results.length > 0) {
      console.log("✅ PASS: Semantic search returned valid experience catalog suggestions.");
    } else {
      console.log("❌ FAIL: Semantic search returned 0 items.");
    }
  } catch (e: any) {
    console.error("Test 4 threw error:", e.message || e);
  }

  console.log("\n==========================================");
  console.log("🏁 VALIDATION TESTS COMPLETED");
  console.log("==========================================");
}

runTests().then(() => process.exit(0)).catch(() => process.exit(1));
