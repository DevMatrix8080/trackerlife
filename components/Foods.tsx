'use client';
import { useState } from 'react';
import { Data } from '@/lib/store';
import { Preset, searchFoods } from '@/lib/foods';
import { Plus, X } from './Icons';

export default function Foods({ foods, custom, update }: { foods: Preset[]; custom: Preset[]; update: (fn: (d: Data) => void) => void }) {
  const [q, setQ] = useState('');
  const [n, setN] = useState({ name: '', kcal: '', p: '', c: '', f: '' });
  const set = (k: keyof typeof n) => (e: React.ChangeEvent<HTMLInputElement>) => setN({ ...n, [k]: e.target.value });
  const all = [...custom, ...foods];
  const list = q.trim() ? searchFoods(all, q, 500) : all;
  const mine = new Set(custom);

  const add = () => {
    update(d => { (d.custom ??= []).unshift({ name: n.name.trim(), kcal: +n.kcal || 0, p: +n.p || 0, c: +n.c || 0, f: +n.f || 0 }); });
    setN({ name: '', kcal: '', p: '', c: '', f: '' });
  };

  return (
    <div className="cols">
      <section className="card form">
        <h2>Aggiungi un tuo cibo</h2>
        <input className="input" placeholder="Nome (e porzione)" value={n.name} onChange={set('name')} />
        <div className="mgrid">
          <input className="input" type="number" inputMode="decimal" placeholder="kcal" value={n.kcal} onChange={set('kcal')} />
          <input className="input" type="number" inputMode="decimal" placeholder="Prot g" value={n.p} onChange={set('p')} />
          <input className="input" type="number" inputMode="decimal" placeholder="Carbo g" value={n.c} onChange={set('c')} />
          <input className="input" type="number" inputMode="decimal" placeholder="Grassi g" value={n.f} onChange={set('f')} />
        </div>
        <button className="btn" disabled={!n.name.trim()} onClick={add}><Plus />Salva cibo</button>
        <div className="muted">Valori per la porzione scritta nel nome. Il cibo compare nella ricerca della Giornata.</div>
      </section>
      <section className="card">
        <h2 style={{ marginBottom: 12 }}>Tutti i cibi ({list.length})</h2>
        <input className="input" placeholder="Filtra…" aria-label="Filtra cibi" value={q} onChange={e => setQ(e.target.value)} />
        <div className="foodlist">
          {list.map((f, i) => (
            <div className="hit" key={i}>
              <div className="t">{f.name}{mine.has(f) && <span className="tag">tuo</span>}
                <div className="k">{Math.round(f.kcal)} kcal · P {f.p} · C {f.c} · G {f.f}</div></div>
              {mine.has(f) && <button className="rm" aria-label={`Elimina ${f.name}`} onClick={() => update(d => { d.custom = d.custom?.filter(x => x.name !== f.name); })}><X size={18} /></button>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
