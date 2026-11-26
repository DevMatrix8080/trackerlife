# AquaMacro — mappa del progetto

> **Per chi apre una nuova chat:** leggi SOLO questo file, non scorrere tutti i sorgenti. Apri un file solo quando devi modificarlo. Aggiorna questa mappa a ogni modifica rilevante (struttura, modello dati, setup). Il file `CLAUDE.md` rimanda qui.

## Cos'è
Tracker personale (italiano, mobile-first, **PWA installabile**) di **acqua, calorie, macro**, con profilo TDEE, foto progressi cifrate e promemoria per bere. Login con nome utente + password; account e dati **sincronizzati su Supabase** (stesse credenziali su PC e telefono). Sito statico su **GitHub Pages** (`/trackerlife`).
Nome visibile: **AquaMacro** (era "MyLife"). Si cambia in un solo punto: `lib/brand.ts` (+ `public/manifest.webmanifest`, `public/icon.svg`, `PROJECT.md`).

## Stack
Next.js 16 (`output: 'export'`, statico) · React 19 · TypeScript · Supabase (Auth email/password + Postgres con RLS) · CSS puro (`app/globals.css`). Nessun backend proprio.

## Comandi
- `npm run dev` — sviluppo (basePath vuoto, service worker NON registrato)
- `npm run build` — `next build` + `scripts/csp.mjs` (inietta CSP nei file in `out/`)
- `npm run icons` — rigenera le PNG della PWA da `public/icon.svg` (usa `sharp`, già presente con Next)
- Deploy: push su `main` → `.github/workflows/pages.yml` costruisce e pubblica `out/`.

