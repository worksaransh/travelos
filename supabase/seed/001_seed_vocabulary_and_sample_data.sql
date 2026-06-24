-- Seed data — the shared vocabulary tables MUST be seeded before anything
-- else can be tagged against them. Matches JourneyOS_Phase5_Travel_DNA_System.md
-- §5.1/§5.3 (10 dimensions) and JourneyOS_Phase7_Knowledge_Graph_Architecture.md
-- §7.3 (5 disappointment tags) and §7.4 (the worked Singapore example) exactly.

-- The 10 personality dimensions (fixed vocabulary, shared between traveler
-- scoring and experience tagging — this is the literal mechanism that makes
-- matching possible at all).
insert into dimension_tags (dimension_name) values
  ('Luxury'), ('Adventure'), ('Shopping'), ('Food'), ('Nature'),
  ('Nightlife'), ('Culture'), ('Photography'), ('Relaxation'), ('Local Experiences');

-- The 5 disappointment tags (fixed vocabulary, hard-exclusion filter).
insert into disappointment_tags (tag_name) values
  ('Crowds'), ('Long Travel Time'), ('Expensive Activities'),
  ('Poor Hotels'), ('Too Much Walking');

-- Travel Personas — Phase 5 §5.4's named decision-tree outcomes.
insert into personas (name, description, defining_dimension_pattern_json) values
  ('The Relaxed Escapist', 'Relaxation + Nature dominant', '{"top_dimensions": ["Relaxation", "Nature"]}'),
  ('The Adventure Maximalist', 'Adventure + Nature dominant', '{"top_dimensions": ["Adventure", "Nature"]}'),
  ('The Cultural Immersive', 'Culture + Local Experiences + Photography dominant', '{"top_dimensions": ["Culture", "Local Experiences", "Photography"]}'),
  ('The Luxury Indulger', 'Luxury dominant, flexible budget', '{"top_dimensions": ["Luxury"]}'),
  ('The Social Explorer', 'Nightlife + Shopping dominant', '{"top_dimensions": ["Nightlife", "Shopping"]}'),
  ('The Foodie Wanderer', 'Food + Local Experiences dominant', '{"top_dimensions": ["Food", "Local Experiences"]}'),
  ('The Hidden-Gem Hunter', 'Local Experiences high, opted into hidden gems', '{"top_dimensions": ["Local Experiences"]}'),
  ('The Romantic', 'Honeymoon/Anniversary occasion override', '{"occasion_override": ["Honeymoon", "Anniversary"]}'),
  ('The Family Memory Maker', 'Family group override', '{"group_override": ["Family"]}'),
  ('The Aspirational Dreamer', 'High Luxury score, budget-constrained', '{"budget_pattern_override": true}'),
  ('The Corporate Quick-Tripper', 'Business occasion override', '{"occasion_override": ["Business"]}'),
  ('The Practical Planner', 'Flat/low-variance score profile (fallback)', '{"fallback": true}');

-- The worked Singapore example from Phase 7 §7.4.
insert into countries (id, name, region, visa_policy_default, currency, supplier_coverage_status, domestic_flag)
  values ('c0000000-0000-0000-0000-000000000001', 'Singapore', 'Southeast Asia', 'Easy Visa', 'SGD', 'active', false);

insert into cities (id, country_id, name, weather_profile_json, avg_cost_index, supplier_coverage_status)
  values ('c1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Singapore',
    '{"profile": "tropical", "best_months": ["Feb","Mar","Apr"]}', 72.5, 'active');

insert into flight_routes (city_id, departure_city, avg_flight_duration_hours, layover_typical_flag) values
  ('c1000000-0000-0000-0000-000000000001', 'Delhi', 6.0, false),
  ('c1000000-0000-0000-0000-000000000001', 'Mumbai', 5.5, false),
  ('c1000000-0000-0000-0000-000000000001', 'Bangalore', 4.5, false);

insert into areas (id, city_id, name, vibe_tags) values
  ('a0000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Sentosa Island', array['family-friendly','beach']),
  ('a0000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Marina Bay', array['luxury','nightlife-dense']),
  ('a0000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Orchard Road', array['shopping']);

