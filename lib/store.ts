import type { Preset } from './foods';
import type { Profile } from './tdee';

export const MEALS = [['colazione', 'Colazione'], ['spuntino_m', 'Spuntino mattina'], ['pranzo', 'Pranzo'], ['spuntino_p', 'Spuntino pomeriggio'], ['cena', 'Cena']] as const;
export type Meal = (typeof MEALS)[number][0];
export type Food = { name: string; g: number; kcal: number; p: number; c: number; f: number; meal?: Meal };
// wtag: giorno "flessibile" (obiettivo acqua non raggiunto per un motivo noto); wnote: nota libera sull'idratazione.
export const WTAGS = [['flex', 'Giorno flessibile'], ['sick', 'Malattia'], ['trip', 'Viaggio'], ['busy', 'Imprevisto']] as const;
export type Day = { water: number; train: boolean; foods: Food[]; closed?: boolean; wtag?: string; wnote?: string };
// vault: salt + prova ("ok" cifrato) per verificare la passphrase delle foto. Mai la passphrase.
export type Data = { days: Record<string, Day>; kgoal: number; fmax: number; profile?: Profile; custom?: Preset[]; vault?: { salt: string; check: string };
  body?: Record<string, { w: number; waist?: number }>; meals?: { name: string; foods: Food[] }[] };

export const ls = {
  get<T>(k: string, d: T): T {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; }
  },
  set(k: string, v: unknown) { localStorage.setItem(k, JSON.stringify(v)); },
};

export const today = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD
export const r1 = (n: number) => Math.round(n * 10) / 10;
export const emptyDay = (): Day => ({ water: 0, train: false, foods: [] });
export const loadData = (user: string): Data => ({ kgoal: 2500, fmax: 60, ...ls.get('data:' + user, { days: {} }) });

// Acqua: allenamento 3000; altrimenti estate (giu-set) 3000, inverno 2500
export function waterGoal(date: string, train: boolean) {
  const m = new Date(date + 'T12:00').getMonth();
  if (train) return { ml: 3000, why: 'Giorno di allenamento' };
  return m >= 5 && m <= 8 ? { ml: 3000, why: 'Periodo estivo' } : { ml: 2500, why: 'Periodo invernale' };
}

export const totals = (foods: Food[]) =>
  foods.reduce((a, f) => ({ kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f }), { kcal: 0, p: 0, c: 0, f: 0 });

export const shiftDate = (date: string, n: number) => { const d = new Date(date + 'T12:00'); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv'); };

// Quante volte hai mangiato ogni cibo (nome senza il prefisso "2× "): ordina "più usati" e ricerche.
export function freq(d: Data) {
  const m = new Map<string, number>();
  for (const day of Object.values(d.days)) for (const f of day.foods) { const k = f.name.replace(/^[d.,]+×s*/, ''); m.set(k, (m.get(k) ?? 0) + 1); }
  return m;
}
