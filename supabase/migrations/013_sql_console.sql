-- Migration 013: SQL Console RPC
-- Adds read-only SQL execution utility for the admin database console

CREATE OR REPLACE FUNCTION execute_read_only_sql(sql_query text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result jsonb;
BEGIN
  -- Security double-check: only SELECT queries are permitted
  IF lower(trim(sql_query)) NOT LIKE 'select%' THEN
    RAISE EXCEPTION 'Forbidden statement. Only SELECT statements are permitted.';
  END IF;
  
  EXECUTE 'SELECT jsonb_agg(t) FROM (' || sql_query || ') t' INTO result;
  RETURN coalesce(result, '[]'::jsonb);
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;