insert into experiences (id, area_id, name, category, price_band, is_signature_experience, popularity_score, supplier_bookable_flag) values
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Universal Studios Singapore', 'Theme Parks', 'high', true, 95, true),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Beach Clubs (Sentosa)', 'Beaches', 'medium', true, 70, true),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Marina Bay Sands', 'Luxury Hotels', 'high', true, 98, true),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Gardens by the Bay', 'Nature', 'medium', true, 92, true),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'Orchard Road Shopping', 'Shopping Malls', 'medium', true, 80, true);

-- Dimension tagging per the Phase 7 §7.4 worked example exactly.
insert into experience_dimension_tags (experience_id, dimension_tag_id, weight)
  select 'e0000000-0000-0000-0000-000000000001'::uuid, id, 75 from dimension_tags where dimension_name = 'Adventure'
  union all select 'e0000000-0000-0000-0000-000000000001'::uuid, id, 60 from dimension_tags where dimension_name = 'Photography'
  union all select 'e0000000-0000-0000-0000-000000000001'::uuid, id, 20 from dimension_tags where dimension_name = 'Culture'
  union all select 'e0000000-0000-0000-0000-000000000002'::uuid, id, 70 from dimension_tags where dimension_name = 'Relaxation'
  union all select 'e0000000-0000-0000-0000-000000000002'::uuid, id, 40 from dimension_tags where dimension_name = 'Nightlife'
  union all select 'e0000000-0000-0000-0000-000000000003'::uuid, id, 90 from dimension_tags where dimension_name = 'Luxury'
  union all select 'e0000000-0000-0000-0000-000000000003'::uuid, id, 80 from dimension_tags where dimension_name = 'Photography'
  union all select 'e0000000-0000-0000-0000-000000000003'::uuid, id, 50 from dimension_tags where dimension_name = 'Nightlife'
  union all select 'e0000000-0000-0000-0000-000000000004'::uuid, id, 65 from dimension_tags where dimension_name = 'Nature'
  union all select 'e0000000-0000-0000-0000-000000000004'::uuid, id, 85 from dimension_tags where dimension_name = 'Photography'
  union all select 'e0000000-0000-0000-0000-000000000004'::uuid, id, 40 from dimension_tags where dimension_name = 'Relaxation'
  union all select 'e0000000-0000-0000-0000-000000000005'::uuid, id, 95 from dimension_tags where dimension_name = 'Shopping'
  union all select 'e0000000-0000-0000-0000-000000000005'::uuid, id, 55 from dimension_tags where dimension_name = 'Luxury';

insert into experience_exclusion_tags (experience_id, disappointment_tag_id)
  select 'e0000000-0000-0000-0000-000000000001'::uuid, id from disappointment_tags where tag_name in ('Crowds', 'Long Travel Time');

insert into hotel_categories (city_id, tier, avg_price_band_per_night, supplier_availability_flag) values
  ('c1000000-0000-0000-0000-000000000001', '3_star', 6000, true),
  ('c1000000-0000-0000-0000-000000000001', '4_star', 12000, true),
  ('c1000000-0000-0000-0000-000000000001', '5_star', 22000, true),
  ('c1000000-0000-0000-0000-000000000001', 'luxury', 35000, false);

-- A starting set of scoring weights (Phase 5 §5.3's worked Luxury Score
-- example) — placeholders per Phase 12's master checklist, NOT validated
-- against real data yet.
insert into scoring_weights_config (dimension_tag_id, weight_component, weight_value)
  select id, 'slider_input', 0.50 from dimension_tags where dimension_name = 'Luxury'
  union all select id, 'hotel_category_pref', 0.30 from dimension_tags where dimension_name = 'Luxury'
  union all select id, 'budget_band', 0.10 from dimension_tags where dimension_name = 'Luxury'
  union all select id, 'implicit_signal', 0.10 from dimension_tags where dimension_name = 'Luxury';

-- A starting price band (Phase 1's admin-controlled bands, Phase 6 price_bands table).
insert into price_bands (destination_category, tier, band_min, band_max) values
  ('Singapore', 'Comfort', 80000, 130000),
  ('Singapore', 'Premium', 130000, 220000);
