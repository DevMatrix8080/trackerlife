'use client';
import { useEffect, useState } from 'react';
import Auth from '@/components/Auth';
import Today from '@/components/Today';
import History from '@/components/History';
import ThemeToggle from '@/components/ThemeToggle';
import { Drop, History as HistoryIcon, Logout } from '@/components/Icons';
import { Data, ls, loadData, today } from '@/lib/store';
import { logout, onUser, pull, pullFoods, push } from '@/lib/cloud';
import type { Preset } from '@/lib/foods';
import { vt } from '@/lib/motion';

export default function Page() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [foods, setFoods] = useState<Preset[]>([]);
  const [date, setDate] = useState(today());
  const [tab, setTab] = useState<'today' | 'history'>('today');

  useEffect(() => onUser(u => { setUser(u); setReady(true); }), []);
  useEffect(() => {
    setData(null); setFoods([]);
    if (!user) return;
    pullFoods().then(setFoods, () => setFoods(ls.get<Preset[]>('foods', [])));
    let alive = true;
    const local = loadData(user); // cache locale: offline o prima sincronizzazione
    pull().then(
      remote => {
        if (!alive) return;
        if (remote) { const d = { ...local, ...remote }; ls.set('data:' + user, d); setData(d); }
        else { push(local).catch(() => {}); setData(local); } // primo accesso: carica i dati già presenti in questo browser
      },
      () => alive && setData(local),
    );
    return () => { alive = false; };
  }, [user]);

  const update = (fn: (d: Data) => void) =>
    setData(prev => {
      if (!prev || !user) return prev;
      const next = structuredClone(prev);
      fn(next);
      ls.set('data:' + user, next);
      push(next).catch(() => {}); // shortcut: errore di rete ignorato, la cache locale tiene i dati; al prossimo salvataggio si risincronizza
      return next;
    });

  if (!ready) return null;
  if (!user) return <Auth />;
  if (!data) return null;

  return (
    <div className="app">
      <header className="top">
        <div className="brand"><Drop size={28} /><span>My<b>Life</b></span></div>
        <div className="top-actions">
          <span className="user">{user}</span>
          <ThemeToggle />
          <button className="icon-btn" aria-label="Esci" onClick={logout}><Logout /></button>
        </div>
      </header>

      <nav className="tabs" aria-label="Sezioni">
        <button className="tab" aria-current={tab === 'today' ? 'page' : undefined} onClick={() => vt(() => setTab('today'))}><Drop />Giornata</button>
        <button className="tab" aria-current={tab === 'history' ? 'page' : undefined} onClick={() => vt(() => setTab('history'))}><HistoryIcon />Cronologia</button>
      </nav>

      {tab === 'today'
        ? <Today foods={foods} data={data} date={date} setDate={setDate} update={update} />
        : <History data={data} open={d => vt(() => { setDate(d); setTab('today'); })} />}
    </div>
  );
}
