'use client';
import { useEffect, useState } from 'react';
import { BASE } from './brand';

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let deferred: InstallEvent | null = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach(f => f());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e as InstallEvent; emit(); });
  window.addEventListener('appinstalled', () => { deferred = null; emit(); });
}

export const isStandalone = () =>
  typeof window !== 'undefined' && (matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
export const isIOS = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);

/** Registra il service worker (solo in produzione: in sviluppo la cache darebbe fastidio). */
export function registerSW() {
  if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register(`${BASE}/sw.js`, { scope: `${BASE}/` }).catch(() => {});
}

/** Stato dell'installazione: `can` = il browser offre l'installazione, `install()` mostra la richiesta. */
export function useInstall() {
  const [, tick] = useState(0);
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    setStandalone(isStandalone());
    const f = () => tick(n => n + 1);
    subs.add(f);
    return () => { subs.delete(f); };
  }, []);
  return {
    standalone,
    can: !!deferred && !standalone,
    ios: isIOS() && !standalone,
    install: async () => { if (!deferred) return; await deferred.prompt(); await deferred.userChoice; deferred = null; emit(); },
  };
}
