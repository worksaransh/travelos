-- Domain A: Identity & Access — JourneyOS_Phase6_Database_Architecture.md §6.2

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text unique,                -- WhatsApp number
  email text unique,
  lifecycle_stage text not null default 'lead'
    check (lifecycle_stage in (
      'lead','profiled','engaged','itinerary_generated',
      'booking_intent','booked','completed_trip','returning'
    )),
  consent_status text not null default 'none'
    check (consent_status in ('none','gate1_whatsapp','gate2_full')),
  current_dna_profile_id uuid,      -- FK added in 002 once travel_dna_profiles exists
  created_at timestamptz not null default now(),
  deleted_at timestamptz            -- soft delete — Phase 6 §6.3
);

create table agents (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  contact_info text,
  active_status boolean not null default true,
  fulfillment_capacity_per_month integer,
  created_at timestamptz not null default now()
);

create table admins (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role_type text not null check (role_type in ('admin', 'super_admin', 'content_editor')),
  permissions_scope jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

create table role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);
