// Mifflin-St Jeor: BMR x livello di attività = TDEE; poi correzione per l'obiettivo.
export type Profile = { sex: 'm' | 'f'; age: number; h: number; w: number; act: number; goal: 'cut' | 'maint' | 'bulk'; weeks: number; start: string };

export const ACT: [number, string][] = [
  [1.2, 'Sedentario (poco o nessun movimento)'], [1.375, 'Leggero (1-3 allenamenti a settimana)'], [1.55, 'Moderato (3-5 allenamenti)'],
  [1.725, 'Intenso (6-7 allenamenti)'], [1.9, 'Molto intenso (atleta / lavoro fisico)'],
];
export const GOALS = {
  cut: { label: 'Definizione (cut)', adj: -0.2 },
  maint: { label: 'Mantenimento', adj: 0 },
  bulk: { label: 'Massa (bulk)', adj: 0.1 },
};
export const PROTEIN_PER_KG = 1.6;

export const tdee = (p: Profile) => Math.round((10 * p.w + 6.25 * p.h - 5 * p.age + (p.sex === 'm' ? 5 : -161)) * p.act);
export const target = (p: Profile) => Math.max(1200, Math.round(tdee(p) * (1 + GOALS[p.goal].adj)));
export const proteinGoal = (p: Profile) => Math.round(p.w * PROTEIN_PER_KG);
export const daysLeft = (p: Profile) => Math.ceil((new Date(p.start + 'T12:00').getTime() + p.weeks * 7 * 864e5 - Date.now()) / 864e5);
