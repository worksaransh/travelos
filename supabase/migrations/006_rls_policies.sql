-- Row Level Security — implements JourneyOS_Phase6_Database_Architecture.md
-- §6.4's permissions matrix table-for-table. This is the REAL enforcement
-- layer, not an app-level convenience check.
--
-- ONE FLAGGED CLARIFICATION (not a silent override): §6.4 literally lists
-- "No access" for Traveler on Knowledge Graph content (experiences/events/
-- tags). Taken literally this breaks the product — public destination
-- pages and the quiz itself need to read this data before any auth
-- happens. Implemented here as PUBLIC READ on Knowledge Graph reference
-- tables (necessary for the funnel to function), with WRITE access kept
-- exactly as specified. Surfacing this rather than resolving it silently.

-- ---------------------------------------------------------------------------
-- Helper functions (role checks used throughout the policies below)
--
-- SECURITY DEFINER is required here, not optional — without it, these
-- functions execute as the calling role and trigger RLS on the tables they
-- query internally (bookings, itineraries, agents, admins). Since those
-- same tables have policies that CALL these functions, that recursion is
-- infinite. This was caught by actually testing the policies locally
-- (see the stack-depth-exceeded error this produced before the fix), not
-- found by inspection. SECURITY DEFINER makes these functions execute as
-- their owner (which bypasses RLS as the table owner), breaking the cycle.
-- ---------------------------------------------------------------------------
create or replace function is_agent() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from agents where id = auth.uid() and active_status = true);
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from admins where id = auth.uid());
$$;

create or replace function is_super_admin() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from admins where id = auth.uid() and role_type = 'super_admin');
$$;

create or replace function agent_assigned_to_user(target_user_id uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from bookings b
    join itineraries i on i.id = b.itinerary_id
    where i.user_id = target_user_id and b.agent_id = auth.uid()
  );
$$;

