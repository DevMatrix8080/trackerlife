# MyLife – Acqua, calorie, macro

Next.js + React + TypeScript, export statico. Dati e account salvati nel browser (localStorage), nessun segreto nel repo.

    npm install
    npm run dev      # http://localhost:3000
    npm run build    # genera ./out (con CSP) da pubblicare

## Pubblicazione (GitHub Pages)

Settings → Pages → Source: **GitHub Actions**. Il workflow `.github/workflows/pages.yml` compila e pubblica a ogni push su `main`.
Il sito sta sotto `/trackerlife` (`basePath` in `next.config.mjs`).

## Sicurezza

- **XSS:** niente HTML iniettato, React esce tutto il testo; Content-Security-Policy con hash degli script inline (`scripts/csp.mjs`), `object-src 'none'`, `base-uri 'none'`, connessioni solo verso Open Food Facts.
- **Clickjacking:** la pagina si nasconde se incorniciata da un altro sito.
- **Password:** PBKDF2-SHA256 con salt casuale e 600.000 iterazioni; mai salvata in chiaro.
- **Brute force:** dopo 5 password sbagliate il login si blocca (30 s, poi raddoppia fino a 1 ora); tempo di risposta uguale per utenti esistenti e no.
- **Prototype pollution:** nomi come `__proto__` rifiutati, lookup solo su chiavi proprie.
- **Dipendenze:** `npm audit` pulito, Dependabot settimanale.

Limite onesto: non c'è un server. Chi ha accesso fisico al browser (console, DevTools) può leggere o cancellare i dati locali, e il blocco anti brute force non lo ferma. Per account veri e sincronizzati serve un backend (es. Supabase o Firebase con regole di accesso per utente).
