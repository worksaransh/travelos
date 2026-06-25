-- Migration 008: Phase 1 Critical Fixes
-- Implements: Package Versioning, Soft Delete Architecture, Consent Logging, and complete RLS Coverage.

-- 1. Soft Delete Architecture: Add deleted_at columns
ALTER TABLE countries ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE areas ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE events ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE travel_dna_profiles ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Ensure packages and package_components exist and add deleted_at
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  destination_city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  duration_nights integer NOT NULL,
  package_tier text NOT NULL CHECK (package_tier IN ('comfort','premium','signature')),
  base_price numeric(12,2) NOT NULL,
  needs_owner_review boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE TABLE IF NOT EXISTS package_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  component_type text NOT NULL CHECK (component_type IN ('included_experience','hotel_upgrade','addon_experience','extra_day')),
  experience_id uuid REFERENCES experiences(id) ON DELETE SET NULL,
  price_delta numeric(12,2) NOT NULL DEFAULT 0,
  deleted_at timestamptz
);
ALTER TABLE package_components ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- 2. Package Versioning & Snapshot Engine
CREATE TABLE IF NOT EXISTS package_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  version integer NOT NULL,
  name text NOT NULL,
  base_price numeric(12,2) NOT NULL,
  duration_nights integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (package_id, version)
);

CREATE TABLE IF NOT EXISTS package_version_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_version_id uuid NOT NULL REFERENCES package_versions(id) ON DELETE CASCADE,
  component_type text NOT NULL CHECK (component_type IN ('included_experience','hotel_upgrade','addon_experience','extra_day')),
  experience_id uuid REFERENCES experiences(id) ON DELETE SET NULL,
  price_delta numeric(12,2) NOT NULL DEFAULT 0,
  sequence_order integer
);

-- Link itineraries to frozen package versions
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS package_version_id uuid REFERENCES package_versions(id) ON DELETE SET NULL;

-- DB Function to snapshot package at itinerary generation time
CREATE OR REPLACE FUNCTION create_package_snapshot(p_package_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_version integer;
  v_version_id uuid;
  v_pkg record;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version), 0) + 1 INTO v_new_version
  FROM package_versions
  WHERE package_id = p_package_id;

  -- Get package details
  SELECT * INTO v_pkg FROM packages WHERE id = p_package_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Package % not found', p_package_id;
  END IF;

  -- Insert package version
  INSERT INTO package_versions (package_id, version, name, base_price, duration_nights)
  VALUES (p_package_id, v_new_version, v_pkg.name, v_pkg.base_price, v_pkg.duration_nights)
  RETURNING id INTO v_version_id;

  -- Copy components
  INSERT INTO package_version_components (package_version_id, component_type, experience_id, price_delta)
  SELECT v_version_id, component_type, experience_id, price_delta
  FROM package_components
  WHERE package_id = p_package_id AND deleted_at IS NULL;

  RETURN v_version_id;
END;
$$;

-- 3. Consent & Compliance Logging
CREATE TABLE IF NOT EXISTS consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  consent_version text NOT NULL,
  ip_hash text,
  consent_given boolean NOT NULL DEFAULT true,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- 4. Complete RLS Coverage (Least Privilege Policies)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_version_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- Admins RLS Policies
CREATE POLICY admins_select_all ON admins FOR SELECT USING (is_admin() OR is_super_admin());
CREATE POLICY admins_write_super ON admins FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY admins_self_read ON admins FOR SELECT USING (auth.uid() = id);

-- Agents RLS Policies
CREATE POLICY agents_select_all ON agents FOR SELECT USING (true); -- Public select needed for assignment & details
CREATE POLICY agents_write_admin ON agents FOR ALL USING (is_admin() OR is_super_admin()) WITH CHECK (is_admin() OR is_super_admin());

-- RBAC Tables Policies
CREATE POLICY roles_select ON roles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY roles_write ON roles FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

CREATE POLICY permissions_select ON permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY permissions_write ON permissions FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

