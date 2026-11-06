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
