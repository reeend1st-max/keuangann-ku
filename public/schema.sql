-- ═══════════════════════════════════════════════════════════════════════════
-- Keuangan Ku — Supabase Database Schema
-- ═══════════════════════════════════════════════════════════════════════════
-- HOW TO USE:
--   1. Open your Supabase project dashboard → SQL Editor
--   2. Paste this entire file → click "Run"
--   3. Done — tables + security policies are created in one go
--
-- Authentication is handled entirely by Supabase Auth (auth.users table,
-- built-in). We only need to create the data tables below, each linked to
-- auth.users via user_id, with Row Level Security (RLS) so every user can
-- only ever see/edit their own rows — enforced by the database itself,
-- not just by application code.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── MONTHS ─────────────────────────────────────────────────────────────────
create table if not exists public.months (
  id         text primary key,              -- e.g. "2026-05"
  user_id    uuid not null references auth.users(id) on delete cascade,
  year       integer not null,
  month      integer not null,              -- 0-indexed (0=Jan ... 11=Dec)
  label      text not null,                 -- e.g. "Mei 2026"
  created_at timestamptz not null default now(),
  unique (user_id, year, month)
);

alter table public.months enable row level security;

create policy "months_select_own" on public.months
  for select using (auth.uid() = user_id);
create policy "months_insert_own" on public.months
  for insert with check (auth.uid() = user_id);
create policy "months_update_own" on public.months
  for update using (auth.uid() = user_id);
create policy "months_delete_own" on public.months
  for delete using (auth.uid() = user_id);

-- ── EXPENSES ───────────────────────────────────────────────────────────────
create table if not exists public.expenses (
  id         text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  month_id   text not null,
  year       integer not null,
  month      integer not null,
  tanggal    text not null,                 -- DD/MM/YYYY as displayed
  keperluan  text not null,
  kategori   text not null,
  nominal    bigint not null,
  bayar      text not null,
  nw         text not null,                 -- "Need" | "Want"
  catatan    text default '',
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;

create policy "expenses_select_own" on public.expenses
  for select using (auth.uid() = user_id);
create policy "expenses_insert_own" on public.expenses
  for insert with check (auth.uid() = user_id);
create policy "expenses_update_own" on public.expenses
  for update using (auth.uid() = user_id);
create policy "expenses_delete_own" on public.expenses
  for delete using (auth.uid() = user_id);

create index if not exists idx_expenses_user on public.expenses(user_id);

-- ── INCOME ─────────────────────────────────────────────────────────────────
create table if not exists public.income (
  id         text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  month_id   text not null,
  year       integer not null,
  month      integer not null,
  tanggal    text not null,
  sumber     text not null,
  nominal    bigint not null,
  metode     text not null,
  catatan    text default '',
  created_at timestamptz not null default now()
);

alter table public.income enable row level security;

create policy "income_select_own" on public.income
  for select using (auth.uid() = user_id);
create policy "income_insert_own" on public.income
  for insert with check (auth.uid() = user_id);
create policy "income_update_own" on public.income
  for update using (auth.uid() = user_id);
create policy "income_delete_own" on public.income
  for delete using (auth.uid() = user_id);

create index if not exists idx_income_user on public.income(user_id);

-- ── SAVINGS (Tabungan) ─────────────────────────────────────────────────────
create table if not exists public.savings (
  id         text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  tipe       text not null,                 -- "setoran" | "penarikan"
  tanggal    text not null,
  nominal    bigint not null,
  catatan    text default '',
  created_at timestamptz not null default now()
);

alter table public.savings enable row level security;

create policy "savings_select_own" on public.savings
  for select using (auth.uid() = user_id);
create policy "savings_insert_own" on public.savings
  for insert with check (auth.uid() = user_id);
create policy "savings_update_own" on public.savings
  for update using (auth.uid() = user_id);
create policy "savings_delete_own" on public.savings
  for delete using (auth.uid() = user_id);

create index if not exists idx_savings_user on public.savings(user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- Done! Every table above is locked down with Row Level Security so that
-- even if someone obtained the public anon key (which is meant to be public
-- and is safe to expose in frontend code), they still could not read or
-- write another user's rows — Postgres itself enforces `auth.uid() = user_id`
-- on every query, automatically, no matter what the client sends.
-- ═══════════════════════════════════════════════════════════════════════════
