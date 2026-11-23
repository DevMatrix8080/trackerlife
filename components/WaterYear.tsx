'use client';
import { Data, today, waterGoal } from '@/lib/store';

/** Per ogni anno: % di giorni con obiettivo acqua raggiunto, dal primo giorno registrato a oggi (i giorni futuri non contano). */
function stats(data: Data) {
  const keys = Object.keys(data.days).sort();
  if (!keys.length) return [];
  const first = keys[0], now = today();
  const out = [];
  for (let y = +first.slice(0, 4); y <= +now.slice(0, 4); y++) {
    let n = 0, ok = 0, flex = 0;
    for (const d = new Date(y, 0, 1, 12); d.getFullYear() === y; d.setDate(d.getDate() + 1)) {
      const k = d.toLocaleDateString('sv');
      if (k < first) continue;
      if (k > now) break;
      n++;
      const day = data.days[k];
      if (day && day.water >= waterGoal(k, day.train).ml) ok++;
      else if (day?.wtag) flex++;
    }
    out.push({ y, n, ok, flex });
  }
  return out.reverse();
}

export default function WaterYear({ data }: { data: Data }) {
  const rows = stats(data);
  if (!rows.length) return null;
  const p = (a: number, n: number) => Math.round(a / n * 100);
  return (
    <section className="card" aria-labelledby="h-wy" style={{ marginBottom: 16 }}>
      <h2 id="h-wy" style={{ marginBottom: 12 }}>Acqua negli anni</h2>
      {rows.map(r => (
        <div className="yr" key={r.y}>
          <b className="num">{r.y}</b>
          <div className="ybar" role="img" aria-label={`${r.y}: ${p(r.ok, r.n)}% giorni con obiettivo raggiunto, ${p(r.flex, r.n)}% giorni flessibili`}>
            <i style={{ width: p(r.ok, r.n) + '%', background: 'var(--ok)' }} />
            <i style={{ width: p(r.flex, r.n) + '%', background: 'var(--carb)' }} />
          </div>
          <span>{p(r.ok, r.n)}%</span>
        </div>
      ))}
      <div className="muted" style={{ fontSize: '.85rem' }}>
        <span className="dot" style={{ background: 'var(--ok)' }} /> obiettivo raggiunto <span className="dot" style={{ background: 'var(--carb)' }} /> giorno flessibile (tag). Conta fino a oggi.
      </div>
    </section>
  );
}
