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

/* ---- auth: PBKDF2 + salt, tutto nel browser ---- */
// shortcut: senza server gli account esistono solo in questo browser; per sync serve un backend.
const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
async function hash(pw: string, salt: Uint8Array<ArrayBuffer>) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 200000 }, key, 256));
}

/** Ritorna un messaggio d'errore, oppure null se ok (e salva la sessione). */
export async function authenticate(rawName: string, pw: string, signup: boolean): Promise<string | null> {
  const name = rawName.trim().toLowerCase();
  if (!/^[a-z0-9_.-]{3,20}$/.test(name)) return 'Nome utente: 3-20 caratteri (lettere, numeri, _ . -)';
  if (pw.length < 6) return 'Password di almeno 6 caratteri';
  const users = ls.get<Record<string, { salt: string; h: string }>>('users', {});
  if (signup) {
    if (users[name]) return 'Utente già esistente';
    const salt = crypto.getRandomValues(new Uint8Array(16));
    users[name] = { salt: b64(salt.buffer), h: await hash(pw, salt) };
    ls.set('users', users);
  } else {
    const u = users[name];
    if (!u || (await hash(pw, Uint8Array.from(atob(u.salt), c => c.charCodeAt(0)))) !== u.h) return 'Credenziali errate';
  }
  ls.set('session', name);
  return null;
}
