export type Food = { name: string; g: number; kcal: number; p: number; c: number; f: number };
export type Day = { water: number; train: boolean; foods: Food[]; closed?: boolean };
export type Data = { days: Record<string, Day>; kgoal: number; fmax: number };

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
