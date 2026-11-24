'use client';
import { Data, r1, shiftDate, today, totals } from '@/lib/store';

// Media sui giorni con cibi registrati; "in obiettivo" = kcal entro ±10% dell'obiettivo.
function week(data: Data, end: string) {
  const days = Array.from({ length: 7 }, (_, i) => data.days[shiftDate(end, -i)]).filter(d => d?.foods.length);
  const ts = days.map(d => totals(d.foods));
  const n = ts.length;
  const avg = (k: 'kcal' | 'p' | 'c' | 'f') => (n ? ts.reduce((a, t) => a + t[k], 0) / n : 0);
  return { n, kcal: avg('kcal'), p: avg('p'), c: avg('c'), f: avg('f'), ok: ts.filter(t => Math.abs(t.kcal - data.kgoal) <= data.kgoal * 0.1).length };
}

export default function Week({ data }: { data: Data }) {
  const a = week(data, today()), b = week(data, shiftDate(today(), -7));
  const rows: [string, number, number, string][] = [
    ['Calorie', a.kcal, b.kcal, 'kcal'], ['Proteine', a.p, b.p, 'g'], ['Carboidrati', a.c, b.c, 'g'], ['Grassi', a.f, b.f, 'g'],
  ];
  const d = (x: number, y: number) => (a.n && b.n ? `${x - y > 0 ? '+' : ''}${r1(x - y)}` : '—');
  return (
    <section className="card" aria-labelledby="h-week" style={{ marginBottom: 16 }}>
      <h2 id="h-week" style={{ marginBottom: 12 }}>Ultimi 7 giorni</h2>
      {!a.n ? <div className="empty">Nessun cibo registrato negli ultimi 7 giorni.</div> : (
        <div className="scroll">
          <table>
            <thead><tr><th>Media al giorno</th><th>Questa sett.</th><th>Precedente</th><th>Diff.</th></tr></thead>
            <tbody>
              {rows.map(([l, x, y, u]) => <tr key={l}><td className="name">{l}</td><td>{Math.round(x)} {u}</td><td>{b.n ? `${Math.round(y)} ${u}` : '—'}</td><td>{d(x, y)}</td></tr>)}
              <tr><td className="name">Giorni in obiettivo</td><td>{a.ok}/{a.n}</td><td>{b.n ? `${b.ok}/${b.n}` : '—'}</td><td>{b.n ? a.ok - b.ok : '—'}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
