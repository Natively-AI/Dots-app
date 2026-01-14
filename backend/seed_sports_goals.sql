-- Seed Sports and Goals for Supabase
-- Run this in your Supabase SQL Editor to populate sports and goals tables

-- Insert Sports (with ON CONFLICT to avoid duplicates)
INSERT INTO public.sports (name, icon) VALUES
('Running', '🏃'),
('Cycling', '🚴'),
('Swimming', '🏊'),
('Weightlifting', '🏋️'),
('Yoga', '🧘'),
('Basketball', '🏀'),
('Soccer', '⚽'),
('Tennis', '🎾'),
('Volleyball', '🏐'),
('Rock Climbing', '🧗'),
('Hiking', '🥾'),
('CrossFit', '💪'),
('Dancing', '💃'),
('Martial Arts', '🥋'),
('Pilates', '🧘‍♀️'),
('Baseball', '⚾'),
('Football', '🏈'),
('Golf', '⛳'),
('Surfing', '🏄'),
('Skiing', '⛷️'),
('Snowboarding', '🏂'),
('Ice Skating', '⛸️'),
('Hockey', '🏒'),
('Rugby', '🏉'),
('Cricket', '🏏'),
('Badminton', '🏸'),
('Table Tennis', '🏓'),
('Pickleball', '🏓'),
('Boxing', '🥊'),
('Wrestling', '🤼'),
('Fencing', '🤺'),
('Gymnastics', '🤸'),
('Skateboarding', '🛹'),
('Roller Skating', '🛼'),
('Rowing', '🚣'),
('Kayaking', '🛶'),
('Canoeing', '🛶'),
('Sailing', '⛵'),
('Diving', '🤿'),
('Triathlon', '🏊‍♂️'),
('Ultimate Frisbee', '🥏'),
('Lacrosse', '🥍'),
('Water Polo', '🤽'),
('Synchronized Swimming', '🤽‍♀️'),
('Archery', '🏹'),
('Shooting', '🎯'),
('Equestrian', '🐴'),
('Polo', '🐎'),
('Racquetball', '🎾'),
('Squash', '🎾')
ON CONFLICT (name) DO NOTHING;

-- Insert Goals (with ON CONFLICT to avoid duplicates)
INSERT INTO public.goals (name, description) VALUES
('Meet a workout partner', 'Find someone to exercise with regularly'),
('Discover fitness events', 'Find and attend local fitness events'),
('Dating', 'Meet potential romantic partners through fitness'),
('Weight Loss', 'Lose weight and burn calories'),
('Muscle Gain', 'Build muscle and strength'),
('Cardio Fitness', 'Improve cardiovascular health'),
('General Health', 'Maintain overall health and wellness'),
('Social Connection', 'Meet people and build community')
ON CONFLICT (name) DO NOTHING;

-- Verify the data was inserted
SELECT COUNT(*) as sports_count FROM public.sports;
SELECT COUNT(*) as goals_count FROM public.goals;
