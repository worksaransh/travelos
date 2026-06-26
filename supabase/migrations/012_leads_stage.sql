-- Migration 012: Add Stage Column to Leads
-- Enables persistent pipeline stage tracking for CRM and triggers alerts on transition

ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage text DEFAULT 'New';
