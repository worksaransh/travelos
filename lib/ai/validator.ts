import { z } from "zod";
import { supabase } from "../supabase";

// Define the schema for structured itinerary generation
export const ItinerarySchema = z.object({
  itineraryName: z.string(),
  destinationCity: z.string(),
  packageTier: z.enum(["comfort", "premium", "signature"]),
  estimatedCost: z.number(),
  days: z.array(
    z.object({
      day: z.number(),
      experienceIds: z.array(z.string()),
      highlights: z.string()
    })
  )
});

export interface ValidationReport {
  isValid: boolean;
  confidenceScore: number; // 0 - 100
  humanReviewRequired: boolean;
  autoReject: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates generated AI itineraries against the Supabase database and business constraints.
 */
export async function validateAIItinerary(responseJsonString: string): Promise<ValidationReport> {
  const report: ValidationReport = {
    isValid: true,
    confidenceScore: 100,
    humanReviewRequired: false,
    autoReject: false,
    errors: [],
    warnings: []
  };

  let parsedData: any = null;

  // 1. Syntactic / Schema Validation
  try {
    const rawJson = JSON.parse(responseJsonString);
    parsedData = ItinerarySchema.parse(rawJson);
  } catch (err: any) {
    report.isValid = false;
    report.autoReject = true;
    report.confidenceScore = 0;
    report.errors.push(`JSON schema validation failed: ${err.message || err}`);
    return report;
  }

  const { destinationCity, days } = parsedData;

  // 2. Destination Validation
  try {
    const { data: cityData, error: cityError } = await supabase
      .from("cities")
      .select("id, country_id, countries(name, visa_policy_default, visa_note)")
      .ilike("name", destinationCity)
      .single();

    if (cityError || !cityData) {
      report.confidenceScore -= 30;
      report.errors.push(`Destination city '${destinationCity}' does not exist in the database.`);
      report.humanReviewRequired = true;
    } else {
      // 3. Visa Policy Verification & Unsafe Claims check
      const country = cityData.countries as any;
      const visaNote = (country?.visa_note || "").toLowerCase();
      const responseLower = responseJsonString.toLowerCase();

      // Check if response claims "no visa" or "free entry" when it's e-visa or visa required
      if (
        (visaNote.includes("e-visa") || visaNote.includes("required")) &&
        (responseLower.includes("no visa needed") || responseLower.includes("visa-free") || responseLower.includes("without a visa"))
      ) {
        report.confidenceScore -= 40;
        report.autoReject = true;
        report.errors.push(`Visa claim contradiction: AI claimed visa-free but database requires visa/e-visa for ${country.name}.`);
      }
    }
  } catch (err) {
    console.warn("Database lookup for destination validation failed:", err);
  }

  // 4. Experiences Validation
  const allExperienceIds: string[] = [];
  days.forEach((day: any) => {
    if (Array.isArray(day.experienceIds)) {
      allExperienceIds.push(...day.experienceIds);
    }
  });

  if (allExperienceIds.length === 0) {
    report.confidenceScore -= 20;
    report.errors.push("Itinerary does not contain any experience associations.");
    report.humanReviewRequired = true;
  } else {
    try {
      const { data: validExperiences, error: expError } = await supabase
        .from("experiences")
        .select("id, name, supplier_bookable_flag")
        .in("id", allExperienceIds);

      if (expError) throw expError;

      const validIds = new Set(validExperiences?.map(e => e.id) || []);
      const unbookableIds = new Set(
        validExperiences?.filter(e => !e.supplier_bookable_flag).map(e => e.id) || []
      );

      allExperienceIds.forEach(id => {
        if (!validIds.has(id)) {
          report.confidenceScore -= 15;
          report.errors.push(`Experience ID '${id}' does not exist in the catalog (Hallucination).`);
          report.humanReviewRequired = true;
        } else if (unbookableIds.has(id)) {
          report.confidenceScore -= 5;
          report.warnings.push(`Experience ID '${id}' exists but is not marked supplier bookable.`);
          report.humanReviewRequired = true;
        }
      });
    } catch (err) {
      console.warn("Database experiences lookup failed:", err);
    }
  }

  // 5. Unsafe / Exaggerated Claims Check
  const unsafeKeywords = [
    "100% visa guarantee",
    "guaranteed visa",
    "free luxury upgrade",
    "instant refund",
    "no charge ever",
    "completely free of cost"
  ];

  unsafeKeywords.forEach(keyword => {
    if (responseJsonString.toLowerCase().includes(keyword)) {
      report.confidenceScore -= 25;
      report.errors.push(`Unsafe claim detected: Contains prohibited promotional promise: "${keyword}".`);
      report.humanReviewRequired = true;
    }
  });

  // 6. Final Score Classification thresholds
  if (report.confidenceScore < 50) {
    report.autoReject = true;
    report.isValid = false;
  } else if (report.confidenceScore < 85) {
    report.humanReviewRequired = true;
  }

  return report;
}