## Mappa file
### App e stile
| File | Ruolo |
|---|---|
| `app/layout.tsx` | Font (Big Shoulders + Barlow), `<head>` con manifest/icone/apple-touch-icon/theme-color, script anti-flash del tema (aggiorna anche `theme-color`), anti-clickjacking, monta `PwaInit` |
| `app/page.tsx` | Radice client. `onUser` → `pull()` dati cloud (fallback cache locale) → stato `data`; `pullFoods()` → stato `foods`. `update(fn)` clona, salva in localStorage e fa `push()`. Tab: Giornata, Cronologia, Cibi, Foto, Peso, Profilo. Contiene `saveGeneral`/`delGeneral` (tabella generale cibi) e chiama `useWaterReminders` |
| `app/globals.css` | Tutto lo stile. **Token colore** in cima (vedi sotto). Animazioni, View Transitions, scroll-driven, misuratore password (`.pw*`), barra acqua (`.gauge`, `.ghead`, `.gscale`), box "tabella generale" (`.ask`) |
### Componenti (`components/`)
| File | Ruolo |
|---|---|
| `Auth.tsx` | Accedi / crea account, mostra password, misuratore robustezza |
| `Today.tsx` | Vista giorno (con "Copia da ieri"): navigazione date, `Water`, `Nutrition`, `FoodAdd`, `FoodTable`; giorno `closed` blocca i campi |
| `Water.tsx` | Acqua vs obiettivo: numero grande, barra progresso (percentuale sopra, scala 0/metà/obiettivo sotto), pulsanti +ml, tag giornata + descrizione, spunta allenamento, coriandoli al traguardo. Chiama `markDrink()` a ogni sorso |
| `WaterYear.tsx` | Grafico annuale % giorni con obiettivo acqua raggiunto |
| `Nutrition.tsx` | Pannello kcal/macro vs `kgoal`, `fmax`, proteine minime |
| `FoodAdd.tsx` | Ricerca cibi (più usati in evidenza, `freq`), pasti salvati (`Data.meals`), porzioni, inserimento a mano. Dopo l'inserimento a mano chiede (`AskGeneral`) se aggiungerlo alla tabella generale |
| `AskGeneral.tsx` | Box "Vuoi aggiungerlo alla tabella generale di tutti i tuoi cibi?" (Sì → `onYes` asincrono con errore inline, No) |
| `Foods.tsx` | Tab Cibi: elenco completo + filtro; form "Aggiungi un tuo cibo": al salvataggio chiede **tabella generale** (Supabase) oppure **solo mio elenco** (`data.custom`). Elimina solo i cibi "tuo" |
| `FoodTable.tsx` | Tabella mangiato per pasto, totali, "Giornata finita"/"Riapri" |
| `History.tsx` | Cronologia anno → mese → giorno con medie |
| `Profile.tsx` | Profilo TDEE/obiettivo (`lib/tdee.ts`) → imposta `kgoal` |
| `AppSettings.tsx` | (tab Profilo) Installa app + promemoria acqua: permesso notifiche, orari, intervallo, "Prova notifica" |
| `Weight.tsx` | Tab Peso: peso/vita (`Data.body`), grafico, andamento 28 gg, correzione kcal da applicare a mano |
| `Week.tsx` | Riepilogo ultimi 7 giorni (in Cronologia) |
| `Backup.tsx` | Export CSV / backup JSON (in Profilo) |
| `Photos.tsx` | Foto progressi cifrate AES-256-GCM lato browser, diario, confronto |
| `ThemeToggle.tsx` | Tema chiaro/scuro (localStorage `theme`); senza scelta manuale segue il sistema anche a runtime; aggiorna `theme-color` |
| `PwaInit.tsx`, `CountUp.tsx`, `Icons.tsx` | Registra il service worker · numeri che scorrono · icone SVG (tratto 2px) |
### Libreria (`lib/`)
| File | Ruolo |
|---|---|
| `brand.ts` | `BRAND` (nome/tagline) e `BASE` (basePath per file in `public/`) |
| `store.ts` | Tipi `Food/Day/Data`, `ls` (localStorage), `today()`, `loadData`, `waterGoal`, `totals` |
| `cloud.ts` | Supabase: client (URL + publishable key, pubbliche), `authenticate`, `onUser`, `logout`, `pull/push` dati, `pullFoods` (con `id`, `own`), **`addFood`/`delFood`** (tabella generale), foto (`listPhotos/getPhoto/addPhoto/delPhotos`) |
| `foods.ts` | Tipo `Preset` (`id?`, `own?`), `searchFoods`, `hasFood` (duplicati per nome) |
| `reminders.ts` | Promemoria acqua: impostazioni (localStorage `reminders`), `notify` (via service worker, fallback `Notification`), hook `useWaterReminders` |
| `pwa.ts` | `registerSW` (solo prod), `useInstall` (evento `beforeinstallprompt`, standalone, iOS) |
| `crypto.ts` | AES-256-GCM + PBKDF2 per le foto | 
| `tdee.ts` · `password.ts` · `motion.ts` | Mifflin-St Jeor/obiettivi · regole password · View Transition `vt`, `reduced` |
### PWA (`public/`, copiati in `out/`)
| File | Ruolo |
|---|---|
| `manifest.webmanifest` | Nome, colori, icone; URL **relativi** (`./`) così funziona con basePath `/trackerlife` e in locale |
| `sw.js` | Service worker: shell offline (navigazioni network-first, asset stale-while-revalidate), **solo same-origin** (mai Supabase/dati); `notificationclick` riapre l'app. Per forzare l'aggiornamento della cache cambia `CACHE` |
| `icon.svg` | Icona 4096×4096 (goccia + livello d'acqua + 3 barre macro proteine/carbo/grassi). Sorgente di tutte le PNG |
| `icon-192/512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | Generate da `npm run icons` |
### Altro
`scripts/csp.mjs` (CSP in `<meta>` con hash degli script inline; `connect-src`: self + `*.supabase.co`) · `scripts/icons.mjs` · `supabase.sql` (schema + RLS) · `supabase-foods.sql` (**locale, gitignored**: cibi iniziali) · `PRODUCT.md` (brief prodotto) · `.github/` (Pages + Dependabot)

## Modello dati
```ts
Food   = { name, g, kcal, p, c, f, meal? }
Day    = { water: ml, train, foods: Food[], closed?, wtag?, wnote? }   // wtag: flex|sick|trip|busy
Data   = { days: Record<'YYYY-MM-DD', Day>, kgoal, fmax, profile?, custom?: Preset[], meals?, body?, vault?: {salt, check} }
Preset = { name, kcal, f, c, p, id?, own? }   // valori per la PORZIONE scritta nel nome
```
- Tabella `user_data` (`id` = uid, `d` jsonb = Data) · cache `localStorage['data:<nome>']`.
- **Cibi**: due livelli. (1) **Tabella generale** = tabella Supabase `foods`: righe iniziali con `uid` nullo (visibili a tutti gli utenti loggati) + righe aggiunte dal sito con `uid` = autore (visibili/cancellabili solo da lui). (2) **Elenco personale** = `Data.custom` (dentro `user_data`). La ricerca unisce `custom` + `foods`.
- Obiettivo acqua: allenamento 3000 ml; altrimenti giu–set 3000, resto 2500.
- localStorage per dispositivo (NON sincronizzato): `theme`, `reminders`, `lastdrink`, `lastremind`, `foods` (cache), `data:<nome>`.

## Colori light/dark (regole da rispettare)
Token in cima a `globals.css`, due set (`:root[data-theme=dark|light]`):
- **Fuori dai pannelli** (su `--surface`/`--bg`): `--aqua`, `--ok-fill`, `--carb`, `--protein`, `--fat` sono **riempimenti** (testo scuro sopra); per il **testo** usare `--aqua-text`, `--ok`, `--err`; focus = `--focus`.
- **Dentro `.panel`** (carta chiara nel tema scuro, inchiostro nel tema chiaro): usare solo i token `--p-*` (`--p-bg --p-ink --p-muted --p-line --p-aqua --p-protein --p-carb --p-fat --p-ok`), tarati sul fondo del pannello. Mai `--carb`/`--ok` dentro un pannello.
- Mai testo sopra la barra acqua (contrasto variabile): la percentuale sta sopra la barra.

## Mobile (regole)
- Mai richiedere la "modalità desktop": nessuna pagina deve avere scroll orizzontale (`html,body{overflow-x:clip}`).
- **Pagine**: sotto 860 px la barra schede in basso è una striscia scorrevole (la scheda attiva si centra da sola) e si cambia pagina anche con **swipe orizzontale** sul contenuto (`<main className="pages">` in `page.tsx`, soglia 70 px, solo se il gesto è quasi orizzontale). Lo swipe è ignorato su `.scroll`, input, `.foodlist`, svg, `.noswipe`. La transizione scorre in base alla direzione (`data-dir` su `<html>`).
- **Tabelle**: compatte, entrano nei ~350 px senza scorrere; la colonna "g" di `FoodTable` (`.foodt`) è nascosta su mobile. Nuove tabelle: tenere ≤ 7 colonne corte o usare `.scroll`.
- Regole CSS mobile in fondo a `globals.css` (blocco "Mobile").

## PWA e notifiche
- Installabile da mobile/desktop (Chrome: pulsante in Profilo → "Installa" o menu browser; iOS: Condividi → Aggiungi a Home).
- Service worker registrato solo in produzione (`registerSW`).
- **Promemoria per bere**: nessun server/push. Il controllo gira ogni 30 s nel browser finché l'app/scheda è aperta o in background. Notifica solo se: attivo, permesso concesso, pagina non in primo piano, dentro la fascia oraria, obiettivo non raggiunto, e passati X minuti dall'ultimo sorso/promemoria. **Limite**: se il sistema sospende/chiude l'app (tipico su telefono) non arriva nulla. Per notifiche garantite serve Web Push (VAPID + funzione Supabase Edge + cron): non implementato.

## Auth (flusso)
1. Nome utente `^[a-z0-9_.-]{3,20}$` → email finta `<nome>@mylife.app` (dominio storico, **non cambiare**: romperebbe gli account) → Supabase Auth.
2. Creazione account: password ≥10 caratteri + 3 requisiti su 4. Login: nessun minimo.
3. Login → `pull()`; se il documento cloud non esiste carica i dati locali. Offline → cache.
4. Logout → cancella `data:*`, `foods`, `users`, `session`, `locks` da localStorage e `signOut`. (Le impostazioni `theme`/`reminders` restano: sono del dispositivo.)

## Sicurezza (cosa c'è)
- Password gestite da Supabase Auth. RLS su tutte le tabelle: `user_data` solo proprietario; `photos` solo proprietario (testo cifrato); `foods` lettura `uid is null or uid = auth.uid()`, insert/delete solo righe proprie, nessun update; vincoli di forma/dimensione (CHECK).
- CSP stretta (hash script inline, `object-src 'none'`, `base-uri 'none'`, `form-action 'self'`), `referrer no-referrer`, anti-iframe. Il service worker è same-origin e non mette in cache dati utente.
- Nessun `dangerouslySetInnerHTML` con dati utente (solo script tema statico).

## Setup Supabase (una tantum)
1. supabase.com → New project. 2. SQL Editor → incolla `supabase.sql` → Run (se il DB esiste già, esegui solo l'ultimo blocco **"Aggiornamento: aggiungere cibi alla tabella generale"**: senza, "Sì, aggiungi" fallisce con errore). 3. Auth → Email: disattiva "Confirm email", min password 10. 4. URL Configuration: Site URL = `https://<utente>.github.io/trackerlife`. 5. SQL Editor → `supabase-foods.sql` (file locale) → Run. 6. URL + publishable key sono già in `lib/cloud.ts`. Mai la `service_role` key.

## Limiti noti / shortcut
- Errori di rete su `push` ignorati (cache locale; si risincronizza al salvataggio dopo). Multi-dispositivo: vince l'ultimo salvataggio (documento intero).
- Foto: nessuna miniatura/cache, ogni vista riscarica (~200 KB).
- Il minimo password di creazione è applicato solo dal client finché non si imposta in console Supabase.
- Promemoria acqua non garantiti con app chiusa (vedi sopra).

## Cronologia modifiche
1. MyLife base (localStorage) → 2. CSP e deploy Pages → 3. Animazioni → 4. Sync Supabase → 5. Password forte → 6-8. Cibi da CSV, poi spostati su tabella Supabase privata → 9. Profilo TDEE, pasti, foto cifrate con diario/confronto, tag e descrizione idratazione, grafico annuale acqua.
10. Funzioni d'uso quotidiano: cibi più usati, pasti salvati, copia da ieri, tab Peso, riepilogo settimanale, export (tutto dentro il jsonb `user_data.d`). README rimosso dal repo.
11. Mobile: barra schede scorrevole + swipe tra pagine, tabelle compatte senza scroll laterale.
12. **Rebrand AquaMacro**, nuova icona SVG 4K + PNG, **PWA** (manifest, service worker, installazione), **promemoria acqua** con notifiche, **barra acqua ridisegnata**, **sistema colori light/dark** riordinato (token `--p-*`, `--ok-fill`, `--err`, `--focus`), **"aggiungi alla tabella generale"** (cibi con `uid`, RLS insert/delete propri).
