// I cibi NON stanno nel codice (il repo è pubblico): vivono nella tabella Supabase `foods`, leggibile solo da utenti loggati (vedi supabase.sql).
// Valori per la PORZIONE indicata nel nome.
export type Preset = { name: string; kcal: number; f: number; c: number; p: number };

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Tutte le parole cercate devono comparire nel nome (ignora accenti e maiuscole). */
export function searchFoods(foods: Preset[], q: string, max = 30): Preset[] {
  const w = norm(q).split(/\s+/).filter(Boolean);
  if (!w.length) return [];
  return foods.filter(x => { const n = norm(x.name); return w.every(t => n.includes(t)); }).slice(0, max);
}
