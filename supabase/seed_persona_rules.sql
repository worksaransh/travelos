insert into persona_classification_rules (rule_order, condition_logic, resulting_persona_id) values
  (1, '{"field": "occasion", "operator": "equals", "value": "Business"}'::jsonb, 'f6a13315-aae1-4a95-9079-8e4de8dc7f93'::uuid),
  (2, '{"and": [{"field": "occasion", "operator": "in", "value": ["Honeymoon", "Anniversary"]}, {"field": "romance_adjacent_high", "operator": "equals", "value": true}]}'::jsonb, '0f5cc41a-7c81-4718-a5e7-71ce034e7bcb'::uuid),
  (3, '{"and": [{"field": "group_type", "operator": "equals", "value": "family"}, {"field": "adventure_culture_dominate", "operator": "equals", "value": false}]}'::jsonb, '69f90c75-4a33-410c-b3b3-e3a58dd37032'::uuid),
  (4, '{"and": [{"field": "luxury_score", "operator": "gt", "value": 70}, {"field": "budget_persona", "operator": "in", "value": ["Value-Conscious", "Strict"]}]}'::jsonb, '2caa72da-fcc0-43c6-a247-168d0368218c'::uuid),
  (5, '{"top_dimensions": ["Relaxation", "Nature"]}'::jsonb, 'c34e9e2d-93f6-4b6f-a593-d44d61de41cb'::uuid),
  (6, '{"top_dimensions": ["Adventure", "Nature"]}'::jsonb, 'd0b29e3a-24fb-4533-88b9-980e843e6664'::uuid),
  (7, '{"top_dimensions": ["Culture", "Local Experiences", "Photography"]}'::jsonb, '9f2675d6-3c83-4578-8399-22a35dd45145'::uuid),
  (8, '{"and": [{"field": "top_dimensions", "operator": "contains", "value": "Luxury"}, {"field": "budget_persona", "operator": "equals", "value": "Flexible"}]}'::jsonb, 'a8eb2a05-f013-4988-ab3f-bba5b9c37a8c'::uuid),
  (9, '{"top_dimensions": ["Nightlife", "Shopping"]}'::jsonb, '47a4b73c-6e4b-4498-a7a0-5f173b2f4117'::uuid),
  (10, '{"top_dimensions": ["Food", "Local Experiences"]}'::jsonb, '7b7e977e-5c1e-4dcc-8418-e508021b588f'::uuid),
  (11, '{"and": [{"field": "top_dimensions", "operator": "contains", "value": "Local Experiences"}, {"field": "hidden_gems", "operator": "equals", "value": "yes"}]}'::jsonb, '102e547f-df8f-416e-ad18-97a980d797d4'::uuid),
  (12, '{"fallback": true}'::jsonb, '1445e5ad-d782-4fea-a9c8-e9de367b3014'::uuid)
on conflict (rule_order) do update set 
  condition_logic = excluded.condition_logic,
  resulting_persona_id = excluded.resulting_persona_id;
