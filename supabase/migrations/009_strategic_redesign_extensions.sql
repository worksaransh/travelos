-- Migration 009: Strategic Redesign Extensions
-- Implements database structures from the approved Experience Redesign Strategy

-- 1. Related Destinations Table
CREATE TABLE IF NOT EXISTS related_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  related_city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  similarity_score numeric(4,3) NOT NULL CHECK (similarity_score BETWEEN 0 AND 1),
  UNIQUE (city_id, related_city_id),
  CHECK (city_id <> related_city_id)
);

-- 2. Question Bank Table (Expanded Core Question Set)
CREATE TABLE IF NOT EXISTS question_bank (
  question_id text PRIMARY KEY,
  category text NOT NULL,
  subcategory text,
  question_text_conversational text NOT NULL,
  type text NOT NULL,
  conditional_logic text,
  weight numeric(3,2) NOT NULL DEFAULT 1.0 CHECK (weight BETWEEN 0 AND 1),
  impact_on_recommendations text
);

-- 3. Row Level Security Configuration
ALTER TABLE related_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

-- 4. Access Policies (Public Select, Admin Write)
DROP POLICY IF EXISTS related_destinations_select ON related_destinations;
CREATE POLICY related_destinations_select ON related_destinations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS related_destinations_write ON related_destinations;
CREATE POLICY related_destinations_write ON related_destinations
  FOR ALL USING (is_admin() OR is_super_admin())
  WITH CHECK (is_admin() OR is_super_admin());

DROP POLICY IF EXISTS question_bank_select ON question_bank;
CREATE POLICY question_bank_select ON question_bank
  FOR SELECT USING (true);

DROP POLICY IF EXISTS question_bank_write ON question_bank;
CREATE POLICY question_bank_write ON question_bank
  FOR ALL USING (is_admin() OR is_super_admin())
  WITH CHECK (is_admin() OR is_super_admin());
