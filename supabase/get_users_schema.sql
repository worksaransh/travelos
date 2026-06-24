-- Check columns in users table
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'users'
order by ordinal_position;
