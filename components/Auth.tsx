'use client';
import { useState } from 'react';
import { authenticate } from '@/lib/store';
import ThemeToggle from './ThemeToggle';

export default function Auth({ onLogin }: { onLogin: (u: string) => void }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function go(signup: boolean) {
    setBusy(true);
    const e = await authenticate(u, p, signup);
    setBusy(false);
    if (e) setErr(e); else onLogin(u.trim().toLowerCase());
  }

  return (
    <main className="auth">
      <div className="hero">
        <div className="row" style={{ justifyContent: 'space-between' }}><span /><ThemeToggle /></div>
        <div className="word">My<b>Life</b></div>
        <div className="ruler" />
        <p>Acqua. Calorie. Macro.</p>
      </div>
      <form className="panel" onSubmit={e => { e.preventDefault(); go(false); }}>
        <h2>Accedi</h2>
        <div className="rule-xl" />
        <div className="authform">
          <input className="field" placeholder="Nome utente" autoComplete="username" value={u} onChange={e => setU(e.target.value)} />
          <input className="field" type="password" placeholder="Password (min 6 caratteri)" autoComplete="current-password" value={p} onChange={e => setP(e.target.value)} />
          <div className="err" role="alert">{err}</div>
          <button className="finish" type="submit" disabled={busy} style={{ marginTop: 0 }}>Accedi</button>
          <button className="finish sec" type="button" disabled={busy} onClick={() => go(true)} style={{ marginTop: 0, height: 52, fontSize: '1.3rem' }}>Crea account</button>
        </div>
        <p className="note">I dati restano salvati in questo browser.</p>
      </form>
    </main>
  );
}
