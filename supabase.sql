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

-- Cibi personali: leggibili SOLO da utenti loggati, mai scrivibili dal client.
-- I dati vanno caricati a mano con supabase-foods.sql (file locale, NON nel repo).
create table if not exists public.foods (
  id serial primary key,
  name text not null,
  kcal numeric not null, f numeric not null, c numeric not null, p numeric not null
);
alter table public.foods enable row level security;
create policy foods_read on public.foods for select to authenticated using (true);
revoke all on public.foods from anon;
revoke insert, update, delete on public.foods from authenticated;

-- Permessi per l'API (servono perché "Grant API access to new tables automatically" è disattivato).
grant usage on schema public to authenticated;
grant select, insert, update on public.user_data to authenticated;
grant select on public.foods to authenticated;
grant usage, select on sequence public.foods_id_seq to authenticated;
