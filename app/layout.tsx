import './globals.css';
import { Barlow, Big_Shoulders } from 'next/font/google';
import PwaInit from '@/components/PwaInit';
import { BASE, BRAND } from '@/lib/brand';

const display = Big_Shoulders({ subsets: ['latin'], variable: '--f-display' });
const body = Barlow({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--f-body' });

export const metadata = { title: `${BRAND.title} – Acqua, calorie e macro`, description: 'Traccia acqua, calorie e macro ogni giorno.', applicationName: BRAND.title };
export const viewport = { viewportFit: 'cover' as const };

// Imposta il tema prima del paint per evitare il lampo chiaro/scuro (e il colore della barra del browser).
// Anti-clickjacking: se la pagina è dentro un iframe altrui, si nasconde (frame-ancestors non vale in un meta CSP).
const themeInit = `if(top!==self)document.documentElement.style.display='none';try{var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name=theme-color]');if(m)m.content=t=='light'?'#E9EEFB':'#0A1230'}catch(e){document.documentElement.dataset.theme='dark'}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${display.variable} ${body.variable}`} data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href={`${BASE}/manifest.webmanifest`} />
        <link rel="icon" href={`${BASE}/icon.svg`} type="image/svg+xml" />
        <link rel="apple-touch-icon" href={`${BASE}/apple-touch-icon.png`} />
        <meta name="theme-color" content="#0A1230" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content={BRAND.title} />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body><PwaInit />{children}</body>
    </html>
  );
}
