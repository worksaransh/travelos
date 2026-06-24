-- Domain B: Travel DNA — JourneyOS_Phase6_Database_Architecture.md §6.2
-- Direct implementation of Phase 5. Note: dimension_scores.dimension_tag_id
-- and scoring_weights_config.dimension_tag_id, and
-- persona_classification_rules.resulting_persona_id are intentionally left
-- WITHOUT a foreign key constraint here — dimension_tags and personas
-- belong to Domain C (next migration). The constraints are added at the end
-- of 003_domain_c_knowledge_graph.sql once those tables exist.

create table travel_dna_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  budget_persona text,
  travel_persona text,
  upsell_score numeric(5,2) check (upsell_score between 0 and 100),
  travel_confidence_score numeric(5,2) check (travel_confidence_score between 0 and 100),
  last_updated timestamptz not null default now(),
  deleted_at timestamptz
);

create table dimension_scores (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references travel_dna_profiles(id) on delete cascade,
  dimension_tag_id uuid not null,  -- FK to dimension_tags added in 003
  score_value numeric(5,2) not null check (score_value between 0 and 100),
  last_updated timestamptz not null default now(),
  unique (profile_id, dimension_tag_id)
);

create table questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references travel_dna_profiles(id) on delete cascade,
  tier integer not null check (tier between 0 and 5),
  question_id text not null,
  answer_value jsonb not null,
  answered_at timestamptz not null default now(),
  source text not null default 'explicit' check (source in ('explicit', 'implicit')),
  confidence_weight numeric(4,2) not null default 1.0
);

create table implicit_signals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references travel_dna_profiles(id) on delete cascade,
  event_type text not null,
  target_entity_type text not null,
  target_entity_id uuid,
  occurred_at timestamptz not null default now(),
  weight_applied numeric(5,2)
);

create table scoring_weights_config (
  id uuid primary key default gen_random_uuid(),
  dimension_tag_id uuid not null,  -- FK to dimension_tags added in 003
  weight_component text not null,
  weight_value numeric(5,2) not null,
  last_updated_by uuid references admins(id),
  updated_at timestamptz not null default now(),
  unique (dimension_tag_id, weight_component)
);

create table persona_classification_rules (
  id uuid primary key default gen_random_uuid(),
  rule_order integer not null unique,
  condition_logic jsonb not null,
  resulting_persona_id uuid,       -- FK to personas added in 003
  created_at timestamptz not null default now()
);

create table travel_dna_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references travel_dna_profiles(id) on delete cascade,
  snapshot_json jsonb not null,
  snapshot_date timestamptz not null default now()
);

-- users.current_dna_profile_id can now be constrained since
-- travel_dna_profiles exists.
alter table users
  add constraint fk_users_current_dna_profile
  foreign key (current_dna_profile_id) references travel_dna_profiles(id);
