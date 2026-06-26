const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Read env variables
const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const envLines = envContent.split('\n');
let supabaseUrl = '';
let supabaseAnonKey = '';

envLines.forEach(line => {
  if (line.trim().startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  }
  if (line.trim().startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    supabaseAnonKey = line.split('=')[1].trim();
  }
});

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Custom CSV Parser to handle double-quoted text containing commas
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

async function seedData() {
  console.log("==========================================");
  console.log("🌱 STARTING SEED PIPELINE FOR STRATEGIC CSV DATA");
  console.log("==========================================");

  // 1. Seed Question Bank
  const questionBankPath = path.join(__dirname, 'extra data', 'journeyos_question_bank_v2.csv');
  console.log(`\nReading question bank from: ${questionBankPath}`);
  try {
    const rawQuestions = parseCSV(path.join(__dirname, '../extra data/journeyos_question_bank_v2.csv'));
    console.log(`Parsed ${rawQuestions.length} questions from CSV.`);

    const formattedQuestions = rawQuestions.map(q => ({
      question_id: q.question_id,
      category: q.category,
      subcategory: q.subcategory || null,
      question_text_conversational: q.question_text_conversational || q.question_text || "",
      type: q.type,
      conditional_logic: q.conditional_logic || q.conditional_logic_rules || null,
      weight: parseFloat(q.weight || '1.0'),
      impact_on_recommendations: q.impact_on_recommendations || null
    }));

    // Upsert into Supabase
    const { data, error } = await supabase
      .from('question_bank')
      .upsert(formattedQuestions, { onConflict: 'question_id' });

    if (error) {
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        console.error("❌ Error: The 'question_bank' table does not exist in the database yet.");
        console.error("👉 Please execute the migration file '009_strategic_redesign_extensions.sql' in your Supabase SQL editor first!");
      } else {
        throw error;
      }
    } else {
      console.log("✅ Success: Question Bank seeded successfully.");
    }
  } catch (err) {
    console.error("❌ Failed seeding Question Bank:", err.message || err);
  }

  // 2. Seed Related Destinations
  const relatedDestPath = path.join(__dirname, 'extra data', 'journeyos_related_destinations.csv');
  console.log(`\nReading related destinations from: ${relatedDestPath}`);
  try {
    const rawRelated = parseCSV(path.join(__dirname, '../extra data/journeyos_related_destinations.csv'));
    console.log(`Parsed ${rawRelated.length} related destinations pairings.`);

    const formattedRelated = rawRelated.map(r => ({
      city_id: r.city_id,
      related_city_id: r.related_city_id,
      similarity_score: parseFloat(r.similarity_score)
    }));

    // Upsert into Supabase
    const { data, error } = await supabase
      .from('related_destinations')
      .upsert(formattedRelated, { onConflict: 'city_id,related_city_id' });

    if (error) {
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        console.error("❌ Error: The 'related_destinations' table does not exist in the database yet.");
        console.error("👉 Please execute the migration file '009_strategic_redesign_extensions.sql' in your Supabase SQL editor first!");
      } else {
        throw error;
      }
    } else {
      console.log("✅ Success: Related Destinations pairings seeded successfully.");
    }
  } catch (err) {
    console.error("❌ Failed seeding Related Destinations:", err.message || err);
  }

  console.log("\n==========================================");
  console.log("🏁 SEED PIPELINE COMPLETED");
  console.log("==========================================");
}

seedData();
