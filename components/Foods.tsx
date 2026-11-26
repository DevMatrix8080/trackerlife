'use client';
import { useState } from 'react';
import { Data } from '@/lib/store';
import { Preset, hasFood, searchFoods } from '@/lib/foods';
import { Plus, X } from './Icons';
import AskGeneral from './AskGeneral';

type Props = { foods: Preset[]; custom: Preset[]; update: (fn: (d: Data) => void) => void; onSaveGeneral: (p: Preset) => Promise<string | null>; onDelGeneral: (p: Preset) => Promise<string | null> };

export default function Foods({ foods, custom, update, onSaveGeneral, onDelGeneral }: Props) {
  const [q, setQ] = useState('');
  const [n, setN] = useState({ name: '', kcal: '', p: '', c: '', f: '' });
  const [ask, setAsk] = useState<Preset | null>(null); // cibo in attesa della scelta: tabella generale o solo elenco personale
  const [err, setErr] = useState('');
  const set = (k: keyof typeof n) => (e: React.ChangeEvent<HTMLInputElement>) => setN({ ...n, [k]: e.target.value });
  const all = [...custom, ...foods];
  const list = q.trim() ? searchFoods(all, q, 500) : all;
  const mine = new Set(custom);
  const removable = (f: Preset) => mine.has(f) || f.own;

  const reset = () => setN({ name: '', kcal: '', p: '', c: '', f: '' });
  const save = () => {
    const p = { name: n.name.trim(), kcal: +n.kcal || 0, p: +n.p || 0, c: +n.c || 0, f: +n.f || 0 };
    if (hasFood(all, p.name)) return setErr('Esiste già un cibo con questo nome.');
    setErr(''); setAsk(p);
  };
  const keepPersonal = (p: Preset) => { update(d => { (d.custom ??= []).unshift(p); }); setAsk(null); reset(); };

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
        {ask
          ? <AskGeneral food={ask} yes="Sì, tabella generale" no="No, solo mio elenco" onNo={() => keepPersonal(ask)}
              onYes={async () => { const e = await onSaveGeneral(ask); if (!e) { setAsk(null); reset(); } return e; }} />
          : <button className="btn" disabled={!n.name.trim()} onClick={save}><Plus />Salva cibo</button>}
        {err && <div className="err" role="alert">{err}</div>}
        <div className="muted">Valori per la porzione scritta nel nome. Il cibo compare nella ricerca della Giornata.</div>
      </section>
      <section className="card">
        <h2 style={{ marginBottom: 12 }}>Tutti i cibi ({list.length})</h2>
        <input className="input" placeholder="Filtra…" aria-label="Filtra cibi" value={q} onChange={e => setQ(e.target.value)} />
        <div className="foodlist">
          {list.map((f, i) => (
            <div className="hit" key={i}>
              <div className="t">{f.name}{removable(f) && <span className="tag">tuo</span>}
                <div className="k">{Math.round(f.kcal)} kcal · P {f.p} · C {f.c} · G {f.f}</div></div>
              {removable(f) && <button className="rm" aria-label={`Elimina ${f.name}`} onClick={() => mine.has(f) ? update(d => { d.custom = d.custom?.filter(x => x.name !== f.name); }) : onDelGeneral(f)}><X size={18} /></button>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
