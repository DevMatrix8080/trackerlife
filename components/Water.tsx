'use client';
import { useEffect, useRef, useState } from 'react';
import { Day, WTAGS } from '@/lib/store';
import CountUp from './CountUp';
import { Check, Drop, Dumbbell, Minus, Plus } from './Icons';
import { markDrink } from '@/lib/reminders';

type Props = { date: string; day: Day; goal: { ml: number; why: string }; edit: (fn: (d: Day) => void) => void };
const CONFETTI = ['var(--aqua)', 'var(--carb)', 'var(--ok)', 'var(--fat)'];

export default function Water({ date, day, goal, edit }: Props) {
  const [custom, setCustom] = useState('');
  const [floats, setFloats] = useState<{ id: number; ml: number }[]>([]);
  const [burst, setBurst] = useState(0);
  const done = day.water >= goal.ml;
  const pct = Math.round(day.water / goal.ml * 100);
  const cheer = pct >= 100 ? 'Grande, sei idratato!' : pct >= 75 ? 'Ultimo sforzo, ci sei quasi!' : pct >= 50 ? 'Metà fatta, continua così!' : pct >= 25 ? 'Buon inizio, un altro bicchiere?' : "Inizia con un bicchiere d'acqua!";

  // Festeggia solo quando si supera l'obiettivo sul giorno aperto, non cambiando giorno.
  const prev = useRef({ date, done });
  useEffect(() => {
    if (prev.current.date === date && !prev.current.done && done) setBurst(b => b + 1);
    prev.current = { date, done };
  }, [date, done]);

  const add = (ml: number) => {
    edit(d => { d.water = Math.max(0, d.water + ml); });
    if (ml > 0) {
      markDrink();
      const id = Math.random();
      setFloats(f => [...f, { id, ml }]);
      setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 1000);
    }
  };

  return (
    <section className="card" aria-labelledby="h-water">
      <div className="water-head">
        <h2 id="h-water">Acqua</h2>
        <span className="why">{goal.why}</span>
      </div>

      <div className="amount">
        <span className="num"><CountUp value={day.water} /></span>
        <span className="goal">/ {goal.ml} ml</span>
        {floats.map(f => <span key={f.id} className="float" aria-hidden="true">+{f.ml}</span>)}
      </div>

      <div className="gwrap">
        <div className="ghead" aria-hidden="true">
          <span>Progresso</span>
          <b className={'gpct' + (done ? ' ok' : '')}><CountUp value={pct} />%</b>
        </div>
        <div className={'gauge' + (done ? ' ok' : '')} role="progressbar" aria-label="Acqua bevuta" aria-valuemin={0} aria-valuemax={goal.ml} aria-valuenow={Math.min(day.water, goal.ml)}
          style={{ ['--w' as string]: Math.min(100, day.water / goal.ml * 100) + '%', ['--tick' as string]: 250 / goal.ml * 100 + '%' }}>
          <i />
        </div>
        <div className="gscale" aria-hidden="true"><span>0</span><span>{goal.ml / 2} ml</span><span>{goal.ml} ml</span></div>
        {burst > 0 && (
          <div className="burst" key={burst} aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => {
              const a = i * 137.5 * Math.PI / 180, r = 60 + (i % 4) * 34;
              return <i key={i} style={{ ['--dx' as string]: Math.cos(a) * r + 'px', ['--dy' as string]: Math.sin(a) * r - 30 + 'px', ['--c' as string]: CONFETTI[i % 4], animationDelay: (i % 6) * 25 + 'ms' }} />;
            })}
          </div>
        )}
      </div>

      <div className={'status' + (done ? ' ok' : '')}>
        {done ? <><Check size={24} />Obiettivo raggiunto</> : <><Drop size={22} />Mancano {goal.ml - day.water} ml</>}
        <span className="cheer">{!done && day.wtag ? 'Va bene così: giorno flessibile, domani riparti.' : cheer}</span>
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
      <div className="chips" role="group" aria-label="Tag giornata">
        {WTAGS.map(([k, l]) => (
          <button key={k} className="chip2" aria-pressed={day.wtag === k} onClick={() => edit(d => { d.wtag = d.wtag === k ? undefined : k; })}>{l}</button>
        ))}
      </div>
      <textarea className="input note2" rows={2} maxLength={300} placeholder="Descrizione (perché, come ti sei sentito…)" aria-label="Descrizione idratazione"
        defaultValue={day.wnote ?? ''} key={date} onBlur={e => edit(d => { d.wnote = e.target.value.trim() || undefined; })} />
      <div className="divider" />
      <label className="switch">
        <input type="checkbox" role="switch" checked={day.train} onChange={e => edit(d => { d.train = e.target.checked; })} />
        <span className="track" />
        <Dumbbell /> Giorno di allenamento (3 L)
      </label>
    </section>
  );
}
