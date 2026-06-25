-- Migration 007: Questionnaire Flow Schema Extension
-- Maps questionnaire branching flow directly to database

CREATE TABLE IF NOT EXISTS questionnaire_flow (
  question_id text PRIMARY KEY,
  tier integer NOT NULL,
  question_text text NOT NULL,
  type text NOT NULL,
  options text,
  condition_field text,
  condition_op text,
  condition_value text,
  next_question_if_condition_true text,
  next_question_default text
);

-- Index on tier for quick lookup during quiz steps
CREATE INDEX IF NOT EXISTS idx_questionnaire_flow_tier ON questionnaire_flow(tier);
