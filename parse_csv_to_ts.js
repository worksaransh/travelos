const fs = require('fs');
const path = require('path');

const QUESTION_BANK_CSV = path.join(__dirname, 'extra data/journeyos_question_bank_v2.csv');
const RELATED_DEST_CSV = path.join(__dirname, 'extra data/journeyos_related_destinations.csv');
const OUTPUT_TS = path.join(__dirname, 'lib/dataStatic.ts');

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\r\n').join('\n').split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row = {};
    let currentField = '';
    let inQuotes = false;
    let fieldIdx = 0;

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row[headers[fieldIdx]] = currentField.trim().replace(/^"|"$/g, '').replace(/""/g, '"');
        currentField = '';
        fieldIdx++;
      } else {
        currentField += char;
      }
    }
    row[headers[fieldIdx]] = currentField.trim().replace(/^"|"$/g, '').replace(/""/g, '"');
    rows.push(row);
  }
  return rows;
}

function run() {
  console.log("Parsing CSVs...");
  const questions = parseCSV(QUESTION_BANK_CSV);
  const related = parseCSV(RELATED_DEST_CSV);

  // Parse questions
  const formattedQuestions = questions.map(q => ({
    question_id: q.question_id,
    category: q.category,
    subcategory: q.subcategory || null,
    question_text_conversational: q.question_text_conversational || q.question_text || "",
    type: q.type,
    conditional_logic: q.conditional_logic || null,
    weight: parseFloat(q.weight || '1.0'),
    impact_on_recommendations: q.impact_on_recommendations || null
  }));

  // Parse related destinations
  const formattedRelated = related.map(r => ({
    city_id: r.city_id,
    city_name: r.city_name,
    related_city_id: r.related_city_id,
    related_city_name: r.related_city_name,
    similarity_score: parseFloat(r.similarity_score || '0')
  }));

  // Hardcode mood categories fallback
  const moodCategories = [
    { mood_name: "Romantic Escapes", filter_rule_json: { top_dims: ["Relaxation", "Luxury"], tag_match: "Romantic" } },
    { mood_name: "Beach Holidays", filter_rule_json: { categories: ["Beaches", "Water Sports"] } },
    { mood_name: "Adventure", filter_rule_json: { top_dims: ["Adventure"], categories: ["Trekking", "Theme Parks"] } },
    { mood_name: "Family", filter_rule_json: { top_dims: ["Family Experiences", "Relaxation"] } },
    { mood_name: "Luxury", filter_rule_json: { top_dims: ["Luxury"], pricing_bands: ["high", "premium"] } },
    { mood_name: "Solo Explorer", filter_rule_json: { top_dims: ["Local Experiences", "Culture"] } }
  ];

  // Hardcode category-based templates for questions
  const destQuestionTemplates = [
    { category: "Theme Parks", template_question_text: "Interested in visiting {SignatureExperienceName}?", applies_to_experience_category: "Theme Parks" },
    { category: "Beaches", template_question_text: "Would chilling at {SignatureExperienceName} be part of your ideal day?", applies_to_experience_category: "Beaches" },
    { category: "Luxury Hotels", template_question_text: "Could you see yourself staying somewhere like {SignatureExperienceName}?", applies_to_experience_category: "Luxury Hotels" },
    { category: "Culture", template_question_text: "Does exploring {SignatureExperienceName} sound like your kind of experience?", applies_to_experience_category: "Culture" },
    { category: "Nightlife", template_question_text: "Up for a night out at {SignatureExperienceName}?", applies_to_experience_category: "Nightlife" },
    { category: "Local Markets", template_question_text: "Interested in exploring the local vibe at {SignatureExperienceName}?", applies_to_experience_category: "Local Markets" }
  ];

  const code = `// Automatically generated static data fallbacks from CSV inputs.
// Do not edit directly, use parse_csv_to_ts.js instead.

export interface QuestionBankItem {
  question_id: string;
  category: string;
  subcategory: string | null;
  question_text_conversational: string;
  type: string;
  conditional_logic: string | null;
  weight: number;
  impact_on_recommendations: string | null;
}

export interface RelatedDestinationItem {
  city_id: string;
  city_name: string;
  related_city_id: string;
  related_city_name: string;
  similarity_score: number;
}

export interface MoodCategoryItem {
  mood_name: string;
  filter_rule_json: any;
}

export interface DestQuestionTemplateItem {
  category: string;
  template_question_text: string;
  applies_to_experience_category: string;
}

export const QUESTION_BANK_STATIC: QuestionBankItem[] = ${JSON.stringify(formattedQuestions, null, 2)};

export const RELATED_DESTINATIONS_STATIC: RelatedDestinationItem[] = ${JSON.stringify(formattedRelated, null, 2)};

export const MOOD_CATEGORIES_STATIC: MoodCategoryItem[] = ${JSON.stringify(moodCategories, null, 2)};

export const DEST_QUESTION_TEMPLATES_STATIC: DestQuestionTemplateItem[] = ${JSON.stringify(destQuestionTemplates, null, 2)};
`;

  fs.writeFileSync(OUTPUT_TS, code, 'utf-8');
  console.log("Static TS file written successfully!");
}

run();
