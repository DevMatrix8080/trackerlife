'use client';
import { useEffect, useState } from 'react';
import Auth from '@/components/Auth';
import Today from '@/components/Today';
import History from '@/components/History';
import WaterYear from '@/components/WaterYear';
import Foods from '@/components/Foods';
import Photos from '@/components/Photos';
import Profile from '@/components/Profile';
import Weight from '@/components/Weight';
import Week from '@/components/Week';
import Backup from '@/components/Backup';
import AppSettings from '@/components/AppSettings';
import ThemeToggle from '@/components/ThemeToggle';
import { Camera, Drop, Dumbbell, History as HistoryIcon, List, Logout, User } from '@/components/Icons';
import { Data, ls, loadData, today, waterGoal } from '@/lib/store';
import { BRAND } from '@/lib/brand';
import { useWaterReminders } from '@/lib/reminders';
import { addFood, delFood, logout, onUser, pull, pullFoods, push } from '@/lib/cloud';
import type { Preset } from '@/lib/foods';
import { vt } from '@/lib/motion';

export default function Page() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [foods, setFoods] = useState<Preset[]>([]);
  const [date, setDate] = useState(today());
  const [tab, setTab] = useState<'today' | 'history' | 'foods' | 'photos' | 'weight' | 'profile'>('today');

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

  useWaterReminders(() => {
    if (!data) return null;
    const d = data.days[today()];
    return { water: d?.water ?? 0, goal: waterGoal(today(), d?.train ?? false).ml };
  });

  // Tabella generale dei cibi (Supabase). Ritornano un messaggio d'errore oppure null.
  const saveGeneral = async (p: Preset) => {
    try {
      const saved = await addFood(p);
      setFoods(f => [...f, saved].sort((a, b) => a.name.localeCompare(b.name, 'it')));
      return null;
    } catch { return "Non riesco a salvare: sei offline? Hai eseguito l'aggiornamento in fondo a supabase.sql?"; }
  };
  const delGeneral = async (p: Preset) => {
    if (p.id == null) return null;
    try { await delFood(p.id); setFoods(f => f.filter(x => x.id !== p.id)); return null; } catch { return 'Non riesco a eliminare'; }
  };

  if (!ready) return null;
  if (!user) return <Auth />;
  if (!data) return null;

  const all = [...(data.custom ?? []), ...foods];

  return (
    <div className="app">
      <header className="top">
        <div className="brand"><Drop size={28} /><span>{BRAND.a}<b>{BRAND.b}</b></span></div>
        <div className="top-actions">
          <span className="user">{user}</span>
          <ThemeToggle />
          <button className="icon-btn" aria-label="Esci" onClick={logout}><Logout /></button>
        </div>
      </header>

      <nav className="tabs" aria-label="Sezioni">
        {([['today', Drop, 'Giornata'], ['history', HistoryIcon, 'Cronologia'], ['foods', List, 'Cibi'], ['photos', Camera, 'Foto'], ['weight', Dumbbell, 'Peso'], ['profile', User, 'Profilo']] as const).map(([k, Icon, l]) => (
          <button key={k} className="tab" aria-current={tab === k ? 'page' : undefined} onClick={() => vt(() => setTab(k))}><Icon />{l}</button>
        ))}
      </nav>

      {tab === 'today' && <Today foods={all} data={data} date={date} setDate={setDate} update={update} onSaveGeneral={saveGeneral} />}
      {tab === 'history' && <><Week data={data} /><WaterYear data={data} /><History data={data} open={d => vt(() => { setDate(d); setTab('today'); })} /></>}
      {tab === 'foods' && <Foods foods={foods} custom={data.custom ?? []} update={update} onSaveGeneral={saveGeneral} onDelGeneral={delGeneral} />}
      {tab === 'photos' && <Photos data={data} update={update} />}
      {tab === 'weight' && <Weight data={data} update={update} />}
      {tab === 'profile' && <div className="stack"><Profile data={data} update={update} /><AppSettings /><Backup data={data} /></div>}
    </div>
  );
}
