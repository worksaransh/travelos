-- Domain C: Knowledge Graph — JourneyOS_Phase6_Database_Architecture.md §6.2
-- Relational implementation of Phase 7. dimension_tags and disappointment_tags
-- are the shared vocabulary tables — every reference elsewhere must use a
-- foreign key to these, never a free-text duplicate.

create table countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  region text,
  visa_policy_default text,
  currency text,
  supplier_coverage_status text not null default 'none'
    check (supplier_coverage_status in ('active', 'limited', 'none')),
  domestic_flag boolean not null default false
);

create table cities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references countries(id) on delete cascade,
  name text not null,
  weather_profile_json jsonb,
  avg_cost_index numeric(6,2),
  supplier_coverage_status text not null default 'none'
    check (supplier_coverage_status in ('active', 'limited', 'none')),
  unique (country_id, name)
);

create table flight_routes (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  departure_city text not null,
  avg_flight_duration_hours numeric(4,1),
  layover_typical_flag boolean not null default false,
  unique (city_id, departure_city)
);

create table areas (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  name text not null,
  vibe_tags text[],
  unique (city_id, name)
);

-- The shared vocabulary tables — referenced everywhere else by FK.
create table dimension_tags (
  id uuid primary key default gen_random_uuid(),
  dimension_name text not null unique
);

create table disappointment_tags (
  id uuid primary key default gen_random_uuid(),
  tag_name text not null unique
);

create table personas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  defining_dimension_pattern_json jsonb
);

create table experiences (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references areas(id) on delete set null,
  city_id uuid references cities(id) on delete cascade,
  name text not null,
  category text,
  price_band text,
  duration_hours numeric(4,1),
  age_suitability text,
  dietary_relevant_flag boolean not null default false,
  is_signature_experience boolean not null default false,
  popularity_score numeric(6,2) not null default 0,
  supplier_bookable_flag boolean not null default false,
  created_at timestamptz not null default now(),
  check (area_id is not null or city_id is not null)
);

create table events (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references areas(id) on delete set null,
  city_id uuid references cities(id) on delete cascade,
  name text not null,
  date_range_or_recurrence text,
  category text,
  price_band text,
  duration_hours numeric(4,1),
  popularity_score numeric(6,2) not null default 0,
  check (area_id is not null or city_id is not null)
);

create table experience_dimension_tags (
  experience_id uuid not null references experiences(id) on delete cascade,
  dimension_tag_id uuid not null references dimension_tags(id) on delete cascade,
  weight numeric(5,2) not null check (weight between 0 and 100),
  primary key (experience_id, dimension_tag_id)
);

create table experience_exclusion_tags (
  experience_id uuid not null references experiences(id) on delete cascade,
  disappointment_tag_id uuid not null references disappointment_tags(id) on delete cascade,
  primary key (experience_id, disappointment_tag_id)
);

create table experience_pairings (
  experience_id_a uuid not null references experiences(id) on delete cascade,
  experience_id_b uuid not null references experiences(id) on delete cascade,
  primary key (experience_id_a, experience_id_b),
  check (experience_id_a <> experience_id_b)
);

create table hotel_categories (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  tier text not null check (tier in ('budget', '3_star', '4_star', '5_star', 'luxury')),
  avg_price_band_per_night numeric(10,2),
  supplier_availability_flag boolean not null default false,
  unique (city_id, tier)
);

-- Backfill the FKs deferred from Domain B, now that dimension_tags and
-- personas exist.
alter table dimension_scores
  add constraint fk_dimension_scores_tag
  foreign key (dimension_tag_id) references dimension_tags(id);

alter table scoring_weights_config
  add constraint fk_scoring_weights_tag
  foreign key (dimension_tag_id) references dimension_tags(id);

alter table persona_classification_rules
  add constraint fk_persona_rules_persona
  foreign key (resulting_persona_id) references personas(id);
