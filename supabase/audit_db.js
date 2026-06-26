const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read env variables
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

const tables = [
  'countries',
  'cities',
  'experiences',
  'packages',
  'package_components',
  'questionnaire_flow',
  'question_bank',
  'related_destinations',
  'mood_categories',
  'bundle_templates',
  'destination_question_templates',
  'admins',
  'agents',
  'roles',
  'permissions',
  'role_permissions',
  'suppliers'
];

async function run() {
  console.log("==========================================");
  console.log("📊 RUNNING DATABASE SYSTEM AUDIT");
  console.log("==========================================");

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ Table '${table}': ERROR - ${error.message}`);
      } else {
        console.log(`✅ Table '${table}': Present, Count = ${count}`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}': Exception - ${err.message}`);
    }
  }

  // Check needs_owner_review
  try {
    const { count: expReviewCount, error: expErr } = await supabase
      .from('experiences')
      .select('*', { count: 'exact', head: true })
      .eq('needs_owner_review', true);
    console.log(`\nExperiences needing review (needs_owner_review = true): ${expErr ? 'ERROR: ' + expErr.message : expReviewCount}`);

    const { count: pkgReviewCount, error: pkgErr } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true })
      .eq('needs_owner_review', true);
    console.log(`Packages needing review (needs_owner_review = true): ${pkgErr ? 'ERROR: ' + pkgErr.message : pkgReviewCount}`);
  } catch (e) {
    console.log("Failed to check review flags:", e.message);
  }

  // Check visa volatile flags
  try {
    const { data: visaData, error: visaErr } = await supabase
      .from('countries')
      .select('name, visa_volatile')
      .in('name', ['Thailand', 'Malaysia', 'Bhutan']);
    
    if (visaErr) {
      console.log("Error checking visa flags:", visaErr.message);
    } else {
      console.log("\nVisa Volatile check for Thailand, Malaysia, Bhutan:");
      visaData.forEach(c => {
        console.log(`- ${c.name}: visa_volatile = ${c.visa_volatile}`);
      });
    }
  } catch (e) {
    console.log("Failed to check visa flags:", e.message);
  }

  console.log("==========================================");
}

run();
