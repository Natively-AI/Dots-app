-- Quick fix for "table not found" errors in Supabase
-- Run this if you're getting PGRST205 errors

-- Ensure we're in the public schema
SET search_path TO public;

-- Grant all necessary permissions to PostgREST roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- Verify tables exist in public schema
SELECT 
    table_schema, 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'sports', 'goals', 'user_sports', 'user_goals',
    'user_photos', 'events', 'event_rsvps', 'buddies', 'posts',
    'likes', 'messages', 'group_chats', 'group_members',
    'subscriptions', 'waitlist_entries'
)
ORDER BY table_name;
