// I cibi NON stanno nel codice (il repo è pubblico): vivono nella tabella Supabase `foods`, leggibile solo da utenti loggati (vedi supabase.sql).
// Valori per la PORZIONE indicata nel nome.
// id/own: presenti solo per i cibi della tabella generale (own = aggiunto da te, quindi cancellabile).
export type Preset = { name: string; kcal: number; f: number; c: number; p: number; id?: number; own?: boolean };

export const hasFood = (foods: Preset[], name: string) => { const n = norm(name.trim()); return foods.some(x => norm(x.name) === n); };

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Tutte le parole cercate devono comparire nel nome (ignora accenti e maiuscole). */
export function searchFoods(foods: Preset[], q: string, max = 30): Preset[] {
  const w = norm(q).split(/\s+/).filter(Boolean);
  if (!w.length) return [];
  return foods.filter(x => { const n = norm(x.name); return w.every(t => n.includes(t)); }).slice(0, max);
}
