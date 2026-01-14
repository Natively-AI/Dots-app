-- Quick fix for existing users table
-- Run this if you already created the table and need to make hashed_password nullable

-- Make hashed_password nullable (Supabase Auth handles passwords)
ALTER TABLE public.users ALTER COLUMN hashed_password DROP NOT NULL;

-- Create function to sync users from Supabase Auth (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (email, full_name, age, bio, location, avatar_url, cover_image_url, is_discoverable, profile_completed)
    VALUES (
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        CASE WHEN NEW.raw_user_meta_data->>'age' IS NOT NULL THEN (NEW.raw_user_meta_data->>'age')::INTEGER ELSE NULL END,
        NEW.raw_user_meta_data->>'bio',
        NEW.raw_user_meta_data->>'location',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'cover_image_url',
        COALESCE((NEW.raw_user_meta_data->>'is_discoverable')::BOOLEAN, false),
        COALESCE((NEW.raw_user_meta_data->>'profile_completed')::BOOLEAN, false)
    )
    ON CONFLICT (email) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, users.full_name),
        age = COALESCE(EXCLUDED.age, users.age),
        bio = COALESCE(EXCLUDED.bio, users.bio),
        location = COALESCE(EXCLUDED.location, users.location),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        cover_image_url = COALESCE(EXCLUDED.cover_image_url, users.cover_image_url);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create users when they sign up via Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Fix any existing users that might have NULL hashed_password (should be fine now)
-- This is just to verify the constraint is removed
SELECT email, hashed_password FROM public.users LIMIT 5;
