'use client';
import { useState } from 'react';
import { Data, r1, shiftDate, today } from '@/lib/store';
import { GOALS, tdee } from '@/lib/tdee';
import { X } from './Icons';

const KCAL_KG = 7700;

// Regressione lineare sugli ultimi 28 giorni: kg a settimana. Serve almeno 10 giorni di distanza tra prima e ultima pesata.
function trend(pts: [string, number][]) {
  if (pts.length < 3) return null;
  const t0 = new Date(pts[0][0] + 'T12:00').getTime();
  const xs = pts.map(([d]) => (new Date(d + 'T12:00').getTime() - t0) / 864e5);
  if (xs[xs.length - 1] < 10) return null;
  const n = pts.length, mx = xs.reduce((a, b) => a + b) / n, my = pts.reduce((a, [, w]) => a + w, 0) / n;
  const sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0);
  return sxx ? xs.reduce((a, x, i) => a + (x - mx) * (pts[i][1] - my), 0) / sxx * 7 : null;
}

function Chart({ pts }: { pts: [string, number][] }) {
  if (pts.length < 2) return <div className="empty">Servono almeno due pesate per il grafico.</div>;
  const ws = pts.map(p => p[1]), lo = Math.min(...ws) - 0.5, hi = Math.max(...ws) + 0.5;
  const t0 = new Date(pts[0][0] + 'T12:00').getTime(), span = new Date(pts[pts.length - 1][0] + 'T12:00').getTime() - t0 || 1;
  const xy = pts.map(([d, w]) => `${10 + (new Date(d + 'T12:00').getTime() - t0) / span * 580},${150 - (w - lo) / (hi - lo) * 130}`).join(' ');
  return (
    <svg viewBox="0 0 600 170" role="img" aria-label={`Peso da ${pts[0][1]} a ${pts[pts.length - 1][1]} kg`} style={{ width: '100%', height: 'auto' }}>
      <polyline points={xy} fill="none" stroke="var(--aqua)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      <text x={10} y={14} fill="var(--muted)" fontSize={13}>{r1(hi)} kg</text>
      <text x={10} y={166} fill="var(--muted)" fontSize={13}>{r1(lo)} kg</text>
    </svg>
  );
}

export default function Weight({ data, update }: { data: Data; update: (fn: (d: Data) => void) => void }) {
  const [date, setDate] = useState(today());
  const [w, setW] = useState('');
  const [waist, setWaist] = useState('');
  const body = data.body ?? {};
  const all = Object.entries(body).sort(([a], [b]) => (a < b ? -1 : 1));
  const recent = all.filter(([d]) => d >= shiftDate(today(), -28)).map(([d, v]) => [d, v.w] as [string, number]);
  const slope = trend(recent);
  const p = data.profile;
  const expected = p ? GOALS[p.goal].adj * tdee(p) * 7 / KCAL_KG : 0; // kg/sett. previsti dall'obiettivo
  const gap = slope === null ? 0 : Math.max(-300, Math.min(300, Math.round((expected - slope) * KCAL_KG / 7 / 50) * 50));
  const ok = +w >= 20 && +w <= 400;

  const save = () => {
    update(d => { (d.body ??= {})[date] = { w: +w, ...(+waist > 0 ? { waist: +waist } : {}) }; });
    setW(''); setWaist('');
  };

  return (
    <div className="cols">
      <section className="card form" aria-labelledby="h-w">
        <h2 id="h-w">Peso e misure</h2>
        <div className="grid3">
          <label>Data<input className="input" type="date" max={today()} value={date} onChange={e => e.target.value && setDate(e.target.value)} /></label>
          <label>Peso (kg)<input className="input" type="number" inputMode="decimal" step={0.1} value={w} onChange={e => setW(e.target.value)} /></label>
          <label>Vita (cm)<input className="input" type="number" inputMode="decimal" step={0.5} value={waist} onChange={e => setWaist(e.target.value)} /></label>
        </div>
        <button className="btn" disabled={!ok} onClick={save}>Salva</button>

        {slope !== null && <div className="result">
          <div>Andamento (ultimi 28 giorni) <b>{slope > 0 ? '+' : ''}{r1(slope)} kg/sett.</b></div>
          {p && <div>Previsto dall&apos;obiettivo <b>{expected > 0 ? '+' : ''}{r1(expected)} kg/sett.</b></div>}
          {p && Math.abs(gap) >= 100 && <>
            <div>Per tornare in linea: <b>{gap > 0 ? '+' : ''}{gap} kcal/giorno</b> (obiettivo {data.kgoal} → {data.kgoal + gap})</div>
            <button className="btn sec" onClick={() => update(d => { d.kgoal = Math.max(1200, d.kgoal + gap); })}>Applica {data.kgoal + gap} kcal</button>
          </>}
          {p && Math.abs(gap) < 100 && <div>Sei in linea con l&apos;obiettivo, nessuna correzione.</div>}
        </div>}
        {slope === null && <div className="muted">Per l&apos;andamento e l&apos;aggiustamento delle kcal servono almeno 3 pesate in 10 giorni.</div>}
        {!p && <div className="muted">Imposta il profilo per confrontare l&apos;andamento con l&apos;obiettivo.</div>}
      </section>

      <section className="card" aria-labelledby="h-wc">
        <h2 id="h-wc" style={{ marginBottom: 12 }}>Grafico</h2>
        <Chart pts={all.slice(-60).map(([d, v]) => [d, v.w])} />
        {all.slice(-10).reverse().map(([d, v]) => (
          <div key={d} className="hit">
            <div className="t">{new Date(d + 'T12:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
              <div className="k">{v.w} kg{v.waist ? ` · vita ${v.waist} cm` : ''}</div></div>
            <button className="rm" aria-label={`Elimina pesata del ${d}`} onClick={() => update(x => { delete x.body?.[d]; })}><X size={18} /></button>
          </div>
        ))}
      </section>
    </div>
  );
}
