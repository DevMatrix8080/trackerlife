'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from './Icons';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => { setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'); }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* storage bloccato: il tema vale per la sessione */ }
    setTheme(next);
  }

  return (
    <button className="icon-btn" onClick={toggle} aria-label={theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
