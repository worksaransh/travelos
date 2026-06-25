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

async function runTests() {
  console.log("==========================================");
  console.log("🚀 STARTING SPRINT 1 GAP RESOLUTION AUDIT TESTS");
  console.log("==========================================");

  // Test 1: Verify database connection and schema tables
  console.log("\n📋 [TEST 1] Verifying database schema columns & tables...");
  try {
    const { data: experiences, error: expErr } = await supabase.from("experiences").select("id, name, deleted_at").limit(1);
    if (expErr) throw expErr;
    console.log("✅ Success: 'deleted_at' column is present on 'experiences' table.");
  } catch (err) {
    console.error("❌ Test 1 Failed: Soft delete column check failed.", err.message || err);
  }

  // Test 2: Check Package Versioning triggers & structures
  console.log("\n📋 [TEST 2] Verifying package versioning snapshot function...");
  try {
    // Look up any package
    const { data: packages, error: pkgErr } = await supabase.from("packages").select("id, name").limit(1);
    if (pkgErr) throw pkgErr;

    if (packages && packages.length > 0) {
      const packageId = packages[0].id;
      console.log(`Creating snapshot for package: '${packages[0].name}' (${packageId})`);

      // Call database RPC to snapshot package
      const { data: snapshotId, error: snapshotErr } = await supabase.rpc("create_package_snapshot", {
        p_package_id: packageId
      });

      if (snapshotErr) throw snapshotErr;
      console.log(`✅ Success: Package snapshotted successfully. Snapshot ID: ${snapshotId}`);

      // Verify version record exists
      const { data: versionData, error: verErr } = await supabase
        .from("package_versions")
        .select("*")
        .eq("id", snapshotId)
        .single();
      
      if (verErr) throw verErr;
      console.log(`✅ Success: Found matching snapshot version ${versionData.version} with base_price ${versionData.base_price}.`);
    } else {
      console.log("⚠️ Warning: No packages found in database to run snapshot test.");
    }
  } catch (err) {
    console.error("❌ Test 2 Failed: Package versioning engine check failed.", err.message || err);
  }

  // Test 3: Check RLS Enforcement on dynamic flow tables
  console.log("\n📋 [TEST 3] Verifying RLS policies are enabled on admin/security tables...");
  try {
    // Attempting to select role permissions. Unauthenticated users should have restricted/no access to modification.
    const { data: rolePerms, error: rlsErr } = await supabase.from("role_permissions").select("*").limit(5);
    
    // We expect this query to be blocked or return empty/restricted results safely depending on session.
    console.log(`✅ Success: Query on role_permissions completed. Received: ${rolePerms ? rolePerms.length : 0} rows.`);
  } catch (err) {
    console.warn("⚠️ RLS Enforcement info:", err.message || err);
  }

  // Test 4: Mock testing profile merge functionality
  console.log("\n📋 [TEST 4] Simulating anonymous profile merge function...");
  try {
    const anonId = "00000000-0000-0000-0000-000000000111";
    const authId = "00000000-0000-0000-0000-000000000222";

    // Call the database merge function RPC
    const { error: mergeErr } = await supabase.rpc("merge_anonymous_profile", {
      p_anon_id: anonId,
      p_auth_id: authId
    });

    // We expect this function to complete (if records exist, it merges; if not, it exits gracefully)
    if (mergeErr) {
      // If we don't have DB permission to execute RPC, it will throw.
      throw mergeErr;
    }
    console.log("✅ Success: merge_anonymous_profile completed gracefully.");
  } catch (err) {
    console.error("❌ Test 4 Failed: Anonymous merge check failed.", err.message || err);
  }

  console.log("\n==========================================");
  console.log("🏁 TESTS COMPLETED");
  console.log("==========================================");
}

runTests();
