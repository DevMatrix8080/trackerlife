'use client';
import { useEffect, useRef, useState } from 'react';
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

const TABS = [['today', Drop, 'Giornata'], ['history', HistoryIcon, 'Cronologia'], ['foods', List, 'Cibi'], ['photos', Camera, 'Foto'], ['weight', Dumbbell, 'Peso'], ['profile', User, 'Profilo']] as const;
type Tab = (typeof TABS)[number][0];
// Dove NON far partire lo swipe tra pagine: tabelle scorrevoli, campi, elenchi, grafici (hanno il loro gesto).
const NO_SWIPE = '.scroll,input,textarea,select,.foodlist,svg,.noswipe,[role="slider"]';

export default function Page() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [foods, setFoods] = useState<Preset[]>([]);
  const [date, setDate] = useState(today());
  const [tab, setTab] = useState<Tab>('today');
  const touch = useRef<{ x: number; y: number } | null>(null);

  // Cambia pagina con direzione (la transizione scorre da destra se vai avanti, da sinistra se torni indietro).
  const goTab = (k: Tab) => {
    const dir = TABS.findIndex(t => t[0] === k) - TABS.findIndex(t => t[0] === tab);
    if (!dir) return;
    const root = document.documentElement;
    root.dataset.dir = dir > 0 ? 'next' : 'prev';
    const t = vt(() => setTab(k));
    (t ? t.finished : Promise.resolve()).finally(() => { delete root.dataset.dir; });
    window.scrollTo({ top: 0 });
  };
  const swipe = (dx: number) => { const i = TABS.findIndex(t => t[0] === tab) + (dx < 0 ? 1 : -1); if (TABS[i]) goTab(TABS[i][0]); };
  // La scheda attiva resta visibile nella barra scorrevole.
  useEffect(() => { document.querySelector('.tab[aria-current]')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }, [tab, user, data]);

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
        {TABS.map(([k, Icon, l]) => (
          <button key={k} className="tab" aria-current={tab === k ? 'page' : undefined} onClick={() => goTab(k)}><Icon />{l}</button>
        ))}
      </nav>

      <main className="pages"
        onTouchStart={e => { const t = e.touches[0]; touch.current = (e.target as HTMLElement).closest(NO_SWIPE) ? null : { x: t.clientX, y: t.clientY }; }}
        onTouchEnd={e => {
          const s = touch.current; touch.current = null;
          if (!s) return;
          const t = e.changedTouches[0], dx = t.clientX - s.x, dy = t.clientY - s.y;
          if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) swipe(dx);
        }}>
      {tab === 'today' && <Today foods={all} data={data} date={date} setDate={setDate} update={update} onSaveGeneral={saveGeneral} />}
      {tab === 'history' && <><Week data={data} /><WaterYear data={data} /><History data={data} open={d => vt(() => { setDate(d); setTab('today'); })} /></>}
      {tab === 'foods' && <Foods foods={foods} custom={data.custom ?? []} update={update} onSaveGeneral={saveGeneral} onDelGeneral={delGeneral} />}
      {tab === 'photos' && <Photos data={data} update={update} />}
      {tab === 'weight' && <Weight data={data} update={update} />}
      {tab === 'profile' && <div className="stack"><Profile data={data} update={update} /><AppSettings /><Backup data={data} /></div>}
      </main>
    </div>
  );
}
