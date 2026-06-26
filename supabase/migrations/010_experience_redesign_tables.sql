-- Migration 010: Experience Redesign Tables
-- Implements mood_categories, bundle_templates, and destination_question_templates tables

-- 1. Mood Categories Table
CREATE TABLE IF NOT EXISTS mood_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mood_name text UNIQUE NOT NULL,
  filter_rule_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Bundle Templates Table
CREATE TABLE IF NOT EXISTS bundle_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  city_id uuid REFERENCES cities(id) ON DELETE CASCADE,
  category_pairings text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. Destination Question Templates Table
CREATE TABLE IF NOT EXISTS destination_question_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  template_question_text text NOT NULL,
  applies_to_experience_category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE mood_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_question_templates ENABLE ROW LEVEL SECURITY;

-- 5. Access Policies (Public SELECT, Admin Write)
DROP POLICY IF EXISTS mood_categories_select ON mood_categories;
CREATE POLICY mood_categories_select ON mood_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS mood_categories_write ON mood_categories;
CREATE POLICY mood_categories_write ON mood_categories
  FOR ALL USING (is_admin() OR is_super_admin())
  WITH CHECK (is_admin() OR is_super_admin());

DROP POLICY IF EXISTS bundle_templates_select ON bundle_templates;
CREATE POLICY bundle_templates_select ON bundle_templates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS bundle_templates_write ON bundle_templates;
CREATE POLICY bundle_templates_write ON bundle_templates
  FOR ALL USING (is_admin() OR is_super_admin())
  WITH CHECK (is_admin() OR is_super_admin());

DROP POLICY IF EXISTS dest_question_templates_select ON destination_question_templates;
CREATE POLICY dest_question_templates_select ON destination_question_templates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS dest_question_templates_write ON destination_question_templates;
CREATE POLICY dest_question_templates_write ON destination_question_templates
  FOR ALL USING (is_admin() OR is_super_admin())
  WITH CHECK (is_admin() OR is_super_admin());
