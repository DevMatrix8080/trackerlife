'use client';
import { useState } from 'react';
import { Food } from '@/lib/store';
import { Plus, Search } from './Icons';

type Hit = { name: string; kcal: number; p: number; c: number; f: number }; // per 100 g

function Result({ h, onAdd }: { h: Hit; onAdd: (f: Food) => void }) {
  const [g, setG] = useState(100);
  const k = g / 100;
  return (
    <div className="hit">
      <div className="t">{h.name}<div className="k">{Math.round(h.kcal)} kcal / 100 g</div></div>
      <input className="input" type="number" inputMode="numeric" min={1} aria-label="Grammi" value={g} onChange={e => setG(+e.target.value)} />
      <button className="btn sq" aria-label={`Aggiungi ${h.name}`} disabled={!(g > 0)}
        onClick={() => onAdd({ name: h.name, g, kcal: h.kcal * k, p: h.p * k, c: h.c * k, f: h.f * k })}><Plus /></button>
    </div>
  );
}

export default function FoodAdd({ onAdd }: { onAdd: (f: Food) => void }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[] | string>([]);
  const [man, setMan] = useState({ name: '', kcal: '', p: '', c: '', f: '' });

  async function search() {
    if (!q.trim()) return;
    setHits('Ricerca…');
    try {
      const url = 'https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=10&fields=product_name,nutriments&search_terms=' + encodeURIComponent(q.trim());
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const items: { product_name?: string; nutriments?: Record<string, number> }[] = (await res.json()).products;
      const out = items
        .filter(p => p.product_name && p.nutriments?.['energy-kcal_100g'] != null)
        .map(p => {
          const n = p.nutriments!;
          return { name: p.product_name!, kcal: +n['energy-kcal_100g'] || 0, p: +n.proteins_100g || 0, c: +n.carbohydrates_100g || 0, f: +n.fat_100g || 0 };
        });
      setHits(out.length ? out : 'Nessun risultato: inseriscilo a mano qui sotto.');
    } catch { setHits('Ricerca non riuscita. Controlla la connessione o inserisci a mano.'); }
  }

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
        <input className="input grow" placeholder="Cerca: pasta, petto di pollo…" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
        <button className="btn sq" aria-label="Cerca" onClick={search}><Search /></button>
      </div>
      <div className="muted" style={{ margin: '6px 0 0', fontSize: '.9rem' }}>Valori per 100 g da Open Food Facts. Indica i grammi e premi +.</div>
      {typeof hits === 'string' ? <div className="muted" style={{ paddingTop: 10 }}>{hits}</div> : hits.map((h, i) => <Result key={i} h={h} onAdd={onAdd} />)}

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
