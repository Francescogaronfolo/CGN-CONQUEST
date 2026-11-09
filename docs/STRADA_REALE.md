# Strada foto: prototipo fotografico giocabile

Il pulsante **Foto reali** apre sei fotografie reali di Cuggiono e Castelletto ospitate nel
progetto e utilizzabili senza API o chiavi. Il gioco non manda su Google Maps.
Le sole pagine esterne sono i crediti/fonte/licenza, apribili volontariamente.

## Cosa funziona
- Trascinamento con inerzia assente per mantenere il tocco preciso; zoom ruota/+/-.
- Facciate SVG cliccabili e insegne virtuali di attività, proprietà e livello.
- Acquisto/potenziamento usando lo stesso engine, la stessa cassa e il salvataggio.
- Scheda vicina alla facciata che resta aperta dopo il miglioramento.
- Cambio punto fra sei fotografie; passaggio nello stesso luogo alla vista 3D.
- Controlli touch e tastiera (frecce/WASD per spostare l'inquadratura).

## Provenienza e limiti
Vedere assets/photo-street/sources.json e README.md. Foto 2007 e 2021 da Wikimedia
Commons, licenze CC BY-SA 3.0/4.0. Non sono 360°, non c'è una sequenza stradale
continua e le associazioni visive con gli immobili OSM sono indicative. Questo è
un esperimento di comfort e integrazione, non un rilievo catastale. La crescita
compare tramite insegne, livello e evidenziazioni: i pixel delle facciate reali
non vengono ancora ricostruiti in 3D. Le proprietà protette restano escluse.

## Evoluzione
Per una vera passeggiata continua servono fotografie panoramiche ravvicinate con
licenza compatibile oppure scatti propri. Il modello scene/facciate separato
permette di aggiungerle senza cambiare economia o salvataggio. La precedente
integrazione Google predisposta non è usata da questa modalità: nessun servizio
Google viene richiesto e non serve attivare fatturazione per questo prototipo.

Accesso diretto: `/?view=foto`, oppure `/?view=foto&scene=fratelli`.
Anteprime fotografiche scorrevoli; primo panorama alleggerito a circa 300 KB.

## Esperienza strada unificata
Un solo comando **Esplora strada**, una barra Foto/3D e una sola scheda di gestione.
Il cambio 3D → Foto è abilitato entro 120 metri da una scena disponibile; fuori
copertura non viene effettuato un teletrasporto. Il ritorno alla stessa scena 3D
ripristina coordinate, orientamento e inclinazione esatti, mantenendo l'edificio
selezionato. Scegliere un altro luogo dal menu invalida il punto precedente.
I punti di ingresso sono agganciati alla strada OSM vicina per evitare lo spawn
in un edificio o nel canale. Alcune facciate usano ritagli poligonali delle stesse
foto, con crediti condivisi. Sono texture illustrative: nessuna ricostruzione
fotogrammetrica né corrispondenza metrica verificata. Tutti gli scatti restano
consultabili nel menu Luoghi; panorama continuo 360° ancora non disponibile.
