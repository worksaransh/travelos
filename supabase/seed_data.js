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

async function seed() {
  console.log("=== SEEDING DATABASE CONFIG TABLES ===");
  try {
    // 1. Fetch dimension tags
    const { data: tags, error: te } = await supabase.from('dimension_tags').select('*');
    if (te) throw te;
    console.log(`Fetched ${tags.length} dimension tags.`);

    // 2. Fetch personas
    const { data: personas, error: pe } = await supabase.from('personas').select('*');
    if (pe) throw pe;
    console.log(`Fetched ${personas.length} personas.`);

    const tagIdMap = {};
    tags.forEach(t => {
      tagIdMap[t.dimension_name] = t.id;
    });

    const personaNameMap = {};
    const personaIdMap = {};
    personas.forEach(p => {
      personaNameMap[p.id] = p.name;
      personaIdMap[p.name] = p.id;
    });

    // 3. Seed scoring weights
    console.log("Seeding scoring_weights_config...");
    const weightsToInsert = [];
    
    // Luxury dimension (exact weights)
    const luxuryId = tagIdMap['Luxury'];
    if (luxuryId) {
      weightsToInsert.push(
        { dimension_tag_id: luxuryId, weight_component: 'slider_input', weight_value: 0.50 },
        { dimension_tag_id: luxuryId, weight_component: 'hotel_category_pref', weight_value: 0.30 },
        { dimension_tag_id: luxuryId, weight_component: 'budget_band', weight_value: 0.10 },
        { dimension_tag_id: luxuryId, weight_component: 'implicit_signal', weight_value: 0.10 }
      );
    }

    // Other 9 dimensions
    const otherDimensions = [
      'Adventure', 'Shopping', 'Food', 'Nature', 'Nightlife',
      'Culture', 'Photography', 'Relaxation', 'Local Experiences'
    ];

    otherDimensions.forEach(dim => {
      const dimId = tagIdMap[dim];
      if (dimId) {
        weightsToInsert.push(
          { dimension_tag_id: dimId, weight_component: 'slider_input', weight_value: 0.80 },
          { dimension_tag_id: dimId, weight_component: 'implicit_signal', weight_value: 0.20 }
        );
      }
    });

    // Clear existing weights and insert
    const { error: deleteWeightsErr } = await supabase.from('scoring_weights_config').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    // If table doesn't use standard UUID pk or deleting like this fails, try deleting all using standard filters.
    // Let's just delete by checking what fields are there or delete all. In Supabase JS, delete() without filter can fail, so we filter by matching any dimension_tag_id.
    const allTagIds = Object.values(tagIdMap);
    const { error: delWeightsErr } = await supabase.from('scoring_weights_config').delete().in('dimension_tag_id', allTagIds);
    if (delWeightsErr) throw delWeightsErr;

    const { error: insWeightsErr } = await supabase.from('scoring_weights_config').insert(weightsToInsert);
    if (insWeightsErr) throw insWeightsErr;
    console.log(`Successfully seeded ${weightsToInsert.length} weights!`);

    // 4. Seed persona rules
    console.log("Seeding persona_classification_rules...");
    
    // Map rules to their target persona IDs
    const rulesToInsert = [
      {
        rule_order: 1,
        condition_logic: { field: "occasion", operator: "equals", value: "Business" },
        resulting_persona_id: personaIdMap['The Corporate Quick-Tripper']
      },
      {
        rule_order: 2,
        condition_logic: {
          and: [
            { field: "occasion", operator: "in", value: ["Honeymoon", "Anniversary"] },
            { field: "romance_adjacent_high", operator: "equals", value: true }
          ]
        },
        resulting_persona_id: personaIdMap['The Romantic']
      },
      {
        rule_order: 3,
        condition_logic: {
          and: [
            { field: "group_type", operator: "equals", value: "family" },
            { field: "adventure_culture_dominate", operator: "equals", value: false }
          ]
        },
        resulting_persona_id: personaIdMap['The Family Memory Maker']
      },
      {
        rule_order: 4,
        condition_logic: {
          and: [
            { field: "luxury_score", operator: "gt", value: 70 },
            { field: "budget_persona", operator: "in", value: ["Value-Conscious", "Strict"] }
          ]
        },
        resulting_persona_id: personaIdMap['The Aspirational Dreamer']
      },
      {
        rule_order: 5,
        condition_logic: { top_dimensions: ["Relaxation", "Nature"] },
        resulting_persona_id: personaIdMap['The Relaxed Escapist']
      },
      {
        rule_order: 6,
        condition_logic: { top_dimensions: ["Adventure", "Nature"] },
        resulting_persona_id: personaIdMap['The Adventure Maximalist']
      },
      {
        rule_order: 7,
        condition_logic: { top_dimensions: ["Culture", "Local Experiences", "Photography"] },
        resulting_persona_id: personaIdMap['The Cultural Immersive']
      },
      {
        rule_order: 8,
        condition_logic: {
          and: [
            { field: "top_dimensions", operator: "contains", value: "Luxury" },
            { field: "budget_persona", operator: "equals", value: "Flexible" }
          ]
        },
        resulting_persona_id: personaIdMap['The Luxury Indulger']
      },
      {
        rule_order: 9,
        condition_logic: { top_dimensions: ["Nightlife", "Shopping"] },
        resulting_persona_id: personaIdMap['The Social Explorer']
      },
      {
        rule_order: 10,
        condition_logic: { top_dimensions: ["Food", "Local Experiences"] },
        resulting_persona_id: personaIdMap['The Foodie Wanderer']
      },
      {
        rule_order: 11,
        condition_logic: {
          and: [
            { field: "top_dimensions", operator: "contains", value: "Local Experiences" },
            { field: "hidden_gems", operator: "equals", value: "yes" }
          ]
        },
        resulting_persona_id: personaIdMap['The Hidden-Gem Hunter']
      },
      {
        rule_order: 12,
        condition_logic: { fallback: true },
        resulting_persona_id: personaIdMap['The Practical Planner']
      }
    ];

    // Check if any rules are missing persona IDs
    rulesToInsert.forEach(r => {
      if (!r.resulting_persona_id) {
        throw new Error(`Rule ${r.rule_order} has no valid resulting_persona_id mapped!`);
      }
    });

    const { error: delRulesErr } = await supabase.from('persona_classification_rules').delete().gt('rule_order', 0);
    if (delRulesErr) throw delRulesErr;

    const { error: insRulesErr } = await supabase.from('persona_classification_rules').insert(rulesToInsert);
    if (insRulesErr) throw insRulesErr;
    console.log(`Successfully seeded ${rulesToInsert.length} rules!`);

  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
