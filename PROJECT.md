# MyLife — mappa completa del progetto

Leggi SOLO questo file per capire il progetto. Aggiornalo a ogni modifica rilevante.

## Cos'è
Tracker personale (italiano, mobile-first) di **acqua, calorie, macro**. Login con nome utente + password. Account e dati **sincronizzati sul cloud (Firebase)**: stesse credenziali su PC e telefono. Sito statico su **GitHub Pages** (`/trackerlife`).

## Stack
Next.js 16 (`output: 'export'`, statico) · React 19 · TypeScript · Firebase (Auth email/password + Firestore) · CSS puro (`app/globals.css`). Nessun backend proprio.

## Comandi
- `npm run dev` — sviluppo
- `npm run build` — `next build` + `scripts/csp.mjs` (inietta CSP nei file in `out/`)
- Deploy: push su `main` → `.github/workflows/pages.yml` costruisce e pubblica `out/`.

## Struttura file
| File | Ruolo |
|---|---|
| `app/layout.tsx` | Font (Big Shoulders + Barlow), script anti-flash del tema, anti-clickjacking (nasconde la pagina se in iframe) |
| `app/page.tsx` | Radice client. `onUser` (sessione Firebase) → `pull()` dati cloud (fallback cache locale) → stato `data`. `update(fn)` clona, salva in localStorage (cache) e fa `push()` su Firestore. Tab Giornata/Cronologia. Logout = `logout()` |
| `app/globals.css` | Tutto lo stile. Variabili tema dark/light (`--bg --aqua --protein --carb --fat --ok`, pannelli `--p-*`). Animazioni, View Transitions, scroll-driven. In fondo: stile misuratore password (`.pwmeter`, `.pwbars`, `.pwlist`) |
| `lib/store.ts` | Tipi `Food/Day/Data`, helper `ls` (localStorage), `today()`, `loadData(user)`, `waterGoal(date, train)`, `totals(foods)`. **Niente auth qui** |
| `lib/cloud.ts` | Firebase: config (4 chiavi da incollare), `authenticate(nome, pw, signup)`, `onUser(cb)`, `logout()` (pulisce cache locale), `pull()`, `push(data)` |
| `lib/password.ts` | `PW_MIN=10`, `pwChecks`, `pwStrong` (≥10 car. + 3 requisiti su 4), `pwScore` (0-4) |
| `lib/motion.ts` | `vt(fn)` = View Transition con fallback; `reduced()` = prefers-reduced-motion |
| `components/Auth.tsx` | Form accedi / crea account, mostra/nascondi password, misuratore robustezza animato |
| `components/Today.tsx` | Vista giorno: navigazione date, Water, Nutrition, FoodAdd, FoodTable; giorno `closed` blocca i campi |
| `components/Water.tsx` | Acqua vs obiettivo, spunta allenamento, storico 7 gg, festeggia al superamento |
| `components/Nutrition.tsx` | Totali kcal/macro vs `kgoal` e `fmax` (grassi) |
| `components/FoodAdd.tsx` | Ricerca Open Food Facts (per 100 g) o inserimento manuale |
| `components/FoodTable.tsx` | Tabella cibi, totali, "Giornata finita"/"Riapri" |
| `components/History.tsx` | Cronologia anno → mese → giorno con medie |
| `components/CountUp.tsx`, `Icons.tsx`, `ThemeToggle.tsx` | Numeri che scorrono, icone SVG, tema chiaro/scuro (salvato in localStorage `theme`) |
| `scripts/csp.mjs` | Post-build: CSP in `<meta>` con hash SHA-256 degli script inline. `connect-src`: self, Open Food Facts, `*.googleapis.com` (Firebase) |
| `firestore.rules` | Regole Firestore (da incollare in console) |
| `PRODUCT.md` | Brief di prodotto/design (Impeccable) |

## Modello dati
```ts
Food = { name, g, kcal, p, c, f }
Day  = { water: ml, train: boolean, foods: Food[], closed?: boolean }
Data = { days: Record<'YYYY-MM-DD', Day>, kgoal: 2500, fmax: 60 }
```
Cloud: Firestore `users/{uid}` = `{ d: Data }`. Cache locale: `localStorage['data:<nome>']`.
Obiettivo acqua: allenamento 3000 ml; altrimenti giu–set 3000, resto 2500.

## Auth (flusso)
1. Nome utente `^[a-z0-9_.-]{3,20}$` → email finta `<nome>@mylife.app` → Firebase Auth email/password.
2. **Creazione account**: password ≥10 caratteri + 3 requisiti su 4 (maiuscole+minuscole, numero, simbolo), non tutta uguale. Login: nessun minimo (non blocca chi ha già account).
3. Login → `pull()`. Se il documento cloud non esiste, carica i dati locali del browser (migrazione). Offline → usa cache.
4. Logout → cancella `data:*`, `users`, `session`, `locks` da localStorage e `signOut`.

## Sicurezza (cosa c'è)
- Password mai nel codice: hash/rate-limit gestiti da Firebase Auth (blocco `auth/too-many-requests`).
- Firestore: solo il proprietario legge/scrive il proprio doc; forma e dimensione validate; cancellazione e tutto il resto negati (`firestore.rules`).
- CSP stretta (no script inline non hashati, `object-src 'none'`, `base-uri 'none'`, `form-action 'self'`), `referrer no-referrer`, anti-iframe.
- Messaggi d'errore uniformi (`Credenziali errate`), nessuna enumerazione utenti dal client.
- Nessun `dangerouslySetInnerHTML` con dati utente (solo lo script del tema, statico).

## Setup Firebase (una tantum, da fare in console)
1. Crea progetto → Authentication → Email/Password **attivo**.
2. Authentication → Impostazioni → **Criteri password**: lunghezza min 10 (applicato lato server, il client è solo UX). Attiva **Protezione enumerazione email**. Domini autorizzati: `<utente>.github.io`.
3. Firestore Database → crea → Regole → incolla `firestore.rules` → Pubblica.
4. Impostazioni progetto → app Web → copia `apiKey, authDomain, projectId, appId` in `lib/cloud.ts` (righe `initializeApp({...})`). Sono pubbliche per design.
5. Google Cloud Console → Credenziali → limita l'API key ai referrer HTTP `https://<utente>.github.io/*`.
6. (Consigliato) App Check con reCAPTCHA v3 per bloccare client non ufficiali.

## Limiti noti / shortcut
- `lib/cloud.ts` contiene ancora i segnaposto `INCOLLA_*` finché non si inserisce la config → senza di essa login/registrazione falliscono.
- Errori di rete su `push` sono ignorati (la cache locale tiene i dati; si risincronizza al salvataggio successivo). Conflitto multi-dispositivo: vince l'ultimo salvataggio (intero documento).
- Account vecchi creati solo in localStorage NON esistono nel cloud: vanno ricreati.
- Il minimo password di creazione è applicato solo dal client finché non si imposta il criterio in console.

## Cronologia modifiche
1. MyLife base (Next.js, localStorage).
2. Sicurezza: CSP, anti brute-force locale, deploy GitHub Pages.
3. Animazioni: View Transitions, CountUp, effetto liquido, scroll-driven.
4. **Sync multi-dispositivo**: Firebase Auth + Firestore (`lib/cloud.ts`), rimosso auth locale PBKDF2 da `store.ts`; CSP aperta a `*.googleapis.com`.
5. **Password forte in creazione** con misuratore animato (`lib/password.ts`, `Auth.tsx`, CSS `.pw*`); logout pulisce cache; `firestore.rules` con validazione.
