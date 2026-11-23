'use client';
import { useState } from 'react';
import { Data, today } from '@/lib/store';
import { ACT, GOALS, Profile as P, daysLeft, proteinGoal, target, tdee } from '@/lib/tdee';

const init: P = { sex: 'm', age: 25, h: 175, w: 70, act: 1.55, goal: 'maint', weeks: 12, start: '' };

export default function Profile({ data, update }: { data: Data; update: (fn: (d: Data) => void) => void }) {
  const [p, setP] = useState<P>(data.profile ?? init);
  const ok = p.age > 10 && p.h > 100 && p.w > 30 && p.weeks > 0;
  const num = (k: 'age' | 'h' | 'w' | 'weeks') => (e: React.ChangeEvent<HTMLInputElement>) => setP({ ...p, [k]: +e.target.value });
  const saved = data.profile;
  const left = saved && daysLeft(saved);

  return (
    <section className="card form" style={{ maxWidth: 560 }} aria-labelledby="h-prof">
      <h2 id="h-prof">Il tuo profilo</h2>
      <label>Sesso
        <select className="input" value={p.sex} onChange={e => setP({ ...p, sex: e.target.value as P['sex'] })}>
          <option value="m">Maschio</option><option value="f">Femmina</option>
        </select></label>
      <div className="grid3">
        <label>Età<input className="input" type="number" inputMode="numeric" value={p.age || ''} onChange={num('age')} /></label>
        <label>Altezza (cm)<input className="input" type="number" inputMode="numeric" value={p.h || ''} onChange={num('h')} /></label>
        <label>Peso (kg)<input className="input" type="number" inputMode="decimal" step={0.1} value={p.w || ''} onChange={num('w')} /></label>
      </div>
      <label>Livello di attività (TDEE)
        <select className="input" value={p.act} onChange={e => setP({ ...p, act: +e.target.value })}>
          {ACT.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select></label>
      <div className="grid3">
        <label style={{ gridColumn: 'span 2' }}>Obiettivo
          <select className="input" value={p.goal} onChange={e => setP({ ...p, goal: e.target.value as P['goal'] })}>
            {Object.entries(GOALS).map(([k, g]) => <option key={k} value={k}>{g.label}</option>)}
          </select></label>
        <label>Durata (settimane)<input className="input" type="number" inputMode="numeric" min={1} value={p.weeks || ''} onChange={num('weeks')} /></label>
      </div>

      {ok && <div className="result">
        <div>TDEE (mantenimento) <b>{tdee(p)} kcal</b></div>
        <div>Obiettivo giornaliero <b>{target(p)} kcal</b> ({GOALS[p.goal].adj > 0 ? '+' : ''}{Math.round(GOALS[p.goal].adj * 100)}%)</div>
        <div>Proteine minime <b>{proteinGoal(p)} g</b> (1,6 g/kg)</div>
      </div>}
      <button className="btn" disabled={!ok} onClick={() => update(d => { d.profile = { ...p, start: today() }; d.kgoal = target(p); })}>Salva e applica</button>
      {saved && <div className="muted">{left! > 0 ? `Periodo attivo: ${GOALS[saved.goal].label}, ancora ${left} giorni.` : 'Periodo concluso: aggiorna peso e obiettivo.'} Le kcal della giornata si aggiornano a ogni salvataggio.</div>}
    </section>
  );
}
