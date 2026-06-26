-- Migration 011: AI & Semantic Search Enablement
-- Configures pgvector extension, embedding indexing, search RCs, AI validation cache, and CRM audit log tables

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to experiences
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. Create HNSW index for cosine distance vector search
CREATE INDEX IF NOT EXISTS experiences_embedding_hnsw_idx 
ON experiences USING hnsw (embedding vector_cosine_ops);

-- 4. Create match_experiences similarity search function
CREATE OR REPLACE FUNCTION match_experiences (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_city_id uuid
) RETURNS TABLE (
  id uuid,
  name text,
  category text,
  price_band text,
  age_suitability text,
  similarity float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    experiences.id,
    experiences.name,
    experiences.category,
    experiences.price_band,
    experiences.age_suitability,
    (1 - (experiences.embedding <=> query_embedding))::float AS similarity
  FROM experiences
  WHERE experiences.city_id = p_city_id
    AND experiences.supplier_bookable_flag = true
    AND (1 - (experiences.embedding <=> query_embedding)) > match_threshold
  ORDER BY experiences.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Create AI validation cache table
CREATE TABLE IF NOT EXISTS validation_reports_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payload_hash text UNIQUE NOT NULL,
  validation_report jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 6. Enable RLS and Policies for validation cache
ALTER TABLE validation_reports_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS validation_reports_cache_select ON validation_reports_cache;
CREATE POLICY validation_reports_cache_select ON validation_reports_cache 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS validation_reports_cache_insert ON validation_reports_cache;
CREATE POLICY validation_reports_cache_insert ON validation_reports_cache 
  FOR INSERT WITH CHECK (true);

-- 7. Create notification logs table
CREATE TABLE IF NOT EXISTS crm_notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  message_body text NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 8. Enable RLS and Policies for crm_notification_logs
ALTER TABLE crm_notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_notification_logs_select ON crm_notification_logs;
CREATE POLICY crm_notification_logs_select ON crm_notification_logs 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS crm_notification_logs_insert ON crm_notification_logs;
CREATE POLICY crm_notification_logs_insert ON crm_notification_logs 
  FOR INSERT WITH CHECK (true);
