import './globals.css';
import { Barlow, Big_Shoulders } from 'next/font/google';

const display = Big_Shoulders({ subsets: ['latin'], variable: '--f-display' });
const body = Barlow({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--f-body' });

export const metadata = { title: 'MyLife – Acqua, calorie, macro' };

// Imposta il tema prima del paint per evitare il lampo chiaro/scuro.
// Anti-clickjacking: se la pagina è dentro un iframe altrui, si nasconde (frame-ancestors non vale in un meta CSP).
const themeInit = `if(top!==self)document.documentElement.style.display='none';try{var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${display.variable} ${body.variable}`} data-theme="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit }} /></head>
      <body>{children}</body>
    </html>
  );
}
