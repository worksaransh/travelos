const { validateAIItinerary } = require("../lib/ai/validator");

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
  } catch (e) {
    console.error("Test 1 threw error:", e);
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
  } catch (e) {
    console.error("Test 2 threw error:", e);
  }

  console.log("\n==========================================");
  console.log("🏁 VALIDATION TESTS COMPLETED");
  console.log("==========================================");
}

runTests();
