const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Read env variables from .env.local
const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const envLines = envContent.split('\n');
let supabaseUrl = '';
let supabaseAnonKey = '';

envLines.forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    supabaseAnonKey = line.split('=')[1].trim();
  }
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Could not find NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TEST_PROFILES = [
  {
    name: "Sara (ICP-1)",
    answers: {
      occasion: "Vacation",
      group_type: "solo",
      budget_value: 150000,
      budget_type: "total",
      hotel_category: "4_star",
      hidden_gems: "no"
    },
    sliders: {
      Luxury: 50,
      Adventure: 60,
      Shopping: 40,
      Food: 70,
      Nature: 60,
      Nightlife: 30,
      Culture: 80,
      Photography: 70,
      Relaxation: 70,
      "Local Experiences": 80
    },
    expectedPersona: "The Cultural Immersive"
  },
  {
    name: "Daniel & Maya (ICP-2)",
    answers: {
      occasion: "Honeymoon",
      group_type: "couple",
      budget_value: 500000,
      budget_type: "total",
      hotel_category: "5_star",
      hidden_gems: "no"
    },
    sliders: {
      Luxury: 80,
      Adventure: 30,
      Shopping: 30,
      Food: 80,
      Nature: 50,
      Nightlife: 40,
      Culture: 60,
      Photography: 80,
      Relaxation: 70,
      "Local Experiences": 50
    },
    expectedPersona: "The Romantic"
  },
  {
    name: "Omar (ICP-3)",
    answers: {
      occasion: "Family Vacation",
      group_type: "family",
      budget_value: 1200000,
      budget_type: "total",
      hotel_category: "4_star",
      hidden_gems: "no"
    },
    sliders: {
      Luxury: 40,
      Adventure: 70,
      Shopping: 30,
      Food: 50,
      Nature: 50,
      Nightlife: 30,
      Culture: 50,
      Photography: 50,
      Relaxation: 50,
      "Local Experiences": 50
    },
    expectedPersona: "The Family Memory Maker"
  },
  {
    name: "Aspirational Dreamer",
    answers: {
      occasion: "Leisure",
      group_type: "couple",
      budget_value: 120000,
      budget_type: "total",
      hotel_category: "3_star",
      hidden_gems: "no"
    },
    sliders: {
      Luxury: 80,
      Adventure: 40,
      Shopping: 40,
      Food: 50,
      Nature: 50,
      Nightlife: 30,
      Culture: 50,
      Photography: 50,
      Relaxation: 50,
      "Local Experiences": 50
    },
    expectedPersona: "The Aspirational Dreamer"
  }
];

