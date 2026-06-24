-- Search for lifecycle or stage or consent columns across all tables
select table_name, column_name
from information_schema.columns
where column_name like '%lifecycle%' or column_name like '%stage%' or column_name like '%consent%';
