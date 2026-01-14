-- Add new goals to the database
-- Run this in your Supabase SQL Editor to add the new goals

INSERT INTO goals (name, description) VALUES
('Meet a workout partner', 'Find someone to exercise with regularly'),
('Discover fitness events', 'Find and attend local fitness events'),
('Dating', 'Meet potential romantic partners through fitness')
ON CONFLICT (name) DO NOTHING;

-- Update existing goals to match the new list (optional - only if you want to replace old ones)
-- You can keep existing goals and just add the new ones above, or run this to update:

-- First, let's see what goals exist
-- SELECT id, name, description FROM goals ORDER BY name;

-- If you want to keep only the 8 goals mentioned, you can delete old ones:
-- DELETE FROM goals WHERE name NOT IN (
--   'Meet a workout partner',
--   'Discover fitness events',
--   'Dating',
--   'Weight Loss',
--   'Muscle Gain',
--   'Cardio Fitness',
--   'General Health',
--   'Social Connection'
-- );
