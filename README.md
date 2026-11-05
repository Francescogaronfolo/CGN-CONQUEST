# Milano Capitali

Gioco gestionale 2D nella provincia di Milano: sviluppa attività, collega comuni e negozia con le altre società. Progetto autonomo derivato dal prototipo Comuni & Capitali di Trenoscommesse, mantenendo solo il gioco provinciale e i suoi test.

## Avvio e pubblicazione

Richiede Node.js 22 o successivo. Nessuna dipendenza da installare.

```sh
npm start
```

Apri http://localhost:4391. Test: `npm test`.

**Vercel:** importa questo repository, seleziona framework **Other**, lascia vuoto il comando di build e usa la cartella radice come output (`.`). La configurazione è già in `vercel.json`. Il gioco si apre direttamente su `/`, non su una sottopagina.

Questa versione funziona contro IA e salva nel browser. **Non è multiplayer online**: accessi, database Firebase e progressi condivisi saranno integrati separatamente. Nessun audio e nessun collegamento ai dati di altri giochi. Il salvataggio ha una chiave propria e non modifica quello di Trenoscommesse.

## Miglioramenti della versione separata

- Mappa con colori distinti delle imprese, confini esterni e sedi direttamente selezionabili. La provincia rimane senza linee di collegamento; strade e attività compaiono allo zoom urbano.
- Selezione dei lotti che privilegia edifici rispetto alle strade sottostanti; tolleranza maggiore al tocco, senza selezionare al termine di trascinamenti o pinch.
- Scorrimento inerziale con frenata; zoom a rotella progressivo. Recentratura interrompe il movimento. La barra zoom rimane disponibile.
- “Le mie attività”: acquisti e potenziamenti nello stesso pannello, piani 25%/50%/tutto, posizione di ogni edificio raggiungibile dalla lista. Il pannello rimane aperto durante i lavori.
- “Società & accordi”: tutte le imprese, filtro alleati, accesso alla mappa, scambi, proposta cooperativa diretta. Le proposte richiedono consenso; nessun fondo privato condiviso automaticamente.
- Preparazione dei piani edilizi evitata in panoramica e geometria dei confini riutilizzata finché non cambia la proprietà. Nessun font esterno richiesto.

La cooperazione attuale è una coalizione bilaterale temporanea: passaggio reciproco e +5% alle entrate. Ogni società conserva proprietà, denaro e risorse. Non è una fusione.

## Struttura

- `index.html`: ingresso e interfaccia del gioco.
- `milano/comuni/app.js`: flussi di gioco e pannelli.
- `view.js`: canvas, camera e livelli della mappa.
- `interaction.js`: selezione, inerzia e stato delle relazioni.
- `relations.js`: schede società e accesso alla cooperazione.
- `management.js`: patrimonio, acquisti e piani di potenziamento.
- `engine.js`: simulazione, regole e conservazione delle risorse.
- `tests/`: economia, costruzione, salvataggi, mappa e interazioni.

I dettagli della simulazione precedente sono in `milano/comuni/README.md`. I percorsi pubblici e i riferimenti a Firebase descritti storicamente non sono parte di questa versione autonoma.

## Dati geografici

Confini ISTAT tramite [geojson-italy](https://github.com/guglielmo/geojson-italy), licenza CC BY 4.0; vedi [ATTRIBUTION.md](ATTRIBUTION.md). Eccezioni di gioco dichiarate: Milano divisa in quattro settori; San Colombano ricollocato vicino a San Zenone. La rete urbana è una rappresentazione di gioco, non un rilievo stradale reale.
