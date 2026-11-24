'use client';
import { Data } from '@/lib/store';

// Un valore che inizia con = + - @ verrebbe eseguito come formula da Excel: lo neutralizziamo.
const cell = (v: string | number) => {
  const s = String(v).replace(/^[=+\-@\t\r]/, "'$&");
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

function save(name: string, text: string, type: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export default function Backup({ data }: { data: Data }) {
  const csv = () => {
    const rows = ['data,pasto,alimento,kcal,proteine,carboidrati,grassi,acqua_ml'];
    for (const [date, day] of Object.entries(data.days).sort(([a], [b]) => (a < b ? -1 : 1)))
      for (const f of day.foods) rows.push([date, f.meal ?? '', f.name, Math.round(f.kcal), f.p, f.c, f.f, day.water].map(cell).join(','));
    save('mylife.csv', rows.join('\n'), 'text/csv');
  };
  // Nel backup non c'è `vault`: contiene la prova della passphrase delle foto, non serve fuori dall'app.
  const json = () => { const { vault: _v, ...rest } = data; save('mylife-backup.json', JSON.stringify(rest, null, 2), 'application/json'); };

  return (
    <section className="card form" style={{ maxWidth: 560, marginTop: 16 }} aria-labelledby="h-bk">
      <h2 id="h-bk">Esporta i tuoi dati</h2>
      <div className="muted">CSV per Excel o Fogli (un cibo per riga). Il backup JSON contiene tutto: giorni, peso, pasti salvati, profilo.</div>
      <div className="row">
        <button className="btn sec" onClick={csv}>Scarica CSV</button>
        <button className="btn sec" onClick={json}>Scarica backup</button>
      </div>
    </section>
  );
}
