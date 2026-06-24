-- Get table schemas for itineraries, itinerary_days, itinerary_items, leads, and users/travel_dna_profiles
select column_name, data_type, is_nullable
from information_schema.columns
where table_name in ('itineraries', 'itinerary_days', 'itinerary_items', 'leads', 'travel_dna_profiles')
order by table_name, ordinal_position;