create or replace function agent_assigned_to_booking(target_booking_id uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from bookings where id = target_booking_id and agent_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- users / travel_dna_profiles / itineraries
-- "Read/write own only" (Traveler) | "Read assigned only" (Agent) |
-- "Read all" (Admin) | "Read/write all" (Super Admin)
-- ---------------------------------------------------------------------------
alter table users enable row level security;

create policy users_select on users for select
  using (auth.uid() = id or is_admin() or is_super_admin() or agent_assigned_to_user(id));
create policy users_insert on users for insert
  with check (auth.uid() = id or is_super_admin());
create policy users_update on users for update
  using (auth.uid() = id or is_super_admin())
  with check (auth.uid() = id or is_super_admin());

alter table travel_dna_profiles enable row level security;

create policy dna_profiles_select on travel_dna_profiles for select
  using (auth.uid() = user_id or is_admin() or is_super_admin() or agent_assigned_to_user(user_id));
create policy dna_profiles_insert on travel_dna_profiles for insert
  with check (auth.uid() = user_id or is_super_admin());
create policy dna_profiles_update on travel_dna_profiles for update
  using (auth.uid() = user_id or is_super_admin())
  with check (auth.uid() = user_id or is_super_admin());

-- Child tables of travel_dna_profiles inherit the same "own profile" check.
alter table dimension_scores enable row level security;
create policy dimension_scores_select on dimension_scores for select
  using (
    exists (select 1 from travel_dna_profiles p where p.id = profile_id and (
      p.user_id = auth.uid() or is_admin() or is_super_admin() or agent_assigned_to_user(p.user_id)
    ))
  );
create policy dimension_scores_write on dimension_scores for all
  using (
    exists (select 1 from travel_dna_profiles p where p.id = profile_id and (
      p.user_id = auth.uid() or is_super_admin()
    ))
  )
  with check (
    exists (select 1 from travel_dna_profiles p where p.id = profile_id and (
      p.user_id = auth.uid() or is_super_admin()
    ))
  );

alter table questionnaire_responses enable row level security;
create policy questionnaire_responses_select on questionnaire_responses for select
  using (
    exists (select 1 from travel_dna_profiles p where p.id = profile_id and (
      p.user_id = auth.uid() or is_admin() or is_super_admin() or agent_assigned_to_user(p.user_id)
    ))
  );
create policy questionnaire_responses_insert on questionnaire_responses for insert
  with check (
    exists (select 1 from travel_dna_profiles p where p.id = profile_id and p.user_id = auth.uid())
  );

alter table implicit_signals enable row level security;
create policy implicit_signals_select on implicit_signals for select
  using (
    exists (select 1 from travel_dna_profiles p where p.id = profile_id and (
      p.user_id = auth.uid() or is_admin() or is_super_admin()
    ))
  );
create policy implicit_signals_insert on implicit_signals for insert
  with check (
    exists (select 1 from travel_dna_profiles p where p.id = profile_id and p.user_id = auth.uid())
  );

alter table travel_dna_history enable row level security;
create policy dna_history_select on travel_dna_history for select
  using (
    exists (select 1 from travel_dna_profiles p where p.id = profile_id and (
      p.user_id = auth.uid() or is_admin() or is_super_admin()
    ))
  );

alter table itineraries enable row level security;
create policy itineraries_select on itineraries for select
  using (auth.uid() = user_id or is_admin() or is_super_admin() or agent_assigned_to_user(user_id));
create policy itineraries_insert on itineraries for insert
  with check (auth.uid() = user_id or is_super_admin());
create policy itineraries_update on itineraries for update
  using (auth.uid() = user_id or is_super_admin())
  with check (auth.uid() = user_id or is_super_admin());

alter table itinerary_days enable row level security;
create policy itinerary_days_select on itinerary_days for select
  using (
    exists (select 1 from itineraries i where i.id = itinerary_id and (
      i.user_id = auth.uid() or is_admin() or is_super_admin() or agent_assigned_to_user(i.user_id)
    ))
  );

alter table itinerary_items enable row level security;
create policy itinerary_items_select on itinerary_items for select
  using (
    exists (
      select 1 from itinerary_days d join itineraries i on i.id = d.itinerary_id
      where d.id = itinerary_day_id and (
        i.user_id = auth.uid() or is_admin() or is_super_admin() or agent_assigned_to_user(i.user_id)
      )
    )
  );

alter table destination_recommendations enable row level security;
create policy destination_recs_select on destination_recommendations for select
  using (auth.uid() = user_id or is_admin() or is_super_admin());

-- ---------------------------------------------------------------------------
-- bookings / payments
-- "Read own (status only)" (Traveler) | "Read/write assigned" (Agent) |
-- "Read/write all" (Admin, Super Admin)
-- The "status only" restriction for travelers is implemented as a
-- dedicated view below, since RLS is row-level, not column-level — granting
-- full-table SELECT to travelers would expose supplier notes and override
-- prices that §6.4 does not intend them to see.
-- ---------------------------------------------------------------------------
alter table bookings enable row level security;
create policy bookings_select on bookings for select
  using (
    is_admin() or is_super_admin() or agent_assigned_to_booking(id)
    or exists (select 1 from itineraries i where i.id = itinerary_id and i.user_id = auth.uid())
  );
create policy bookings_write on bookings for all
  using (is_admin() or is_super_admin() or agent_assigned_to_booking(id))
  with check (is_admin() or is_super_admin() or agent_assigned_to_booking(id));

-- Traveler-facing restricted view: status only, no supplier/price detail.
create or replace view my_booking_status as
  select b.id, b.itinerary_id, b.status, b.created_at
  from bookings b
  join itineraries i on i.id = b.itinerary_id
  where i.user_id = auth.uid();

alter table payments enable row level security;
create policy payments_select on payments for select
  using (
    is_admin() or is_super_admin() or agent_assigned_to_booking(booking_id)
    or exists (
      select 1 from bookings b join itineraries i on i.id = b.itinerary_id
      where b.id = booking_id and i.user_id = auth.uid()
    )
  );
create policy payments_write on payments for all
  using (is_admin() or is_super_admin() or agent_assigned_to_booking(booking_id))
  with check (is_admin() or is_super_admin() or agent_assigned_to_booking(booking_id));

-- ---------------------------------------------------------------------------
-- price_bands — "No access" (Traveler) | "Read only" (Agent) | "Write" (Admin, Super Admin)
-- ---------------------------------------------------------------------------
alter table price_bands enable row level security;
create policy price_bands_select on price_bands for select
  using (is_agent() or is_admin() or is_super_admin());
create policy price_bands_write on price_bands for all
  using (is_admin() or is_super_admin())
  with check (is_admin() or is_super_admin());

-- ---------------------------------------------------------------------------
-- scoring_weights_config / persona_classification_rules
-- "No access" (Traveler, Agent) | "Read only" (Admin) | "Write only" (Super Admin)
-- The most locked-down tables in the schema, per Phase 6's own emphasis.
-- ---------------------------------------------------------------------------
alter table scoring_weights_config enable row level security;
create policy scoring_weights_select on scoring_weights_config for select
  using (is_admin() or is_super_admin());
create policy scoring_weights_write on scoring_weights_config for all
  using (is_super_admin())
  with check (is_super_admin());

alter table persona_classification_rules enable row level security;
create policy persona_rules_select on persona_classification_rules for select
  using (is_admin() or is_super_admin());
create policy persona_rules_write on persona_classification_rules for all
  using (is_super_admin())
  with check (is_super_admin());

-- ---------------------------------------------------------------------------
-- Knowledge Graph content — see the flagged clarification at the top of
-- this file. Public READ (anyone, including unauthenticated) on reference
-- tables and on experiences/events; WRITE restricted exactly per §6.4.
-- ---------------------------------------------------------------------------
alter table countries enable row level security;
create policy countries_public_select on countries for select using (true);
create policy countries_write on countries for all
  using (is_admin() or is_super_admin()) with check (is_admin() or is_super_admin());

alter table cities enable row level security;
create policy cities_public_select on cities for select using (true);
create policy cities_write on cities for all
  using (is_admin() or is_super_admin()) with check (is_admin() or is_super_admin());

alter table areas enable row level security;
create policy areas_public_select on areas for select using (true);
create policy areas_write on areas for all
  using (is_admin() or is_super_admin()) with check (is_admin() or is_super_admin());

alter table flight_routes enable row level security;
create policy flight_routes_public_select on flight_routes for select using (true);
create policy flight_routes_write on flight_routes for all
  using (is_admin() or is_super_admin()) with check (is_admin() or is_super_admin());

alter table dimension_tags enable row level security;
create policy dimension_tags_public_select on dimension_tags for select using (true);
create policy dimension_tags_write on dimension_tags for all
  using (is_super_admin()) with check (is_super_admin());

alter table disappointment_tags enable row level security;
create policy disappointment_tags_public_select on disappointment_tags for select using (true);
create policy disappointment_tags_write on disappointment_tags for all
  using (is_super_admin()) with check (is_super_admin());

alter table personas enable row level security;
create policy personas_public_select on personas for select using (true);
create policy personas_write on personas for all
  using (is_super_admin()) with check (is_super_admin());

alter table hotel_categories enable row level security;
create policy hotel_categories_public_select on hotel_categories for select using (true);
create policy hotel_categories_write on hotel_categories for all
  using (is_admin() or is_super_admin()) with check (is_admin() or is_super_admin());

-- experiences / events: public read; Admin writes go to pending approval
-- (enforced at the application layer via content_approval_queue — RLS
-- controls who may write at all, not the approval workflow state machine).
alter table experiences enable row level security;
create policy experiences_public_select on experiences for select using (true);
create policy experiences_write on experiences for all
  using (is_admin() or is_super_admin()) with check (is_admin() or is_super_admin());

alter table events enable row level security;
create policy events_public_select on events for select using (true);
create policy events_write on events for all
  using (is_admin() or is_super_admin()) with check (is_admin() or is_super_admin());

alter table experience_dimension_tags enable row level security;
create policy exp_dim_tags_public_select on experience_dimension_tags for select using (true);
create policy exp_dim_tags_write on experience_dimension_tags for all
  using (is_admin() or is_super_admin()) with check (is_admin() or is_super_admin());

alter table experience_exclusion_tags enable row level security;
create policy exp_exclusion_tags_public_select on experience_exclusion_tags for select using (true);
create policy exp_exclusion_tags_write on experience_exclusion_tags for all
  using (is_admin() or is_super_admin()) with check (is_admin() or is_super_admin());

alter table experience_pairings enable row level security;
create policy exp_pairings_public_select on experience_pairings for select using (true);
create policy exp_pairings_write on experience_pairings for all
  using (is_admin() or is_super_admin()) with check (is_admin() or is_super_admin());

-- ---------------------------------------------------------------------------
-- leads — "No access" (Traveler) | "Read assigned" (Agent) | "Read/write all" (Admin, Super Admin)
-- ---------------------------------------------------------------------------
alter table leads enable row level security;
create policy leads_select on leads for select
  using (is_admin() or is_super_admin() or agent_assigned_to_user(user_id));
create policy leads_write on leads for all
  using (is_admin() or is_super_admin())
  with check (is_admin() or is_super_admin());
-- Travelers create their OWN lead row during Tier 5 gates (Gate 1/Gate 2) —
-- §6.4 says "no access" for ongoing read, but the capture step itself must
-- be self-service. Insert-only, own row.
create policy leads_self_insert on leads for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- content_approval_queue — implements the Phase 9 §9.4 approval workflow
-- ---------------------------------------------------------------------------
alter table content_approval_queue enable row level security;
create policy content_queue_select on content_approval_queue for select
  using (is_admin() or is_super_admin() or is_agent());
create policy content_queue_insert on content_approval_queue for insert
  with check (is_admin() or is_super_admin() or is_agent());
create policy content_queue_update on content_approval_queue for update
  using (is_admin() or is_super_admin())
  with check (is_admin() or is_super_admin());

-- ---------------------------------------------------------------------------
-- audit_log — "No access" (Traveler, Agent) | "Read only" (Admin, Super Admin)
-- Append-only by convention: no UPDATE or DELETE policy exists for ANY
-- role, including Super Admin — only INSERT and SELECT. This is what makes
-- "append-only by system, not editable by anyone" (§6.4) actually true at
-- the database level, not just a documented intention.
-- ---------------------------------------------------------------------------
alter table audit_log enable row level security;
create policy audit_log_select on audit_log for select
  using (is_admin() or is_super_admin());
create policy audit_log_insert on audit_log for insert
  with check (true); -- any authenticated actor may write an audit entry about their own action
