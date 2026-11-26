'use client';
import { useState } from 'react';
import { authenticate } from '@/lib/cloud';
import { pwChecks, pwScore } from '@/lib/password';
import ThemeToggle from './ThemeToggle';
import { BRAND } from '@/lib/brand';

const LABELS = ['', 'Debole', 'Discreta', 'Buona', 'Ottima'];

export default function Auth() {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const score = pwScore(p);

  async function go(signup: boolean) {
    setBusy(true);
    const e = await authenticate(u, p, signup);
    setBusy(false);
    if (e) setErr(e); // al successo onUser in page.tsx apre l'app
  }

  return (
    <main className="auth">
      <div className="hero">
        <div className="row" style={{ justifyContent: 'space-between' }}><span /><ThemeToggle /></div>
        <div className="word">{BRAND.a}<b>{BRAND.b}</b></div>
        <div className="ruler" />
        <p>{BRAND.tagline}</p>
      </div>
      <form className="panel" onSubmit={e => { e.preventDefault(); go(false); }}>
        <h2>Accedi</h2>
        <div className="rule-xl" />
        <div className="authform">
          <input className="field" placeholder="Nome utente" autoComplete="username" value={u} onChange={e => setU(e.target.value)} />
          <div className="pwrow">
            <input className="field" type={show ? 'text' : 'password'} placeholder={`Password (min 10 per creare l'account)`} autoComplete="current-password" value={p} onChange={e => setP(e.target.value)} />
            <button type="button" className="pwshow" onClick={() => setShow(s => !s)} aria-pressed={show}>{show ? 'Nascondi' : 'Mostra'}</button>
          </div>

          <div className={'pwmeter' + (p ? ' on' : '')} data-s={score} aria-live="polite">
            <div className="pwbars"><i /><i /><i /><i /></div>
            <span className="pwlabel">{LABELS[score] || 'Troppo corta'}</span>
            <ul className="pwlist">
              {pwChecks(p).map(c => <li key={c.label} className={c.ok ? 'ok' : ''}><b aria-hidden>{c.ok ? '✓' : '·'}</b>{c.label}</li>)}
            </ul>
          </div>

          <div className="err" role="alert">{err}</div>
          <button className="finish" type="submit" disabled={busy} style={{ marginTop: 0 }}>Accedi</button>
          <button className="finish sec" type="button" disabled={busy} onClick={() => go(true)} style={{ marginTop: 0, height: 52, fontSize: '1.3rem' }}>Crea account</button>
        </div>
        <p className="note">Account e dati si sincronizzano su tutti i tuoi dispositivi.</p>
      </form>
    </main>
  );
}
