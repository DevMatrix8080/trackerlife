'use client';
import { useState } from 'react';
import { Day } from '@/lib/store';
import { Check, Drop, Dumbbell, Minus, Plus } from './Icons';

type Props = { day: Day; goal: { ml: number; why: string }; edit: (fn: (d: Day) => void) => void };

export default function Water({ day, goal, edit }: Props) {
  const [custom, setCustom] = useState('');
  const done = day.water >= goal.ml;
  const add = (ml: number) => edit(d => { d.water = Math.max(0, d.water + ml); });

  return (
    <section className="card" aria-labelledby="h-water">
      <div className="water-head">
        <h2 id="h-water">Acqua</h2>
        <span className="why">{goal.why}</span>
      </div>

      <div className="amount">
        <span className="num" aria-live="polite">{day.water}</span>
        <span className="goal">/ {goal.ml} ml</span>
      </div>

      <div className={'gauge' + (done ? ' ok' : '')} role="progressbar" aria-valuemin={0} aria-valuemax={goal.ml} aria-valuenow={Math.min(day.water, goal.ml)}
        style={{ ['--w' as string]: Math.min(100, day.water / goal.ml * 100) + '%', ['--tick' as string]: 250 / goal.ml * 100 + '%' }}>
        <i />
      </div>

      <div className={'status' + (done ? ' ok' : '')}>
        {done ? <><Check size={24} />Obiettivo raggiunto</> : <><Drop size={22} />Mancano {goal.ml - day.water} ml</>}
      </div>

      <div className="qa">
        {[250, 500, 1000].map(n => <button key={n} className="btn" onClick={() => add(n)}>+{n}</button>)}
      </div>
      <div className="row">
        <button className="btn sec sq" aria-label="Togli 250 ml" onClick={() => add(-250)}><Minus /></button>
        <input className="input grow" type="number" inputMode="numeric" min={1} placeholder="Altri ml" value={custom} onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && +custom > 0) { add(+custom); setCustom(''); } }} />
        <button className="btn sq" aria-label="Aggiungi i ml indicati" disabled={!(+custom > 0)} onClick={() => { add(+custom); setCustom(''); }}><Plus /></button>
      </div>

      <div className="divider" />
      <label className="switch">
        <input type="checkbox" role="switch" checked={day.train} onChange={e => edit(d => { d.train = e.target.checked; })} />
        <span className="track" />
        <Dumbbell /> Giorno di allenamento (3 L)
      </label>
    </section>
  );
}
