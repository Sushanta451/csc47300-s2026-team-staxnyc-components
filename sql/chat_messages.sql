-- Run this in the Supabase SQL editor.
-- Creates the chat_messages table for per-game live chat, with RLS so anyone
-- can read, but only the signed-in author can insert their own row.

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_game_created_idx
  on public.chat_messages (game_id, created_at);

alter table public.chat_messages enable row level security;

-- Public read so unauthenticated visitors can still see the conversation.
drop policy if exists "chat_messages_select_public" on public.chat_messages;
create policy "chat_messages_select_public"
  on public.chat_messages for select
  using (true);

-- Only the signed-in user can insert messages, and only as themselves.
drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own"
  on public.chat_messages for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Realtime: enable on this table so the React client gets INSERT events.
alter publication supabase_realtime add table public.chat_messages;
