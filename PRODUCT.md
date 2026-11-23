# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Una persona che si allena (palestra) e vuole seguire ogni giorno acqua, calorie e macro. Uso quotidiano, soprattutto da telefono (confermato), in momenti rapidi: aggiungere acqua, registrare un cibo, chiudere la giornata. Il repository sarà pubblico, quindi altri potrebbero registrarsi; l'uso principale resta personale.

## Product Purpose
Tracciare ogni giorno l'acqua bevuta rispetto a un obiettivo (3 L nei giorni di allenamento, altrimenti 2500 ml in inverno e 3 L in estate), registrare i cibi con calorie e macro, tenere i grassi bassi, chiudere la giornata ("Giornata finita") in una tabella, e consultare la cronologia per anno, mese e giorno. Successo: aggiornare in pochi secondi e capire a colpo d'occhio se si è in linea.

## Positioning
Un unico posto che unisce idratazione (con obiettivo legato all'allenamento e alla stagione) e nutrizione con controllo esplicito dei grassi e chiusura giornaliera, senza account esterni né server.

## Operating Context
Web app Next.js + React + TypeScript, export statico. Account e dati salvati nel browser (localStorage), niente server né segreti nel repo. Lingua: italiano. Ricerca cibi tramite Open Food Facts.

## Capabilities and Constraints
- Login con nome utente e password (solo locale, PBKDF2).
- Acqua con obiettivo dinamico, spunta allenamento, storico 7 giorni.
- Cibi: ricerca Open Food Facts o inserimento manuale; tabella con kcal, proteine, carboidrati, grassi e totali; limite grassi configurabile (default 60 g); obiettivo kcal configurabile (default 2500).
- "Giornata finita" blocca la giornata; "Riapri" la sblocca.
- Cronologia anni, mesi, giorni con medie.
- Temi chiaro e scuro con interruttore manuale (richiesto).

## Evidence on Hand
Nessun logo, brand o contenuto esistente: nome "MyLife" soltanto. Nessun dato reale da mostrare oltre a quello inserito dall'utente.

## Product Principles
1. Velocità prima di tutto: ogni azione frequente a un tocco sul telefono.
2. Lo stato del giorno si legge a colpo d'occhio: acqua, calorie, grassi.
3. I grassi alti sono un segnale chiaro, non una nota nascosta.
4. Nessun dato lascia il dispositivo oltre alla ricerca cibi.

## Accessibility & Inclusion
Uso da telefono, anche all'aperto: contrasto alto e bersagli touch grandi. Rispettare prefers-reduced-motion.
