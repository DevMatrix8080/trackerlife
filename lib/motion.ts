import { flushSync } from 'react-dom';

type VT = { ready: Promise<void>; finished: Promise<void> };
type VTDoc = Document & { startViewTransition?: (cb: () => void) => VT };

export const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Esegue un aggiornamento di stato dentro una View Transition (dissolvenza fluida); senza supporto o con "riduci movimento" lo esegue subito. */
export function vt(fn: () => void): VT | null {
  const d = document as VTDoc;
  if (!d.startViewTransition || reduced()) { fn(); return null; }
  return d.startViewTransition(() => flushSync(fn));
}
