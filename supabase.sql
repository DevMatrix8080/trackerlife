-- Incolla tutto in Supabase > SQL Editor > Run.
create table if not exists public.user_data (
  id uuid primary key references auth.users(id) on delete cascade,
  d jsonb not null check (
    jsonb_typeof(d) = 'object'
    and d ?& array['days', 'kgoal', 'fmax']
    and jsonb_typeof(d->'days') = 'object'
    and pg_column_size(d) < 2000000
  ),
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

-- Ognuno vede e scrive SOLO la propria riga. Nessuna policy di delete: non si cancella.
create policy own_select on public.user_data for select to authenticated using (auth.uid() = id);
create policy own_insert on public.user_data for insert to authenticated with check (auth.uid() = id);
create policy own_update on public.user_data for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Gli anonimi non toccano la tabella.
revoke all on public.user_data from anon;
