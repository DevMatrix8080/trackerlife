'use client';
import { useState } from 'react';
import type { Preset } from '@/lib/foods';
import { Check } from './Icons';

type Props = {
  food: Preset;
  yes?: string; no?: string; // testi dei pulsanti
  onYes: () => Promise<string | null>; // ritorna un messaggio d'errore, o null se ok
  onNo: () => void;
};

/** "Vuoi aggiungerlo alla tabella generale di tutti i tuoi cibi?" */
export default function AskGeneral({ food, yes = 'Sì, aggiungi', no = 'No', onYes, onNo }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <div className="ask" role="group" aria-label="Aggiungere alla tabella generale">
      <div><b>{food.name}</b> ({Math.round(food.kcal)} kcal · P {food.p} · C {food.c} · G {food.f})</div>
      <div>Vuoi aggiungerlo alla <b>tabella generale</b> di tutti i tuoi cibi? Lo ritroverai nella ricerca ogni volta.</div>
      <div className="row">
        <button className="btn" disabled={busy} onClick={async () => { setBusy(true); const e = await onYes(); setBusy(false); if (e) setErr(e); }}><Check size={20} />{yes}</button>
        <button className="btn sec" disabled={busy} onClick={onNo}>{no}</button>
      </div>
      {err && <div className="err" role="alert">{err}</div>}
    </div>
  );
}
