-- ============================================================================
-- LOCAL TESTING ONLY — DO NOT RUN AGAINST A REAL SUPABASE PROJECT.
-- Real Supabase already provides the `auth` schema, `auth.users`, and the
-- `auth.uid()` / `auth.role()` functions natively. This file exists only so
-- the RLS policies below can be written using the EXACT same auth.uid()
-- pattern Supabase uses, and actually tested locally before being applied
-- to a real project unmodified.
-- ============================================================================

create extension if not exists pgcrypto;

create schema if not exists auth;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

-- Mirrors how PostgREST/Supabase expose the JWT's `sub` and `role` claims as
-- session-local settings, then read them back via these functions.
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create or replace function auth.role() returns text
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.role', true), '');
$$;
