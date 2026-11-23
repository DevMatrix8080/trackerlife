'use client';
import { useState } from 'react';
import { Data, Day, r1, totals, waterGoal } from '@/lib/store';
import { Check, Dumbbell } from './Icons';

const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
type Entry = [string, Day];

// media per giorno sui soli giorni con dati
function agg(entries: Entry[], fmax: number) {
  const used = entries.filter(([, d]) => d.foods.length || d.water);
  const eaten = used.filter(([, d]) => d.foods.length);
  const sum = eaten.reduce((a, [, d]) => { const t = totals(d.foods); return { k: a.k + t.kcal, p: a.p + t.p, c: a.c + t.c, f: a.f + t.f }; }, { k: 0, p: 0, c: 0, f: 0 });
  const n = eaten.length || 1;
  const water = used.reduce((a, [, d]) => a + d.water, 0) / (used.length || 1);
  return { days: used.length, kcal: sum.k / n, p: sum.p / n, c: sum.c / n, f: sum.f / n, water, fatHigh: sum.f / n > fmax };
}

export default function History({ data, open }: { data: Data; open: (date: string) => void }) {
  const [y, setY] = useState<string | null>(null);
  const [m, setM] = useState<string | null>(null);
  const all = Object.entries(data.days).sort(([a], [b]) => a.localeCompare(b));
  if (!all.length) return <section className="panel"><h2>Cronologia</h2><div className="rule-xl" /><div className="empty">Ancora nessun dato: compila la prima giornata.</div></section>;

  const group = (list: Entry[], len: number) => {
    const g: Record<string, Entry[]> = {};
    list.forEach(e => (g[e[0].slice(0, len)] ??= []).push(e));
    return Object.entries(g).reverse();
  };

  const inYear = y ? all.filter(([k]) => k.startsWith(y)) : all;
  const inMonth = y && m ? inYear.filter(([k]) => k.slice(5, 7) === m) : inYear;
  const level = !y ? 'anni' : !m ? 'mesi' : 'giorni';

  const avgRow = (key: string, label: string, es: Entry[], go: () => void) => {
    const a = agg(es, data.fmax);
    return (
      <tr key={key} className="click" onClick={go}>
        <td className="name">{label}</td><td>{a.days}</td><td>{Math.round(a.kcal)}</td><td>{r1(a.p)}</td><td>{r1(a.c)}</td>
        <td className={'f' + (a.fatHigh ? ' hi' : '')}>{r1(a.f)}</td><td>{Math.round(a.water)}</td>
      </tr>
    );
  };

  return (
    <section className="panel" aria-labelledby="h-hist">
      <h2 id="h-hist">Cronologia</h2>
      <div className="rule-xl" />
      <div className="crumbs">
        <button className="chip" aria-current={level === 'anni'} onClick={() => { setY(null); setM(null); }}>Anni</button>
        {y && <button className="chip" aria-current={level === 'mesi'} onClick={() => setM(null)}>{y}</button>}
        {m && <button className="chip" aria-current="true">{MESI[+m - 1]}</button>}
      </div>
      <div className="note" style={{ margin: '0 0 8px' }}>
        {level === 'giorni' ? 'Tocca un giorno per aprirlo.' : 'Medie per giorno. Tocca una riga per entrare nel dettaglio.'}
      </div>
      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>{level === 'anni' ? 'Anno' : level === 'mesi' ? 'Mese' : 'Giorno'}</th>
              <th>{level === 'giorni' ? '' : 'Gg'}</th>
              <th>kcal</th><th>P</th><th>C</th><th>G</th><th>{level === 'giorni' ? 'Acqua' : 'ml'}</th>
            </tr>
          </thead>
          <tbody>
            {level === 'anni' && group(all, 4).map(([k, es]) => avgRow(k, k, es, () => setY(k)))}
            {level === 'mesi' && group(inYear, 7).map(([k, es]) => avgRow(k, MESI[+k.slice(5) - 1], es, () => setM(k.slice(5))))}
            {level === 'giorni' && [...inMonth].reverse().map(([k, d]) => {
              const t = totals(d.foods), goal = waterGoal(k, d.train).ml, ok = d.water >= goal;
              return (
                <tr key={k} className="click" onClick={() => open(k)}>
                  <td className="name">{k.slice(8)}/{k.slice(5, 7)}</td>
                  <td>{d.closed ? <Check size={18} /> : null}{d.train ? <Dumbbell size={18} /> : null}</td>
                  <td>{Math.round(t.kcal)}</td><td>{r1(t.p)}</td><td>{r1(t.c)}</td>
                  <td className={'f' + (t.f > data.fmax ? ' hi' : '')}>{r1(t.f)}</td>
                  <td>
                    <span className={'mini' + (ok ? ' ok' : '')}><i style={{ width: Math.min(100, d.water / goal * 100) + '%' }} /></span>
                    <span className={ok ? 'good' : ''}>{d.water}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {level === 'giorni' && <p className="note">Spunta = giornata finita. Manubrio = allenamento. Barra verde = obiettivo acqua raggiunto.</p>}
    </section>
  );
}
