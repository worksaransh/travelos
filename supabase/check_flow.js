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

async function run() {
  try {
    const { data, error } = await supabase.from('questionnaire_flow').select('*');
    if (error) throw error;
    console.log("Count of dynamic questions:", data ? data.length : 0);
    if (data && data.length > 0) {
      console.log("First 3 questions loaded:");
      console.log(JSON.stringify(data.slice(0, 3), null, 2));
    }
  } catch (err) {
    console.error("Query failed:", err.message || err);
  }
}

run();
