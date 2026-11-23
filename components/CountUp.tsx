'use client';
import { useEffect, useRef, useState } from 'react';
import { reduced } from '@/lib/motion';

/** Numero che scorre fino al nuovo valore con easing esponenziale. */
export default function CountUp({ value, decimals = 0, ms = 900 }: { value: number; decimals?: number; ms?: number }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (reduced()) { from.current = value; setShown(value); return; }
    const a = from.current, t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      const v = a + (value - a) * (p === 1 ? 1 : 1 - Math.pow(2, -10 * p));
      from.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);

  const f = 10 ** decimals;
  return <>{Math.round(shown * f) / f}</>;
}