CREATE POLICY role_permissions_select ON role_permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY role_permissions_write ON role_permissions FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Suppliers Policies
CREATE POLICY suppliers_select ON suppliers FOR SELECT USING (is_agent() OR is_admin() OR is_super_admin());
CREATE POLICY suppliers_write ON suppliers FOR ALL USING (is_admin() OR is_super_admin()) WITH CHECK (is_admin() OR is_super_admin());

-- Questionnaire Flow Policies
CREATE POLICY questionnaire_flow_select ON questionnaire_flow FOR SELECT USING (true); -- Public read
CREATE POLICY questionnaire_flow_write ON questionnaire_flow FOR ALL USING (is_admin() OR is_super_admin()) WITH CHECK (is_admin() OR is_super_admin());

-- Packages Policies
CREATE POLICY packages_select ON packages FOR SELECT USING (deleted_at IS NULL); -- Public read where not soft deleted
CREATE POLICY packages_write ON packages FOR ALL USING (is_admin() OR is_super_admin()) WITH CHECK (is_admin() OR is_super_admin());

-- Package Components Policies
CREATE POLICY package_components_select ON package_components FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY package_components_write ON package_components FOR ALL USING (is_admin() OR is_super_admin()) WITH CHECK (is_admin() OR is_super_admin());

-- Package Versions Policies
CREATE POLICY package_versions_select ON package_versions FOR SELECT USING (true); -- Accessible to link with itineraries
CREATE POLICY package_versions_write ON package_versions FOR ALL USING (is_admin() OR is_super_admin()) WITH CHECK (is_admin() OR is_super_admin());

CREATE POLICY package_version_components_select ON package_version_components FOR SELECT USING (true);
CREATE POLICY package_version_components_write ON package_version_components FOR ALL USING (is_admin() OR is_super_admin()) WITH CHECK (is_admin() OR is_super_admin());

-- Consent Records Policies
CREATE POLICY consent_records_insert ON consent_records FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY consent_records_select ON consent_records FOR SELECT USING (auth.uid() = user_id OR is_admin() OR is_super_admin());

-- 5. Soft Delete Filtering adjustment for itineraries & profiles
DROP POLICY IF EXISTS dna_profiles_select ON travel_dna_profiles;
CREATE POLICY dna_profiles_select ON travel_dna_profiles FOR SELECT
  USING ((auth.uid() = user_id AND deleted_at IS NULL) OR is_admin() OR is_super_admin() OR agent_assigned_to_user(user_id));

DROP POLICY IF EXISTS itineraries_select ON itineraries;
CREATE POLICY itineraries_select ON itineraries FOR SELECT
  USING ((auth.uid() = user_id AND deleted_at IS NULL) OR is_admin() OR is_super_admin() OR agent_assigned_to_user(user_id));

-- 6. DB Function to merge anonymous traveler profiles to authenticated users on signup
CREATE OR REPLACE FUNCTION merge_anonymous_profile(p_anon_id uuid, p_auth_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_anon_profile_id uuid;
  v_lifecycle text;
  v_consent text;
BEGIN
  -- Get details from old user record
  SELECT current_dna_profile_id, lifecycle_stage, consent_status 
  INTO v_anon_profile_id, v_lifecycle, v_consent
  FROM users WHERE id = p_anon_id;

  IF FOUND THEN
    -- Update travel_dna_profiles user_id
    UPDATE travel_dna_profiles SET user_id = p_auth_id WHERE user_id = p_anon_id;

    -- Update itineraries user_id
    UPDATE itineraries SET user_id = p_auth_id WHERE user_id = p_anon_id;

    -- Update leads user_id
    UPDATE leads SET user_id = p_auth_id WHERE user_id = p_anon_id;

    -- Update destination recommendations user_id
    UPDATE destination_recommendations SET user_id = p_auth_id WHERE user_id = p_anon_id;

    -- Sync lifecycle and consent details into the new authenticated user record
    UPDATE users
    SET 
      current_dna_profile_id = COALESCE(current_dna_profile_id, v_anon_profile_id),
      lifecycle_stage = COALESCE(lifecycle_stage, v_lifecycle),
      consent_status = COALESCE(consent_status, v_consent)
    WHERE id = p_auth_id;

    -- Delete old anonymous row from public.users
    DELETE FROM users WHERE id = p_anon_id;
  END IF;
END;
$$;

