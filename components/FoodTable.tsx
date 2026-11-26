'use client';
import { Food, MEALS, r1, totals } from '@/lib/store';
import { Check, X } from './Icons';

type Props = { foods: Food[]; fmax: number; closed: boolean; onRemove: (i: number) => void; onFinish: () => void; onReopen: () => void };

export default function FoodTable({ foods, fmax, closed, onRemove, onFinish, onReopen }: Props) {
  const t = totals(foods);
  return (
    <section className="panel" aria-labelledby="h-table">
      <h2 id="h-table">Mangiato oggi</h2>
      <div className="rule-xl" />
      {!foods.length ? <div className="empty">Ancora nessun alimento. Cercane uno e aggiungilo.</div> : (
        <div className="scroll">
          <table className="foodt">
            <thead><tr><th>Alimento</th><th>g</th><th>kcal</th><th>P</th><th>C</th><th>G</th><th><span className="sr">Rimuovi</span></th></tr></thead>
            <tbody>
              {[...MEALS, ['', 'Senza pasto'] as const].map(([m, label]) => {
                const rows = foods.map((f, i) => ({ f, i })).filter(x => (x.f.meal ?? '') === m);
                return rows.length ? [<tr key={'h' + m}><td className="mealrow" colSpan={7}>{label}</td></tr>, ...rows.map(({ f, i }) => (
                <tr key={i} style={{ ['--r' as string]: Math.min(i, 12) }}>
                  <td className="name">{f.name}</td><td>{f.g || '—'}</td><td>{Math.round(f.kcal)}</td>
                  <td>{r1(f.p)}</td><td>{r1(f.c)}</td>
                  <td className={'f' + (f.kcal && f.f * 9 / f.kcal > 0.3 ? ' hi' : '')}>{r1(f.f)}</td>
                  <td><button className="rm" aria-label={`Rimuovi ${f.name}`} disabled={closed} onClick={() => onRemove(i)}><X size={18} /></button></td>
                </tr>
              ))] : null;
              })}
            </tbody>
            <tfoot>
              <tr><td>Totale</td><td /><td>{Math.round(t.kcal)}</td><td>{r1(t.p)}</td><td>{r1(t.c)}</td>
                <td className={t.f > fmax ? 'f hi' : ''}>{r1(t.f)}</td><td /></tr>
            </tfoot>
          </table>
        </div>
      )}
      <p className="note">Grassi in rosa: oltre il 30% delle calorie di quel cibo arriva dai grassi.</p>
      {closed
        ? <button className="finish sec" onClick={onReopen}>Riapri giornata</button>
        : <button className="finish" disabled={!foods.length} onClick={onFinish}><Check size={26} />Giornata finita</button>}
    </section>
  );
}
