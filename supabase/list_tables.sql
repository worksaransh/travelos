-- Verify tables exist and what tables we have
select table_name from information_schema.tables where table_schema = 'public';
