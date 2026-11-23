'use client';
import { useState } from 'react';
import { Food } from '@/lib/store';
import { Plus, Search } from './Icons';
import { Preset, searchFoods } from '@/lib/foods';

function Result({ h, onAdd }: { h: Preset; onAdd: (f: Food) => void }) {
  const [n, setN] = useState(1); // porzioni
  return (
    <div className="hit">
      <div className="t">{h.name}<div className="k">{Math.round(h.kcal)} kcal · P {h.p} · C {h.c} · G {h.f}</div></div>
      <input className="input" type="number" inputMode="decimal" min={0.25} step={0.25} aria-label="Porzioni" value={n} onChange={e => setN(+e.target.value)} />
      <button className="btn sq" aria-label={`Aggiungi ${h.name}`} disabled={!(n > 0)}
        onClick={() => onAdd({ name: n === 1 ? h.name : `${n}× ${h.name}`, g: 0, kcal: h.kcal * n, p: h.p * n, c: h.c * n, f: h.f * n })}><Plus /></button>
    </div>
  );
}

export default function FoodAdd({ foods, onAdd }: { foods: Preset[]; onAdd: (f: Food) => void }) {
  const [q, setQ] = useState('');
  const [man, setMan] = useState({ name: '', kcal: '', p: '', c: '', f: '' });
  const hits = searchFoods(foods, q);

  function addManual() {
    if (!man.name.trim()) return;
    onAdd({ name: man.name.trim(), g: 0, kcal: +man.kcal || 0, p: +man.p || 0, c: +man.c || 0, f: +man.f || 0 });
    setMan({ name: '', kcal: '', p: '', c: '', f: '' });
  }
  const set = (k: keyof typeof man) => (e: React.ChangeEvent<HTMLInputElement>) => setMan({ ...man, [k]: e.target.value });

  return (
    <section className="card" aria-labelledby="h-food">
      <h2 id="h-food" style={{ marginBottom: 12 }}>Aggiungi cibo</h2>
      <div className="row">
        <input className="input grow" placeholder="Cerca: pizza, yogurt, petto di pollo…" aria-label="Cerca cibo" value={q} onChange={e => setQ(e.target.value)} />
        <span className="btn sq" aria-hidden><Search /></span>
      </div>
      <div className="muted" style={{ margin: '6px 0 0', fontSize: '.9rem' }}>I tuoi cibi, valori per la porzione indicata. Scegli le porzioni e premi +.</div>
      {q.trim() && !hits.length && <div className="muted" style={{ paddingTop: 10 }}>Nessun risultato: inseriscilo a mano qui sotto.</div>}
      {hits.map(h => <Result key={h.name} h={h} onAdd={onAdd} />)}

      <details className="manual">
        <summary>Inserisci a mano</summary>
        <div className="mgrid">
          <input className="input full" placeholder="Nome" value={man.name} onChange={set('name')} />
          <input className="input" type="number" inputMode="decimal" placeholder="kcal" value={man.kcal} onChange={set('kcal')} />
          <input className="input" type="number" inputMode="decimal" placeholder="Prot g" value={man.p} onChange={set('p')} />
          <input className="input" type="number" inputMode="decimal" placeholder="Carbo g" value={man.c} onChange={set('c')} />
          <input className="input" type="number" inputMode="decimal" placeholder="Grassi g" value={man.f} onChange={set('f')} />
          <button className="btn" onClick={addManual} disabled={!man.name.trim()}><Plus />Aggiungi</button>
        </div>
      </details>
    </section>
  );
}
