'use client';
import { useEffect, useRef } from 'react';
import { BASE } from './brand';
import { ls } from './store';

// Promemoria per bere. Niente server: i controlli girano nel browser finché l'app è aperta (anche in background su PC,
// o PWA installata finché il sistema non la sospende). Impostazioni per dispositivo, solo in localStorage.
export type Rem = { on: boolean; from: string; to: string; every: number }; // every = minuti
export const REM_DEFAULT: Rem = { on: false, from: '08:00', to: '21:30', every: 90 };

export const getRem = (): Rem => ({ ...REM_DEFAULT, ...ls.get<Partial<Rem>>('reminders', {}) });
export const setRem = (r: Rem) => { try { ls.set('reminders', r); } catch { /* storage bloccato */ } };
export const canNotify = () => typeof window !== 'undefined' && 'Notification' in window;
const stamp = (k: 'lastdrink' | 'lastremind') => { try { ls.set(k, Date.now()); } catch { /* storage bloccato */ } };
export const markDrink = () => stamp('lastdrink');
export const markRemind = () => stamp('lastremind');

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };

export async function notify(title: string, body: string) {
  const opts: NotificationOptions = { body, icon: `${BASE}/icon-192.png`, badge: `${BASE}/icon-192.png`, tag: 'acqua' };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) return void (await reg.showNotification(title, opts)); // su Android serve il service worker
  } catch { /* ripiega su Notification */ }
  new Notification(title, opts);
}

/** Controlla ogni 30 s (e al ritorno sull'app): se è ora di bere e l'obiettivo non è raggiunto, manda la notifica. */
export function useWaterReminders(state: () => { water: number; goal: number } | null) {
  const ref = useRef(state);
  ref.current = state;
  useEffect(() => {
    const tick = () => {
      const s = getRem();
      if (!s.on || !canNotify() || Notification.permission !== 'granted') return;
      if (document.visibilityState === 'visible' && document.hasFocus()) return; // ci stai guardando: nessuna notifica
      const st = ref.current();
      if (!st || st.water >= st.goal) return;
      const n = new Date(), mins = n.getHours() * 60 + n.getMinutes();
      if (mins < toMin(s.from) || mins > toMin(s.to)) return;
      const last = Math.max(ls.get('lastdrink', 0), ls.get('lastremind', 0));
      if (Date.now() - last < s.every * 60000) return;
      markRemind();
      notify('Ora di bere', `Mancano ${st.goal - st.water} ml per oggi. Un bicchiere d'acqua?`).catch(() => {});
    };
    tick();
    const id = setInterval(tick, 30000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, []);
}
