import { createClient } from '@supabase/supabase-js';
import type { Data } from './store';
import type { Preset } from './foods';
import { PW_MIN, pwStrong } from './password';

// Config Supabase: URL e anon key sono pubbliche per design, la sicurezza sta nelle policy RLS (supabase.sql).
const sb = createClient('https://glrbznulnsvcivaagtsk.supabase.co', 'sb_publishable_sEa_EyV9ciIsnvnuiitLcA_3HXM6ili');

const NAME_OK = /^[a-z0-9_.-]{3,20}$/;
const email = (n: string) => `${n}@mylife.app`; // email finta: Supabase vuole un'email, l'utente usa solo il nome

const ERR: Record<string, string> = {
  user_already_exists: 'Utente già esistente',
  invalid_credentials: 'Credenziali errate',
  over_request_rate_limit: 'Troppi tentativi. Riprova più tardi',
  weak_password: 'Password troppo debole',
};

/** Ritorna un messaggio d'errore, oppure null se ok. */
export async function authenticate(rawName: string, pw: string, signup: boolean): Promise<string | null> {
  const name = rawName.trim().toLowerCase();
  if (!NAME_OK.test(name)) return 'Nome utente: 3-20 caratteri (lettere, numeri, _ . -)';
  if (!pw || pw.length > 200) return 'Password non valida';
  if (signup && !pwStrong(pw)) return `Password troppo debole: almeno ${PW_MIN} caratteri e 3 requisiti su 4`;
  try {
    const { data, error } = signup
      ? await sb.auth.signUp({ email: email(name), password: pw })
      : await sb.auth.signInWithPassword({ email: email(name), password: pw });
    if (error) return ERR[error.code ?? ''] ?? (error.status === 0 ? 'Nessuna connessione' : 'Errore, riprova');
    return data.session ? null : 'Registrazione non completata: in Supabase disattiva "Confirm email"';
  } catch {
    return 'Nessuna connessione';
  }
}

/** Chiama cb con il nome utente (o null) subito e a ogni cambio di sessione; ritorna l'unsubscribe. */
export const onUser = (cb: (u: string | null) => void) => {
  const { data } = sb.auth.onAuthStateChange((_e, s) => cb(s?.user.email ? s.user.email.split('@')[0] : null));
  return () => data.subscription.unsubscribe();
};

// Al logout si cancellano cache dati e residui del vecchio login locale: su un dispositivo condiviso non resta nulla.
export const logout = () => {
  try { Object.keys(localStorage).filter(k => /^(data:|foods$|users$|session$|locks$)/.test(k)).forEach(k => localStorage.removeItem(k)); } catch { /* storage bloccato */ }
  return sb.auth.signOut();
};

export const pull = async () => {
  const { data, error } = await sb.from('user_data').select('d').maybeSingle(); // RLS: ritorna solo la riga dell'utente
  if (error) throw error;
  return data?.d as Data | undefined;
};

export const push = async (d: Data) => {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('no session');
  const { error } = await sb.from('user_data').upsert({ id: session.user.id, d, updated_at: new Date().toISOString() });
  if (error) throw error;
};

/** Cibi personali: protetti da RLS, rispondono solo a utenti loggati. Cache locale per l'offline (cancellata al logout). */
export const pullFoods = async (): Promise<Preset[]> => {
  const { data, error } = await sb.from('foods').select('name,kcal,f,c,p').order('name');
  if (error) throw error;
  try { localStorage.setItem('foods', JSON.stringify(data)); } catch { /* storage bloccato */ }
  return data as Preset[];
};
