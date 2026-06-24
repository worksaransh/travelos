-- Domains D, E, F, G — JourneyOS_Phase6_Database_Architecture.md §6.2

-- D. Itinerary & Recommendation
create table itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  dna_snapshot_id uuid references travel_dna_history(id),
  destination_city_id uuid references cities(id),
  status text not null default 'teaser'
    check (status in ('teaser', 'draft', 'confirmed', 'booked')),
  package_tier text check (package_tier in ('essential', 'comfort', 'premium', 'signature')),
  total_price_estimate numeric(12,2),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table itinerary_days (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references itineraries(id) on delete cascade,
  day_number integer not null,
  date date,
  unique (itinerary_id, day_number)
);

create table itinerary_items (
  id uuid primary key default gen_random_uuid(),
  itinerary_day_id uuid not null references itinerary_days(id) on delete cascade,
  experience_id uuid references experiences(id),
  event_id uuid references events(id),
  sequence_order integer not null,
  upsell_flag boolean not null default false,
  check (experience_id is not null or event_id is not null)
);

create table destination_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  city_id uuid not null references cities(id),
  rank integer not null,
  shown_at timestamptz not null default now(),
  dimension_fit_score numeric(5,2)
);

-- E. Booking & Fulfillment (Phase 1: manual)
create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('flight', 'hotel', 'package', 'activity')),
  city_coverage uuid references cities(id),
  contact_info text,
  net_rate_notes text
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references itineraries(id) on delete cascade,
  agent_id uuid references agents(id),
  status text not null default 'sourcing'
    check (status in ('sourcing', 'confirmed', 'issued', 'completed', 'cancelled')),
  supplier_reference_notes text,
  manual_override_price numeric(12,2),
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  amount numeric(12,2) not null,
  currency text not null default 'INR',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refunded', 'failed')),
  payment_method text,
  planning_fee_flag boolean not null default false,
  created_at timestamptz not null default now()
);

create table price_bands (
  id uuid primary key default gen_random_uuid(),
  destination_category text not null,
  tier text not null,
  band_min numeric(12,2) not null,
  band_max numeric(12,2) not null,
  last_updated_by uuid references admins(id),
  updated_at timestamptz not null default now(),
  check (band_max >= band_min)
);

-- F. Lead & Consent
create table leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  capture_gate text not null check (capture_gate in ('gate1_whatsapp', 'gate2_full')),
  whatsapp_number text,
  email text,
  name text,
  preferred_contact_time text,
  consent_given boolean not null default false,
  consent_timestamp timestamptz,
  consent_version text,
  created_at timestamptz not null default now()
);

-- G. Content Ops & Audit
create table content_approval_queue (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  submitted_by uuid,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references admins(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- Append-only by convention: no UPDATE/DELETE grants in the RLS migration.
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_type text not null check (actor_type in ('user', 'agent', 'admin', 'system')),
  action text not null,
  entity_affected text,
  details jsonb,
  occurred_at timestamptz not null default now()
);
