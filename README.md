# CGN CONQUEST

Progetto indipendente da Milano. Primo prototipo giocabile locale: Cuggiono e Castelletto, immobili geografici reali, economia e proprietà virtuali. Non è ancora un multiplayer e non è una riproduzione catastale completa.

## Avvio

Node 22 o successivo. Nessuna dipendenza da installare.

```sh
npm test
npm start
```

Aprire http://127.0.0.1:4393. Per Vercel importare questo repository, preset Other, nessun comando di build, directory di output `.`. Non utilizzare il progetto Vercel Milano.

## Cosa si prova

- Una casa virtuale e 12.000 € iniziali; aprire servizi da casa per cominciare a incassare.
- Toccare una sagoma reale: acquisto, avvio e miglioramento hanno prezzo e conferma nel popup ancorato all’edificio. Il miglioramento mantiene aperto il popup.
- Proprietà → lista delle attività; Imprese → quota o acquisizione; Offerte → risposte e voti; Classifica → liquidità personale realmente spendibile.
- Cinque IA locali. Arrivano anche offerte di associazione: serve il voto umano, nessuna accettazione automatica per il giocatore.
- Salvataggio locale indipendente (`cgn-conquest-prototype-v1`). Non legge i salvataggi di Milano. Non genera entrate offline.
- Nessun audio. Nessuna autenticazione o raccolta di dati personali.

## Vendere significa continuare a giocare

Acquisizione totale: consenso di tutti i soci cedenti e del gestore; il prezzo va ai cedenti secondo le quote vendute. Il compratore ottiene la società, non il portafoglio personale del venditore. Il venditore resta gestore delle attività, conserva quanto incassato e riceve il 25% dell’utile operativo. Il proprietario riceve il restante 75%. Questa percentuale è provvisoria e bilanciabile. Il gestore può ancora migliorare le attività pagando con il proprio capitale e investire altrove.

Associazione: nel primo prototipo si vende il 25%; il titolare conserva almeno il 51% e continua a controllare. Il motore supporta anche una proposta iniziale del 49%. Utili proporzionali alle quote. Comprare una quota non consente di spendere la liquidità personale del socio.

Le proposte non spostano denaro. Alla conferma finale si ricontrollano liquidità e quote, poi il trasferimento avviene in modo atomico. Un rifiuto non costa nulla. Le proposte scadono dopo tre minuti di simulazione.

## Territorio e licenze

