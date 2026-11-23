'use client';
import { useEffect, useState } from 'react';
import Auth from '@/components/Auth';
import Today from '@/components/Today';
import History from '@/components/History';
import ThemeToggle from '@/components/ThemeToggle';
import { Drop, History as HistoryIcon, Logout } from '@/components/Icons';
import { Data, currentUser, ls, loadData, today } from '@/lib/store';

export default function Page() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [date, setDate] = useState(today());
  const [tab, setTab] = useState<'today' | 'history'>('today');

  useEffect(() => { setUser(currentUser()); setReady(true); }, []);
  useEffect(() => { setData(user ? loadData(user) : null); }, [user]);

  const update = (fn: (d: Data) => void) =>
    setData(prev => {
      if (!prev || !user) return prev;
      const next = structuredClone(prev);
      fn(next);
      ls.set('data:' + user, next);
      return next;
    });

  if (!ready) return null;
  if (!user || !data) return <Auth onLogin={setUser} />;

  return (
    <div className="app">
      <header className="top">
        <div className="brand"><Drop size={28} /><span>My<b>Life</b></span></div>
        <div className="top-actions">
          <span className="user">{user}</span>
          <ThemeToggle />
          <button className="icon-btn" aria-label="Esci" onClick={() => { localStorage.removeItem('session'); setUser(null); }}><Logout /></button>
        </div>
      </header>

      <nav className="tabs" aria-label="Sezioni">
        <button className="tab" aria-current={tab === 'today' ? 'page' : undefined} onClick={() => setTab('today')}><Drop />Giornata</button>
        <button className="tab" aria-current={tab === 'history' ? 'page' : undefined} onClick={() => setTab('history')}><HistoryIcon />Cronologia</button>
      </nav>

      {tab === 'today'
        ? <Today data={data} date={date} setDate={setDate} update={update} />
        : <History data={data} open={d => { setDate(d); setTab('today'); }} />}
    </div>
  );
}
