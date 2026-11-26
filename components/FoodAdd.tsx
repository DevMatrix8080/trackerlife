'use client';
import { useState } from 'react';
import { Data, Food, MEALS, Meal, emptyDay, freq, totals } from '@/lib/store';
import { Plus, Search, X } from './Icons';
import { Preset, hasFood, searchFoods } from '@/lib/foods';
import AskGeneral from './AskGeneral';

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

type Props = { foods: Preset[]; data: Data; date: string; update: (fn: (d: Data) => void) => void; onAdd: (f: Food) => void; onSaveGeneral: (p: Preset) => Promise<string | null> };

export default function FoodAdd({ foods, data, date, update, onAdd, onSaveGeneral }: Props) {
  const [q, setQ] = useState('');
  const [meal, setMeal] = useState<Meal>(() => { const h = new Date().getHours(); return h < 10 ? 'colazione' : h < 12 ? 'spuntino_m' : h < 15 ? 'pranzo' : h < 18 ? 'spuntino_p' : 'cena'; });
  const [man, setMan] = useState({ name: '', kcal: '', p: '', c: '', f: '' });
  const [mname, setMname] = useState('');
  const [ask, setAsk] = useState<Preset | null>(null); // cibo appena inserito a mano: chiede se metterlo nella tabella generale
  const used = freq(data);
  const byUse = (a: Preset, b: Preset) => (used.get(b.name) ?? 0) - (used.get(a.name) ?? 0);
  const hits = q.trim() ? searchFoods(foods, q).sort(byUse) : foods.filter(x => used.has(x.name)).sort(byUse).slice(0, 8);
  const meals = data.meals ?? [];
  const inMeal = (data.days[date] ?? emptyDay()).foods.filter(f => f.meal === meal);
  const mealLabel = MEALS.find(m => m[0] === meal)![1];

  function addManual() {
    if (!man.name.trim()) return;
    const p = { name: man.name.trim(), kcal: +man.kcal || 0, p: +man.p || 0, c: +man.c || 0, f: +man.f || 0 };
    onAdd({ meal, g: 0, ...p });
    setAsk(hasFood(foods, p.name) ? null : p); // se esiste già in tabella non lo chiede
    setMan({ name: '', kcal: '', p: '', c: '', f: '' });
  }
  const set = (k: keyof typeof man) => (e: React.ChangeEvent<HTMLInputElement>) => setMan({ ...man, [k]: e.target.value });

  return (
    <section className="card" aria-labelledby="h-food">
      <h2 id="h-food" style={{ marginBottom: 12 }}>Aggiungi cibo</h2>
      <select className="input" style={{ marginBottom: 8 }} aria-label="Pasto" value={meal} onChange={e => setMeal(e.target.value as Meal)}>
        {MEALS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <div className="row">
        <input className="input grow" placeholder="Cerca: pizza, yogurt, petto di pollo…" aria-label="Cerca cibo" value={q} onChange={e => setQ(e.target.value)} />
        <span className="btn sq" aria-hidden><Search /></span>
      </div>
      <div className="muted" style={{ margin: '6px 0 0', fontSize: '.9rem' }}>I tuoi cibi, valori per la porzione indicata. Scegli le porzioni e premi +.</div>
      {q.trim() && !hits.length && <div className="muted" style={{ paddingTop: 10 }}>Nessun risultato: inseriscilo a mano qui sotto.</div>}
      {!q.trim() && hits.length > 0 && <div className="muted" style={{ paddingTop: 10, fontWeight: 700 }}>Più usati</div>}
      {hits.map(h => <Result key={h.name} h={h} onAdd={f => onAdd({ ...f, meal })} />)}

      <details className="manual">
        <summary>Pasti salvati ({meals.length})</summary>
        {meals.map((m, i) => (
          <div key={i} className="hit">
            <div className="t">{m.name}<div className="k">{m.foods.length} cibi · {Math.round(totals(m.foods).kcal)} kcal</div></div>
            <button className="btn sq" aria-label={`Aggiungi ${m.name}`}
              onClick={() => update(d => { (d.days[date] ??= emptyDay()).foods.push(...structuredClone(m.foods).map(f => ({ ...f, meal }))); })}><Plus /></button>
            <button className="rm" aria-label={`Elimina ${m.name}`} onClick={() => update(d => { d.meals?.splice(i, 1); })}><X size={18} /></button>
          </div>
        ))}
        <div className="row" style={{ marginTop: 10 }}>
          <input className="input grow" placeholder={`Nome (salva: ${mealLabel} di oggi)`} aria-label="Nome del pasto" maxLength={40} value={mname} onChange={e => setMname(e.target.value)} />
          <button className="btn sq" aria-label="Salva pasto" disabled={!mname.trim() || !inMeal.length}
            onClick={() => { update(d => { (d.meals ??= []).push({ name: mname.trim(), foods: inMeal.map(({ meal: _m, ...f }) => f) }); }); setMname(''); }}><Plus /></button>
        </div>
        {!inMeal.length && <div className="muted" style={{ marginTop: 6, fontSize: '.9rem' }}>Per salvare, aggiungi prima dei cibi a «{mealLabel}».</div>}
      </details>

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
      {ask && <AskGeneral food={ask} onNo={() => setAsk(null)} onYes={async () => { const e = await onSaveGeneral(ask); if (!e) setAsk(null); return e; }} />}
    </section>
  );
}
