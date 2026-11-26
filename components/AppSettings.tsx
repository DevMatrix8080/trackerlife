'use client';
import { useEffect, useState } from 'react';
import { useInstall } from '@/lib/pwa';
import { Rem, canNotify, getRem, markRemind, notify, setRem } from '@/lib/reminders';
import { Download } from './Icons';

export default function AppSettings() {
  const inst = useInstall();
  const [r, setR] = useState<Rem>(getRem);
  const [perm, setPerm] = useState<NotificationPermission | 'none'>('none');
  useEffect(() => { setPerm(canNotify() ? Notification.permission : 'none'); }, []);
  const save = (n: Rem) => { setR(n); setRem(n); };

  async function toggle(on: boolean) {
    if (!on) return save({ ...r, on: false });
    let p: NotificationPermission = canNotify() ? Notification.permission : 'denied';
    if (p === 'default') p = await Notification.requestPermission();
    setPerm(p);
    if (p === 'granted') { markRemind(); save({ ...r, on: true }); }
  }

  return (
    <section className="card form" style={{ maxWidth: 560 }} aria-labelledby="h-app">
      <h2 id="h-app">App e promemoria</h2>

      <div className="result">
        <b>Installa l&apos;app</b>
        {inst.standalone && <span>Già installata su questo dispositivo.</span>}
        {inst.can && <button className="btn" onClick={inst.install}><Download />Installa</button>}
        {inst.ios && <span>Su iPhone/iPad: tocca <b>Condividi</b> e poi <b>Aggiungi a Home</b>.</span>}
        {!inst.standalone && !inst.can && !inst.ios && <span>Dal menu del browser scegli <b>Installa app</b> (o <b>Aggiungi a schermata Home</b>).</span>}
      </div>

      <label className="switch">
        <input type="checkbox" role="switch" checked={r.on && perm === 'granted'} disabled={perm === 'none'} onChange={e => toggle(e.target.checked)} />
        <span className="track" />
        Ricordami di bere
      </label>
      {perm === 'none' && <div className="muted">Questo browser non supporta le notifiche (su iPhone installa prima l&apos;app).</div>}
      {perm === 'denied' && <div className="err">Notifiche bloccate: riabilitale dalle impostazioni del sito nel browser.</div>}

      {r.on && perm === 'granted' && <>
        <div className="grid3">
          <label>Dalle<input className="input" type="time" value={r.from} onChange={e => save({ ...r, from: e.target.value || r.from })} /></label>
          <label>Alle<input className="input" type="time" value={r.to} onChange={e => save({ ...r, to: e.target.value || r.to })} /></label>
          <label>Ogni
            <select className="input" value={r.every} onChange={e => save({ ...r, every: +e.target.value })}>
              {[45, 60, 90, 120, 180].map(m => <option key={m} value={m}>{m} min</option>)}
            </select></label>
        </div>
        <button className="btn sec" onClick={() => notify('Ora di bere', "Così appariranno i promemoria. Un bicchiere d'acqua?").catch(() => {})}>Prova notifica</button>
      </>}
      <div className="muted">Il promemoria arriva solo se non hai bevuto da un po&apos; e l&apos;obiettivo del giorno non è raggiunto. Funziona mentre l&apos;app è aperta o in background; se il telefono chiude del tutto l&apos;app, le notifiche si fermano finché non la riapri.</div>
    </section>
  );
}
