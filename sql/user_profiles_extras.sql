-- Run this in the Supabase SQL editor.
-- Adds age, favorite team, and favorite player columns to the existing
-- user_profiles table. Idempotent — safe to run more than once.

alter table public.user_profiles
  add column if not exists age int check (age between 1 and 120),
  add column if not exists favorite_team text,
  add column if not exists favorite_player text;