Sagome, strade e corsi d’acqua: © OpenStreetMap contributors, [ODbL](https://www.openstreetmap.org/copyright). L’estratto geografico derivato è disponibile in `data/territory.geojson`, con provenienza e conteggi in `data/provenance.json`. Non tutte le attività o destinazioni reali sono note: prezzi, destinazioni di gioco e diritti di proprietà sono inventati. La selezione automatica esclude le tipologie civiche esplicite; non certifica la destinazione reale di ogni immobile.

Confine comunale: ISTAT via [geojson-italy](https://github.com/guglielmo/geojson-italy), CC BY 4.0. Coordinate geografiche conservate, nessun reticolo inventato. Non si afferma una corrispondenza catastale o una completezza 1:1 di ogni particolare. Castelletto appartiene al comune: [fonte comunale](https://comune.cuggiono.mi.it/luoghi/2270030/frazione-castelletto).

Leaflet 1.9.4 vendorizzato in `vendor/`, licenza BSD nel file allegato. Il gioco non richiede tiles, CDN o query Overpass a ogni partita. `tools/fetch-map.py` esegue un estratto manuale; `tools/prepare-map.py` compila gli estratti OSM locali. La prima importazione è stata separata in edifici e rete per evitare timeout. Le coordinate dei due pulsanti di località sono punti di navigazione, non confini di frazione.

## Limiti e prossima fase

Questa è una fondazione verificabile, non un’economia definitiva: quattro attività, otto livelli, un solo tipo di ingresso minoritario nell’interfaccia. Mancano cantieri, evoluzione artistica delle sagome per livello, bilanciamento dei ritorni e specializzazioni delle nuove imprese. Le IA investono e negoziano ma non simulano persone online.

Per il multiplayer persistente: identità verificata; server autoritativo; proprietà e quote nel database; transazioni con revisione e chiave di idempotenza; offerte, voti e scadenze server; calcolo entrate su timestamp server; nessun capitale accettato dal client. Ogni edificio reale potrà ospitare unità virtuali stabili (sedi/appartamenti): nuovi giocatori non richiedono ridisegnare i confini di Cuggiono. Non pubblicare questa simulazione locale come economia online sicura.

La precedente copia di Milano è conservata nella cronologia e nel tag `archive/milano-placeholder`.

## Cartografia urbana · aggiornamento 0.2

La mappa distingue sagome residenziali note, industria/magazzini, commercio, servizi civici e patrimonio. Le destinazioni assenti nei dati restano “uso non censito”; non vengono inventati occupanti o settori reali. Prezzi, ricavi e attività giocabili rimangono virtuali, separati dal nome reale del luogo. I luoghi civici o storici riconosciuti sono consultabili e non acquistabili; le proprietà già presenti nei salvataggi restano compatibili.

`data/landscape.geojson` contiene le superfici reali di boschi, coltivi, aree urbane, produttive e verdi. `data/places.json` contiene 45 luoghi pubblicamente mappati e le rispettive fonti OSM; per Villa Annoni, Palazzo Clerici, il parco e altre emergenze sono collegate anche fonti del Comune, Ministero della Cultura o Regione Lombardia. I dati sono una fotografia cartografica: non si certifica che tutte le attività siano ancora aperte, né la completezza degli esercizi presenti.

Ombre leggere rispettano le sagome esistenti: non rappresentano altezze 3D misurate. Larghezze di strade e acque sono stilizzate per leggibilità. Non sono usate immagini satellitari o dati Google Earth. La vista resta una cartografia vettoriale 2D, utilizzabile senza chiavi API o tiles esterni. I nomi si diradano con lo zoom e con i filtri Territorio / Attività / Patrimonio. Luoghi apre un unico pannello con legenda e accesso ai punti reali.

L’arricchimento è riproducibile con `python tools/enrich-map.py` usando gli estratti OSM in cache. I JSON derivati e le date delle fonti sono inclusi nel repository; gli estratti grezzi, ignorati da Git, non sono richiesti dal gioco. La copertura delle aree dettagliate deriva dagli estratti API del centro e del settore occidentale, non da una nuova zonizzazione inventata o da una certificazione urbanistica.

## Vista di gioco a volumi · aggiornamento 0.3

L’ingresso apre una nuova rappresentazione urbana inclinata: volumi ortografici, pareti, tetti e ombre. Il pulsante “3D · Gioco / 2D · Reale” alterna il tavoliere e la cartografia precedente. Non è fotogrammetria Google Earth: sono volumi stilizzati ricavati dalle sagome OSM; quando manca l’altezza si usa una convenzione visiva esplicita.

La vista di gioco riduce le sagome intorno al loro centro (57% per gli edifici ordinari, 78% per gli elementi distintivi), lasciando più spazio visivo intorno ai lotti. Mostra i lotti principali da 90 m², i luoghi distintivi e tutte le proprietà già possedute. Gli annessi e i piccoli lotti restano nella vista geografica 2D. Le strade e i centri geografici non vengono inventati. Villa, Comune, industria e commercio mantengono nomi e fonti della cartografia.

Trascinamento, rotella/pinch, zoom ±, tasti freccia. Il tocco riconosce tetti, basi, facciate e un piccolo margine per il dito. Le operazioni economiche usano gli stessi identificativi e salvataggi; il popup di acquisto/miglioramento si ancora alla proiezione selezionata. Le schede geografiche rimangono accessibili anche dal pannello Luoghi.

## Identità degli edifici e comfort · aggiornamento 0.4

Archetipi grafici distinti: Villa Annoni con porticato e bandiera comunale, palazzi con cortile e colonne, chiese con campanile, monumenti con piedistallo, negozi con insegna/tenda e vetrine, aziende con coperture tecniche e lucernari, case con falde e aperture. I dettagli sono simbolici e servono a riconoscere la funzione, non ricostruzioni architettoniche certificate. Tutti gli edifici nominati nel dato geografico e quelli associati a luoghi noti restano visibili anche se piccoli.

Il terreno e le strade sono disegnati in una superficie fuori schermo con margine e riutilizzati durante il trascinamento. Il rilascio introduce inerzia breve con decadimento esponenziale; il nuovo tocco la ferma immediatamente. Lo zoom interpola per 160 ms. L’opzione di sistema “riduci movimento” disattiva inerzia e interpolazione. Nessun movimento perpetuo o audio.

## Entra in strada · aggiornamento 0.5

Click sull’omino accanto allo zoom, poi click su un punto della strada evidenziata. Nessun trascinamento dell’omino. Il punto viene agganciato al segmento stradale reale; il click lontano dalle strade non avvia la modalità.

La prima vista gaming in prima persona usa Three.js vendorizzato (versione in `vendor/three/version.json`, licenza MIT allegata), geometrie OSM e modelli schematici locali: non è Google Street View e non contiene panorami fotografici. WebGL 2 è necessario; se non disponibile, la modalità mappa resta utilizzabile.

PC: WASD, frecce (su/giù cammino, destra/sinistra rotazione), trascinamento per guardare, E per esaminare il bersaglio, Esc per chiudere la scheda o tornare alla mappa. Su mobile: analogico a sinistra, trascinamento del resto dello schermo per lo sguardo, pulsante Esamina. È anche possibile toccare/cliccare una facciata entro 90 metri.

Le schede usano il catalogo e il portafoglio esistenti: acquisto e miglioramento sono reali operazioni della stessa simulazione locale, con ricontrollo della liquidità. Non si comprano edifici civici, storici o esclusi dal catalogo; per le società altrui la negoziazione resta nel pannello Imprese della mappa. Nessun interno accessibile o multiplayer è simulato.

Movimento normalizzato, collisioni sulle sagome ridotte, stop dell’input al cambio scheda/finestra, aree circostanti ricaricate man mano che ci si sposta. Ombre, materiali, altezze mancanti e dettagli di facciata sono stilizzati; la posizione delle strade deriva dalla cartografia.
