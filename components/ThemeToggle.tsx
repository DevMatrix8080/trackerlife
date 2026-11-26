'use client';
import { flushSync } from 'react-dom';
import { useEffect, useState, type MouseEvent } from 'react';
import { reduced } from '@/lib/motion';
import { Moon, Sun } from './Icons';

const BAR = { dark: '#0A1230', light: '#E9EEFB' };
const paint = (t: 'dark' | 'light') => { document.documentElement.dataset.theme = t; document.querySelector('meta[name=theme-color]')?.setAttribute('content', BAR[t]); };

type VT = { ready: Promise<void>; finished: Promise<void> };

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    // Se non hai mai scelto a mano, segue il tema del telefono/PC anche mentre l'app è aperta.
    const mq = matchMedia('(prefers-color-scheme: light)');
    const f = () => { try { if (localStorage.getItem('theme')) return; } catch { return; } const t = mq.matches ? 'light' : 'dark'; paint(t); setTheme(t); };
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);

  function toggle(e: MouseEvent<HTMLButtonElement>) {
    const next = theme === 'dark' ? 'light' : 'dark';
    const apply = () => { paint(next); setTheme(next); };
    try { localStorage.setItem('theme', next); } catch { /* storage bloccato: il tema vale per la sessione */ }

    const d = document as Document & { startViewTransition?: (cb: () => void) => VT };
    if (!d.startViewTransition || reduced()) return apply();

    // Il nuovo tema si apre come un cerchio che parte dal pulsante.
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const root = document.documentElement;
    root.classList.add('vt-theme');
    const t = d.startViewTransition(() => flushSync(apply));
    t.ready.then(() => root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' },
    )).catch(() => {});
    t.finished.finally(() => root.classList.remove('vt-theme'));
  }

  return (
    <button className="icon-btn" onClick={toggle} aria-label={theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
