'use client';
import { useCallback, useEffect, useState } from 'react';
import { Data, today } from '@/lib/store';
import { decrypt, deriveKey, encrypt, newSalt } from '@/lib/crypto';
import { addPhoto, delPhotos, getPhoto, listPhotos } from '@/lib/cloud';
import { Camera, Lock } from './Icons';

type Item = { id: string; day: string };
const fmt = (d: string, o: Intl.DateTimeFormatOptions) => new Date(d + 'T12:00').toLocaleDateString('it-IT', o);

/** Scarica, decifra e mostra una foto. shortcut: nessuna cache né miniatura ridotta, ogni vista riscarica (~200 KB); aggiungere una miniatura se la galleria cresce. */
function Img({ id, k }: { id: string; k: CryptoKey }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let u = '', alive = true;
    getPhoto(id).then(c => decrypt(k, c)).then(b => {
      u = URL.createObjectURL(new Blob([b as BlobPart], { type: 'image/jpeg' }));
      if (alive) setUrl(u); else URL.revokeObjectURL(u);
    }, () => {});
    return () => { alive = false; if (u) URL.revokeObjectURL(u); };
  }, [id, k]);
  return url ? <img src={url} alt="Foto progresso" /> : <div className="ph" />;
}

/** Ridimensiona (max 1280px) e comprime in JPEG prima di cifrare. */
async function shrink(file: File) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
  const cv = document.createElement('canvas');
  cv.width = Math.round(bmp.width * s); cv.height = Math.round(bmp.height * s);
  cv.getContext('2d')!.drawImage(bmp, 0, 0, cv.width, cv.height);
  const blob = await new Promise<Blob | null>(r => cv.toBlob(r, 'image/jpeg', 0.82));
  if (!blob) throw new Error('jpeg');
  return new Uint8Array(await blob.arrayBuffer());
}

export default function Photos({ data, update }: { data: Data; update: (fn: (d: Data) => void) => void }) {
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [pass, setPass] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [sel, setSel] = useState<string[]>([]);
  const [day, setDay] = useState(today());
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [cmp, setCmp] = useState(false);

  const load = useCallback(() => listPhotos().then(setItems, () => setMsg('Impossibile caricare le foto')), []);
  useEffect(() => { if (key) load(); }, [key, load]);

  async function unlock() {
    setBusy(true); setMsg('');
    try {
      const v = data.vault;
      const salt = v?.salt ?? newSalt();
      const k = await deriveKey(pass, salt);
      if (v) {
        try { if (new TextDecoder().decode(await decrypt(k, v.check)) !== 'ok') throw 0; } catch { setMsg('Passphrase errata'); return; }
      } else {
        const check = await encrypt(k, new TextEncoder().encode('ok'));
        update(d => { d.vault = { salt, check }; });
      }
      setKey(k); setPass('');
    } finally { setBusy(false); }
  }

  async function upload(f: File | undefined) {
    if (!f || !key) return;
    setBusy(true); setMsg('');
    try { await addPhoto(day, await encrypt(key, await shrink(f))); await load(); }
    catch { setMsg('Caricamento non riuscito (file non valido o rete assente)'); }
    finally { setBusy(false); }
  }

  const toggle = (id: string) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const del = async () => {
    if (!confirm(`Eliminare ${sel.length} foto? Non si può annullare.`)) return;
    try { await delPhotos(sel); setSel([]); setCmp(false); await load(); } catch { setMsg('Eliminazione non riuscita'); }
  };

  if (!key) return (
    <section className="card form" style={{ maxWidth: 480 }}>
      <h2><Lock />Foto cifrate</h2>
      <p className="muted" style={{ margin: 0 }}>
        Le foto vengono cifrate sul tuo dispositivo con AES-256 prima di essere salvate: sul server c&apos;è solo testo illeggibile.
        {data.vault ? ' Inserisci la tua passphrase.' : ' Scegli una passphrase: se la perdi le foto non si recuperano, da nessuno.'}
      </p>
      <input className="input" type="password" autoComplete="off" placeholder="Passphrase foto" value={pass} onChange={e => setPass(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && pass.length >= 8 && unlock()} />
      <button className="btn" disabled={busy || pass.length < 8} onClick={unlock}>{data.vault ? 'Sblocca' : 'Crea e sblocca'}</button>
      <div className="err" role="alert">{msg || (pass && pass.length < 8 ? 'Almeno 8 caratteri' : '')}</div>
    </section>
  );

  const picked = items.filter(i => sel.includes(i.id)).sort((a, b) => a.day.localeCompare(b.day));
  return (
    <div className="stack">
      <section className="card form">
        <h2>Nuova foto</h2>
        <div className="row wrap">
          <input className="input grow" type="date" aria-label="Data foto" value={day} onChange={e => setDay(e.target.value)} />
          <label className="btn" style={{ cursor: 'pointer' }}><Camera />{busy ? 'Cifro…' : 'Scegli foto'}
            <input className="sr" type="file" accept="image/*" disabled={busy || !day} onChange={e => { upload(e.target.files?.[0]); e.target.value = ''; }} /></label>
        </div>
        <div className="err" role="alert">{msg}</div>
      </section>

      {cmp && picked.length > 1 ? (
        <section className="card">
          <div className="row" style={{ marginBottom: 12 }}><h2 className="grow">Confronto</h2><button className="btn sec" onClick={() => setCmp(false)}>Chiudi</button></div>
          <div className="cmp">{picked.map(i => <figure key={i.id}><Img id={i.id} k={key} /><figcaption>{fmt(i.day, { day: 'numeric', month: 'long', year: 'numeric' })}</figcaption></figure>)}</div>
        </section>
      ) : (
        <section className="card">
          <div className="row wrap" style={{ marginBottom: 12 }}>
            <h2 className="grow">Diario ({items.length})</h2>
            <button className="btn" disabled={sel.length < 2} onClick={() => setCmp(true)}>Confronta ({sel.length})</button>
            <button className="btn sec" disabled={!sel.length} onClick={del}>Elimina</button>
          </div>
          {!items.length && <div className="muted">Nessuna foto. Selezionane almeno due per confrontarle.</div>}
          <div className="gal">
            {items.map(i => (
              <label key={i.id} className={'tile' + (sel.includes(i.id) ? ' on' : '')}>
                <input className="sr" type="checkbox" checked={sel.includes(i.id)} onChange={() => toggle(i.id)} />
                <Img id={i.id} k={key} />
                <span>{fmt(i.day, { day: 'numeric', month: 'short', year: '2-digit' })}</span>
              </label>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
