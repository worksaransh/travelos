-- Indexes — Postgres does not automatically index foreign key columns
-- (only primary keys get one for free). Phase 6 §6's risk notes explicitly
-- flag the junction tables on the recommendation hot path as needing both
-- FK columns indexed from day one, before content volume makes it a
-- problem. Extended sensibly to other frequently-joined FKs across the
-- schema.

-- Junction tables (Phase 6 risk: hot path for recommendation matching)
create index idx_exp_dim_tags_tag on experience_dimension_tags (dimension_tag_id);
create index idx_exp_exclusion_tags_tag on experience_exclusion_tags (disappointment_tag_id);
create index idx_exp_pairings_b on experience_pairings (experience_id_b);

-- Knowledge Graph traversal (Country -> City -> Area -> Experience/Event)
create index idx_cities_country on cities (country_id);
create index idx_areas_city on areas (city_id);
create index idx_experiences_area on experiences (area_id);
create index idx_experiences_city on experiences (city_id);
create index idx_events_area on events (area_id);
create index idx_events_city on events (city_id);
create index idx_hotel_categories_city on hotel_categories (city_id);
create index idx_flight_routes_city on flight_routes (city_id);

-- Travel DNA
create index idx_dna_profiles_user on travel_dna_profiles (user_id);
create index idx_dimension_scores_profile on dimension_scores (profile_id);
create index idx_questionnaire_responses_profile on questionnaire_responses (profile_id);
create index idx_implicit_signals_profile on implicit_signals (profile_id);
create index idx_dna_history_profile on travel_dna_history (profile_id);

-- Itinerary & Booking (agent/admin daily-use query paths)
create index idx_itineraries_user on itineraries (user_id);
create index idx_itinerary_days_itinerary on itinerary_days (itinerary_id);
create index idx_itinerary_items_day on itinerary_items (itinerary_day_id);
create index idx_itinerary_items_experience on itinerary_items (experience_id);
create index idx_destination_recs_user on destination_recommendations (user_id);
create index idx_destination_recs_city on destination_recommendations (city_id);
create index idx_bookings_itinerary on bookings (itinerary_id);
create index idx_bookings_agent on bookings (agent_id);
create index idx_payments_booking on payments (booking_id);
create index idx_leads_user on leads (user_id);

-- Audit & approval queue (admin panel list views)
create index idx_audit_log_actor on audit_log (actor_id);
create index idx_content_queue_status on content_approval_queue (status);