async function runTests() {
  console.log("=== RUNNING TRAVEL PERSONA DECISION TREE TESTS ===");

  try {
    // Retrieve personas and dimension tags to map IDs
    const { data: tags, error: te } = await supabase.from('dimension_tags').select('*');
    if (te) throw te;
    const { data: weights, error: we } = await supabase.from('scoring_weights_config').select('*');
    if (we) throw we;
    const { data: personas, error: pe } = await supabase.from('personas').select('*');
    if (pe) throw pe;
    const { data: rules, error: re } = await supabase.from('persona_classification_rules').select('*').order('rule_order', { ascending: true });
    if (re) throw re;

    console.log("Fetched tags count:", tags?.length);
    console.log("Fetched weights count:", weights?.length);
    console.log("Fetched personas count:", personas?.length);
    console.log("Fetched rules count:", rules?.length);
    console.log("Personas in DB:", personas.map(p => ({ name: p.name, id: p.id })));
    if (rules?.length > 0) {
      console.log("Rules sample:", rules[0]);
    }

    const tagIdMap = {};
    tags.forEach(t => tagIdMap[t.dimension_name] = t.id);

    const personaNameMap = {};
    personas.forEach(p => personaNameMap[p.id] = p.name);

    // Helper to run the evaluation logic
    function classify(occasion, groupType, budgetValue, budgetType, hotelCategory, hiddenGems, scoreMap) {
      const dimensions = ["Luxury", "Adventure", "Shopping", "Food", "Nature", "Nightlife", "Culture", "Photography", "Relaxation", "Local Experiences"];
      
      // Compute budget persona
      const normalizedPerPersonBudget = budgetType === "per_person" ? budgetValue : budgetValue / (groupType === "solo" ? 1 : groupType === "couple" ? 2 : groupType === "family" ? 4 : 4);
      const budgetPersona = normalizedPerPersonBudget <= 150000 ? "Value-Conscious/Strict" : "Flexible";

      // Sort dimensions
      const sortedDims = [...dimensions].sort((a, b) => scoreMap[b] - scoreMap[a]);
      const top1 = sortedDims[0];
      const top2 = sortedDims[1];
      const top3 = sortedDims[2];

      const luxuryScore = scoreMap["Luxury"] || 50;
      const relaxationScore = scoreMap["Relaxation"] || 50;
      const cultureScore = scoreMap["Culture"] || 50;
      const foodScore = scoreMap["Food"] || 50;
      const adventureScore = scoreMap["Adventure"] || 50;

      for (const rule of rules) {
        const personaName = personaNameMap[rule.resulting_persona_id];
        if (!personaName) {
          console.log(`  Rule ${rule.rule_order}: resulting persona not found for ID ${rule.resulting_persona_id}`);
          continue;
        }

        console.log(`  Evaluating rule ${rule.rule_order} for persona "${personaName}"...`);

        if (rule.rule_order === 1 && occasion === "Business") {
          console.log("  => Rule 1 matched!");
          return { travelPersona: personaName, budgetPersona };
        }
        if (rule.rule_order === 2 && (occasion === "Honeymoon" || occasion === "Anniversary")) {
          const romanceHigh = luxuryScore >= 60 || relaxationScore >= 60 || foodScore >= 60;
          console.log(`  => Rule 2 occasion matched, romanceHigh: ${romanceHigh} (Luxury: ${luxuryScore}, Relaxation: ${relaxationScore}, Food: ${foodScore})`);
          if (romanceHigh) {
            console.log("  => Rule 2 matched!");
            return { travelPersona: personaName, budgetPersona };
          }
        }
        if (rule.rule_order === 3 && groupType === "family") {
          const adventureCultureDominate = adventureScore >= 75 || cultureScore >= 75;
          console.log(`  => Rule 3 group family matched, adventureCultureDominate: ${adventureCultureDominate} (Adventure: ${adventureScore}, Culture: ${cultureScore})`);
          if (!adventureCultureDominate) {
            console.log("  => Rule 3 matched!");
            return { travelPersona: personaName, budgetPersona };
          }
        }
        if (rule.rule_order === 4 && luxuryScore > 60 && budgetPersona === "Value-Conscious/Strict") {
          console.log(`  => Rule 4 matched! Luxury: ${luxuryScore}, budget: ${budgetPersona}`);
          return { travelPersona: personaName, budgetPersona };
        }
        if (rule.rule_order === 5 && sortedDims.slice(0, 2).includes("Relaxation") && sortedDims.slice(0, 2).includes("Nature")) {
          console.log("  => Rule 5 matched!");
          return { travelPersona: personaName, budgetPersona };
        }
        if (rule.rule_order === 6 && sortedDims.slice(0, 2).includes("Adventure") && sortedDims.slice(0, 2).includes("Nature")) {
          console.log("  => Rule 6 matched!");
          return { travelPersona: personaName, budgetPersona };
        }
        if (rule.rule_order === 7) {
          const matchCount = sortedDims.slice(0, 3).filter(d => d === "Culture" || d === "Local Experiences" || d === "Photography").length;
          console.log(`  => Rule 7 matchCount: ${matchCount} of top 3: [${sortedDims.slice(0, 3).join(", ")}]`);
          if (matchCount >= 2) {
            console.log("  => Rule 7 matched!");
            return { travelPersona: personaName, budgetPersona };
          }
        }
        if (rule.rule_order === 8 && sortedDims.slice(0, 2).includes("Luxury") && budgetPersona === "Flexible") {
          console.log("  => Rule 8 matched!");
          return { travelPersona: personaName, budgetPersona };
        }
        if (rule.rule_order === 9 && sortedDims.slice(0, 2).includes("Nightlife") && sortedDims.slice(0, 2).includes("Shopping")) {
          console.log("  => Rule 9 matched!");
          return { travelPersona: personaName, budgetPersona };
        }
        if (rule.rule_order === 10 && sortedDims.slice(0, 2).includes("Food") && sortedDims.slice(0, 2).includes("Local Experiences")) {
          console.log("  => Rule 10 matched!");
          return { travelPersona: personaName, budgetPersona };
        }
        if (rule.rule_order === 11 && sortedDims.slice(0, 2).includes("Local Experiences") && hiddenGems === "yes") {
          console.log("  => Rule 11 matched!");
          return { travelPersona: personaName, budgetPersona };
        }
        if (rule.rule_order === 12) {
          const maxScore = Math.max(...Object.values(scoreMap));
          console.log(`  => Rule 12 fallback, maxScore: ${maxScore}`);
          if (maxScore <= 60) {
            console.log("  => Rule 12 matched!");
            return { travelPersona: personaName, budgetPersona };
          }
        }
      }

      console.log("  => Felled through all rules, returning default Practical Planner.");
      return { travelPersona: "The Practical Planner", budgetPersona };
    }

    // Iterate profiles
    for (const prof of TEST_PROFILES) {
      console.log(`\nEvaluating: ${prof.name}`);

      // Map hotel category and budget band values for scoring
      const hotelCategory = prof.answers.hotel_category;
      const hotelVal = hotelCategory === "luxury" ? 100 : hotelCategory === "5_star" ? 80 : hotelCategory === "4_star" ? 60 : hotelCategory === "3_star" ? 40 : 20;
      const budgetVal = prof.answers.budget_value >= 200000 ? 100 : prof.answers.budget_value >= 100000 ? 70 : 40;

      const computedScores = {};

      tags.forEach(tag => {
        const tagWeights = weights.filter(w => w.dimension_tag_id === tag.id);
        let score = 0;
        const sliderVal = prof.sliders[tag.dimension_name] !== undefined ? prof.sliders[tag.dimension_name] : 50;

        if (tagWeights.length === 0) {
          score = sliderVal * 0.8 + 50 * 0.2;
        } else {
          tagWeights.forEach(w => {
            if (w.weight_component === "slider_input") {
              score += sliderVal * Number(w.weight_value);
            } else if (w.weight_component === "hotel_category_pref") {
              score += hotelVal * Number(w.weight_value);
            } else if (w.weight_component === "budget_band") {
              score += budgetVal * Number(w.weight_value);
            } else if (w.weight_component === "implicit_signal") {
              score += 50 * Number(w.weight_value);
            }
          });
        }
        computedScores[tag.dimension_name] = score;
      });

      console.log("Computed DNA Dimension Scores:", computedScores);

      // Run decision tree classification
      const result = classify(
        prof.answers.occasion,
        prof.answers.group_type,
        prof.answers.budget_value,
        prof.answers.budget_type,
        prof.answers.hotel_category,
        prof.answers.hidden_gems,
        computedScores
      );

      const isMatch = result.travelPersona === prof.expectedPersona;
      console.log(`Travel Persona Match: ${isMatch ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`Expected: "${prof.expectedPersona}"`);
      console.log(`Actual:   "${result.travelPersona}"`);
      console.log(`Budget Persona: "${result.budgetPersona}"`);
    }
  } catch (e) {
    console.error("Test failed: ", e);
  }
  console.log("\n=== COMPLETED DECISION TREE TESTS ===");
}

runTests();
