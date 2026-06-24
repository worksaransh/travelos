-- Clean up first
truncate table scoring_weights_config cascade;
truncate table persona_classification_rules cascade;

-- Seed scoring weights
-- Luxury
insert into scoring_weights_config (dimension_tag_id, weight_component, weight_value)
  select id, 'slider_input', 0.50 from dimension_tags where dimension_name = 'Luxury'
  union all select id, 'hotel_category_pref', 0.30 from dimension_tags where dimension_name = 'Luxury'
  union all select id, 'budget_band', 0.10 from dimension_tags where dimension_name = 'Luxury'
  union all select id, 'implicit_signal', 0.10 from dimension_tags where dimension_name = 'Luxury';

-- Other 9 dimensions
insert into scoring_weights_config (dimension_tag_id, weight_component, weight_value)
  select id, 'slider_input', 0.80 from dimension_tags where dimension_name in ('Adventure', 'Shopping', 'Food', 'Nature', 'Nightlife', 'Culture', 'Photography', 'Relaxation', 'Local Experiences')
  union all select id, 'implicit_signal', 0.20 from dimension_tags where dimension_name in ('Adventure', 'Shopping', 'Food', 'Nature', 'Nightlife', 'Culture', 'Photography', 'Relaxation', 'Local Experiences');

-- Seed classification rules
insert into persona_classification_rules (rule_order, condition_logic, resulting_persona_id)
  select 1, '{"field": "occasion", "operator": "equals", "value": "Business"}'::jsonb, id from personas where name = 'The Corporate Quick-Tripper'
  union all select 2, '{"and": [{"field": "occasion", "operator": "in", "value": ["Honeymoon", "Anniversary"]}, {"field": "romance_adjacent_high", "operator": "equals", "value": true}]}'::jsonb, id from personas where name = 'The Romantic'
  union all select 3, '{"and": [{"field": "group_type", "operator": "equals", "value": "family"}, {"field": "adventure_culture_dominate", "operator": "equals", "value": false}]}'::jsonb, id from personas where name = 'The Family Memory Maker'
  union all select 4, '{"and": [{"field": "luxury_score", "operator": "gt", "value": 60}, {"field": "budget_persona", "operator": "in", "value": ["Value-Conscious", "Strict"]}]}'::jsonb, id from personas where name = 'The Aspirational Dreamer'
  union all select 5, '{"top_dimensions": ["Relaxation", "Nature"]}'::jsonb, id from personas where name = 'The Relaxed Escapist'
  union all select 6, '{"top_dimensions": ["Adventure", "Nature"]}'::jsonb, id from personas where name = 'The Adventure Maximalist'
  union all select 7, '{"top_dimensions": ["Culture", "Local Experiences", "Photography"]}'::jsonb, id from personas where name = 'The Cultural Immersive'
  union all select 8, '{"and": [{"field": "top_dimensions", "operator": "contains", "value": "Luxury"}, {"field": "budget_persona", "equals": "Flexible"}]}'::jsonb, id from personas where name = 'The Luxury Indulger'
  union all select 9, '{"top_dimensions": ["Nightlife", "Shopping"]}'::jsonb, id from personas where name = 'The Social Explorer'
  union all select 10, '{"top_dimensions": ["Food", "Local Experiences"]}'::jsonb, id from personas where name = 'The Foodie Wanderer'
  union all select 11, '{"and": [{"field": "top_dimensions", "operator": "contains", "value": "Local Experiences"}, {"field": "hidden_gems", "operator": "equals", "value": "yes"}]}'::jsonb, id from personas where name = 'The Hidden-Gem Hunter'
  union all select 12, '{"fallback": true}'::jsonb, id from personas where name = 'The Practical Planner';
