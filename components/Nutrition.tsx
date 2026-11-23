'use client';
import { Data, Food, r1, totals } from '@/lib/store';
import { Alert } from './Icons';
import CountUp from './CountUp';

type Props = { foods: Food[]; kgoal: number; fmax: number; pgoal?: number; update: (fn: (d: Data) => void) => void };

export default function Nutrition({ foods, kgoal, fmax, pgoal, update }: Props) {
  const t = totals(foods);
  const mk = { p: t.p * 4, c: t.c * 4, f: t.f * 9 };
  const sum = mk.p + mk.c + mk.f;
  const pc = (k: number) => (sum ? Math.round(k / sum * 100) : 0);
  const fatHigh = t.f > fmax;
  const diff = Math.round(kgoal - t.kcal);

  const rows = [
    { k: 'p', name: 'Proteine', g: t.p, kcal: mk.p, color: 'var(--protein)' },
    { k: 'c', name: 'Carboidrati', g: t.c, kcal: mk.c, color: 'var(--carb)' },
    { k: 'f', name: 'Grassi', g: t.f, kcal: mk.f, color: 'var(--fat)' },
  ];

  return (
    <section className="panel" aria-labelledby="h-nutri">
      <h2 id="h-nutri">Valori del giorno</h2>
      <div className="rule-xl" />
      <div className="kcal">
        <span className="lbl">Calorie</span>
        <span className="num"><CountUp value={Math.round(t.kcal)} /></span>
      </div>
      <div className="left muted">{diff >= 0 ? `Restano ${diff} kcal su ${kgoal}` : `Oltre di ${-diff} kcal (obiettivo ${kgoal})`}</div>
      <div className="split" aria-hidden="true">
        {rows.map(r => <i key={r.k} style={{ width: pc(r.kcal) + '%', background: r.color }} />)}
      </div>
      <div className="rule-l" />
      {rows.map(r => (
        <div key={r.k} className={'macro' + (r.k === 'f' && fatHigh ? ' over' : '')}>
          <span className="sw" style={{ background: r.color }} />
          <span className="name">{r.name}{r.k === 'f' ? <span className="muted"> · max {fmax} g</span> : r.k === 'p' && pgoal ? <span className="muted"> · obiettivo {pgoal} g</span> : null}</span>
          <span className="g"><CountUp value={r1(r.g)} decimals={1} /> g</span>
          <span className="pc">{pc(r.kcal)}%</span>
        </div>
      ))}
      {fatHigh && <div className="warn" role="alert"><Alert />Grassi sopra il limite: +{r1(t.f - fmax)} g</div>}

      <div className="rule-l" style={{ marginTop: 14 }} />
      <div className="goals">
        <label>Obiettivo kcal
          <input className="field" type="number" inputMode="numeric" min={500} defaultValue={kgoal} key={'k' + kgoal}
            onBlur={e => update(d => { d.kgoal = Math.max(500, +e.target.value || 2500); })} />
        </label>
        <label>Max grassi (g)
          <input className="field" type="number" inputMode="numeric" min={10} defaultValue={fmax} key={'f' + fmax}
            onBlur={e => update(d => { d.fmax = Math.max(10, +e.target.value || 60); })} />
        </label>
      </div>
    </section>
  );
}
