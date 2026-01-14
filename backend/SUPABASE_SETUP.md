# Supabase Database Setup

This guide will help you set up all the required database tables in your Supabase project.

## Steps to Set Up Tables

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the **SQL Editor** (left sidebar)

2. **Run the Schema Script**
   - Open the file `backend/supabase_schema.sql`
   - Copy the entire contents
   - Paste it into the SQL Editor in Supabase
   - Click **Run** (or press Cmd/Ctrl + Enter)

3. **Verify Tables Were Created**
   - Go to **Table Editor** in the Supabase dashboard
   - You should see all these tables:
     - `users`
     - `sports`
     - `goals`
     - `user_sports`
     - `user_goals`
     - `user_photos`
     - `events`
     - `event_rsvps`
     - `buddies`
     - `posts`
     - `likes`
     - `messages`
     - `group_chats`
     - `group_members`
     - `subscriptions`
     - `waitlist_entries`

4. **Refresh PostgREST Schema Cache (IMPORTANT!)**
   - After creating tables, PostgREST (Supabase's API layer) needs to refresh its schema cache
   - Go to **Settings** → **API** in your Supabase dashboard
   - Scroll down to find **"Reload Schema"** or **"Refresh Schema"** button
   - Click it to refresh the schema cache
   - Alternatively, wait 10-30 seconds for automatic refresh
   - If you still get "table not found" errors, try:
     - Go to **Database** → **Tables** → Click on a table → **API** tab
     - This will expose the table via the API

## Optional: Seed Initial Data

After creating the tables, you may want to seed some initial data (sports, goals, etc.). You can run this in the SQL Editor:

```sql
-- Insert some common sports
INSERT INTO sports (name, icon) VALUES
('Running', '🏃'),
('Cycling', '🚴'),
('Swimming', '🏊'),
('Basketball', '🏀'),
('Soccer', '⚽'),
('Tennis', '🎾'),
('Yoga', '🧘'),
('Weightlifting', '🏋️'),
('Rock Climbing', '🧗'),
('Pickleball', '🏓'),
('Volleyball', '🏐'),
('Baseball', '⚾'),
('Golf', '⛳'),
('Hiking', '🥾'),
('CrossFit', '💪')
ON CONFLICT (name) DO NOTHING;

-- Insert goals (8 total)
INSERT INTO goals (name, description) VALUES
('Meet a workout partner', 'Find someone to exercise with regularly'),
('Discover fitness events', 'Find and attend local fitness events'),
('Dating', 'Meet potential romantic partners through fitness'),
('Weight Loss', 'Lose weight and burn calories'),
('Muscle Gain', 'Build muscle and strength'),
('Cardio Fitness', 'Improve cardiovascular health'),
('General Health', 'Maintain overall health and wellness'),
('Social Connection', 'Meet people and build community')
ON CONFLICT (name) DO NOTHING;
```

## Troubleshooting

### Error: "type already exists"
If you get an error about ENUM types already existing, you can either:
1. Drop and recreate them (be careful if you have data):
   ```sql
   DROP TYPE IF EXISTS user_role CASCADE;
   DROP TYPE IF EXISTS buddy_status CASCADE;
   DROP TYPE IF EXISTS rsvp_status CASCADE;
   DROP TYPE IF EXISTS subscription_tier CASCADE;
   ```
   Then run the schema script again.

2. Or modify the script to use `CREATE TYPE IF NOT EXISTS` (though PostgreSQL doesn't support this directly, you may need to check first).

### Error: "relation already exists"
If tables already exist, the `CREATE TABLE IF NOT EXISTS` statements should handle this gracefully. However, if you need to start fresh:
1. **WARNING**: This will delete all data!
   ```sql
   -- Drop all tables (in reverse dependency order)
   DROP TABLE IF EXISTS waitlist_entries CASCADE;
   DROP TABLE IF EXISTS subscriptions CASCADE;
   DROP TABLE IF EXISTS group_members CASCADE;
   DROP TABLE IF EXISTS group_chats CASCADE;
   DROP TABLE IF EXISTS messages CASCADE;
   DROP TABLE IF EXISTS likes CASCADE;
   DROP TABLE IF EXISTS posts CASCADE;
   DROP TABLE IF EXISTS buddies CASCADE;
   DROP TABLE IF EXISTS event_rsvps CASCADE;
   DROP TABLE IF EXISTS events CASCADE;
   DROP TABLE IF EXISTS user_photos CASCADE;
   DROP TABLE IF EXISTS user_goals CASCADE;
   DROP TABLE IF EXISTS user_sports CASCADE;
   DROP TABLE IF EXISTS goals CASCADE;
   DROP TABLE IF EXISTS sports CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   ```
2. Then run the schema script again.

### Error: "Could not find the table 'public.users' in the schema cache" (PGRST205)
This means PostgREST (Supabase's API) can't see your tables. Try these steps:

1. **Refresh the Schema Cache:**
   - Go to **Settings** → **API** in Supabase dashboard
   - Look for **"Reload Schema"** or **"Refresh Schema"** button and click it
   - Wait 10-30 seconds

2. **Verify Tables are in Public Schema:**
   - Run this in SQL Editor to check:
   ```sql
   SELECT table_schema, table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'users';
   ```
   - If it returns a row, the table exists in public schema

3. **Manually Expose Tables:**
   - Go to **Database** → **Tables** in Supabase dashboard
   - Click on the `users` table
   - Go to the **API** tab
   - This will ensure the table is exposed via the API

4. **Check Permissions:**
   - Run this in SQL Editor to grant permissions:
   ```sql
   GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
   GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
   GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
   ```

5. **Restart PostgREST (if you have access):**
   - Sometimes the API service needs a restart
   - This usually happens automatically, but you can try waiting a minute or two

## Next Steps

After setting up the tables:
1. Make sure your `.env.local` files are configured with the correct Supabase credentials
2. Test the backend connection by running the backend server
3. Try creating a user account through the frontend
