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
type User = { salt: string; h: string; it?: number };
type Lock = { n: number; until: number };
const IT_NEW = 600000, IT_OLD = 200000; // OWASP: >=600k per PBKDF2-SHA256; gli account vecchi restano a 200k
const NAME_OK = /^[a-z0-9_.-]{3,20}$/;
// Blocca __proto__ & co: i nomi utente sono chiavi di un oggetto (prototype pollution).
const own = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
const unb64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));

async function hash(pw: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256));
}

/** Sessione valida solo se l'utente esiste davvero (un valore manomesso in localStorage non entra). */
export function currentUser(): string | null {
  const s = ls.get<string | null>('session', null);
  const users = ls.get<Record<string, User>>('users', {});
  return typeof s === 'string' && NAME_OK.test(s) && own(users, s) ? s : null;
}

/** Ritorna un messaggio d'errore, oppure null se ok (e salva la sessione). */
// shortcut: il blocco anti brute-force vive nel browser; ferma i tentativi dalla UI, non chi ha accesso alla console. Per una difesa vera serve un server.
export async function authenticate(rawName: string, pw: string, signup: boolean): Promise<string | null> {
  const name = rawName.trim().toLowerCase();
  if (!NAME_OK.test(name) || ['__proto__', 'constructor', 'prototype'].includes(name)) return 'Nome utente: 3-20 caratteri (lettere, numeri, _ . -)';
  if (pw.length < 6 || pw.length > 200) return 'Password tra 6 e 200 caratteri';

  const locks = ls.get<Record<string, Lock>>('locks', {});
  const lk = own(locks, name) ? locks[name] : undefined;
  if (lk && lk.until > Date.now()) return `Troppi tentativi. Riprova tra ${Math.ceil((lk.until - Date.now()) / 1000)} secondi`;

  const users = ls.get<Record<string, User>>('users', {});
  if (signup) {
    if (own(users, name)) return 'Utente già esistente';
    const salt = crypto.getRandomValues(new Uint8Array(16));
    users[name] = { salt: b64(salt.buffer), h: await hash(pw, salt, IT_NEW), it: IT_NEW };
    ls.set('users', users);
  } else {
    const u = own(users, name) ? users[name] : undefined;
    // Si calcola l'hash anche per utenti inesistenti: stesso tempo di risposta, niente enumerazione.
    const h = await hash(pw, u ? unb64(u.salt) : new Uint8Array(16), u?.it ?? IT_OLD);
    if (!u || h !== u.h) {
      const n = (lk?.n ?? 0) + 1;
      locks[name] = { n, until: n >= 5 ? Date.now() + Math.min(3_600_000, 30_000 * 2 ** (n - 5)) : 0 };
      ls.set('locks', locks);
      return 'Credenziali errate';
    }
    if (lk) { delete locks[name]; ls.set('locks', locks); }
  }
  ls.set('session', name);
  return null;
}
