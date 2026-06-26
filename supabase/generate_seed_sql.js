const fs = require('fs');
const path = require('path');

const QUESTION_BANK_CSV = path.join(__dirname, '../extra data/journeyos_question_bank_v2.csv');
const RELATED_DEST_CSV = path.join(__dirname, '../extra data/journeyos_related_destinations.csv');
const OUTPUT_SQL = path.join(__dirname, 'seed_redesign_data.sql');

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

// SQL escape function for strings
function esc(val) {
  if (val === undefined || val === null || val === '') return 'NULL';
  return `'${val.replace(/'/g, "''")}'`;
}

function run() {
  console.log("Generating seed SQL from CSVs...");
  const questions = parseCSV(QUESTION_BANK_CSV);
  const related = parseCSV(RELATED_DEST_CSV);

  let sql = `-- Automatically generated seed data SQL from CSV inputs.\n`;
  sql += `BEGIN;\n\n`;

  // 1. Seed Question Bank
  sql += `-- 1. Seeding question_bank\n`;
  questions.forEach(q => {
    const question_id = q.question_id;
    const category = q.category;
    const subcategory = q.subcategory || '';
    const question_text_conversational = q.question_text_conversational || q.question_text || "";
    const type = q.type;
    const conditional_logic = q.conditional_logic || '';
    const weight = parseFloat(q.weight || '1.0');
    const impact_on_recommendations = q.impact_on_recommendations || '';

    sql += `INSERT INTO question_bank (question_id, category, subcategory, question_text_conversational, type, conditional_logic, weight, impact_on_recommendations) ` +
           `VALUES (${esc(question_id)}, ${esc(category)}, ${esc(subcategory)}, ${esc(question_text_conversational)}, ${esc(type)}, ${esc(conditional_logic)}, ${weight}, ${esc(impact_on_recommendations)}) ` +
           `ON CONFLICT (question_id) DO UPDATE SET ` +
           `category = EXCLUDED.category, ` +
           `subcategory = EXCLUDED.subcategory, ` +
           `question_text_conversational = EXCLUDED.question_text_conversational, ` +
           `type = EXCLUDED.type, ` +
           `conditional_logic = EXCLUDED.conditional_logic, ` +
           `weight = EXCLUDED.weight, ` +
           `impact_on_recommendations = EXCLUDED.impact_on_recommendations;\n`;
  });

  sql += `\n`;

  // 2. Seed Related Destinations
  sql += `-- 2. Seeding related_destinations\n`;
  related.forEach(r => {
    const city_id = r.city_id;
    const related_city_id = r.related_city_id;
    const similarity_score = parseFloat(r.similarity_score || '0');

    sql += `INSERT INTO related_destinations (city_id, related_city_id, similarity_score) ` +
           `VALUES (${esc(city_id)}::uuid, ${esc(related_city_id)}::uuid, ${similarity_score}) ` +
           `ON CONFLICT (city_id, related_city_id) DO UPDATE SET ` +
           `similarity_score = EXCLUDED.similarity_score;\n`;
  });

  sql += `\n`;

  // 3. Seed Mood Categories
  sql += `-- 3. Seeding mood_categories\n`;
  const moodCategories = [
    { mood_name: "Romantic Escapes", filter_rule_json: { top_dims: ["Relaxation", "Luxury"], tag_match: "Romantic" } },
    { mood_name: "Beach Holidays", filter_rule_json: { categories: ["Beaches", "Water Sports"] } },
    { mood_name: "Adventure", filter_rule_json: { top_dims: ["Adventure"], categories: ["Trekking", "Theme Parks"] } },
    { mood_name: "Family", filter_rule_json: { top_dims: ["Family Experiences", "Relaxation"] } },
    { mood_name: "Luxury", filter_rule_json: { top_dims: ["Luxury"], pricing_bands: ["high", "premium"] } },
    { mood_name: "Solo Explorer", filter_rule_json: { top_dims: ["Local Experiences", "Culture"] } }
  ];

  moodCategories.forEach(m => {
    sql += `INSERT INTO mood_categories (mood_name, filter_rule_json) ` +
           `VALUES (${esc(m.mood_name)}, ${esc(JSON.stringify(m.filter_rule_json))}::jsonb) ` +
           `ON CONFLICT (mood_name) DO UPDATE SET ` +
           `filter_rule_json = EXCLUDED.filter_rule_json;\n`;
  });

  sql += `\n`;

  // 4. Seed Destination Question Templates
  sql += `-- 4. Seeding destination_question_templates\n`;
  const destQuestionTemplates = [
    { category: "Theme Parks", template_question_text: "Interested in visiting {SignatureExperienceName}?", applies_to_experience_category: "Theme Parks" },
    { category: "Beaches", template_question_text: "Would chilling at {SignatureExperienceName} be part of your ideal day?", applies_to_experience_category: "Beaches" },
    { category: "Luxury Hotels", template_question_text: "Could you see yourself staying somewhere like {SignatureExperienceName}?", applies_to_experience_category: "Luxury Hotels" },
    { category: "Culture", template_question_text: "Does exploring {SignatureExperienceName} sound like your kind of experience?", applies_to_experience_category: "Culture" },
    { category: "Nightlife", template_question_text: "Up for a night out at {SignatureExperienceName}?", applies_to_experience_category: "Nightlife" },
    { category: "Local Markets", template_question_text: "Interested in exploring the local vibe at {SignatureExperienceName}?", applies_to_experience_category: "Local Markets" }
  ];

  // We delete first or upsert based on matching category & applies_to_experience_category. Since there's no unique constraint on (category, applies_to_experience_category), let's clear them first or insert them.
  sql += `DELETE FROM destination_question_templates;\n`;
  destQuestionTemplates.forEach(t => {
    sql += `INSERT INTO destination_question_templates (category, template_question_text, applies_to_experience_category) ` +
           `VALUES (${esc(t.category)}, ${esc(t.template_question_text)}, ${esc(t.applies_to_experience_category)});\n`;
  });

  sql += `\nCOMMIT;\n`;

  fs.writeFileSync(OUTPUT_SQL, sql, 'utf-8');
  console.log(`Generated SQL seed script at: ${OUTPUT_SQL}`);
}

run();
