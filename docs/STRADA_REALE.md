# Strada reale: integrazione parallela

La vista 3D rimane intatta. Il pulsante **Strada reale** apre un laboratorio con
tre tappe verificate nella ricognizione: Piazza San Giorgio, Villa Annoni e il
Naviglio a Castelletto. Proprietà, capitale e operazioni usano lo stesso engine e
lo stesso salvataggio locale. Nessun multiplayer viene introdotto.

## Stato senza chiave

Il percorso e la gestione delle proprietà vicine funzionano. Il pannello dichiara
esplicitamente che le fotografie non sono attive. Un link apre il punto in Google
Maps; quella visita esterna non sincronizza movimento o acquisti. **Non è una
Street View fotografica incorporata già operativa.**

## Attivazione su Vercel

1. Creare un progetto Google Maps Platform con fatturazione e Maps JavaScript API.
2. Creare una **browser key**, limitata all'API Maps JavaScript e ai referrer
   `https://cgn-conquest.vercel.app/*` (aggiungere solo eventuali domini realmente usati).
3. Impostare la variabile Vercel `GOOGLE_MAPS_BROWSER_KEY` e rifare il deploy.
4. Configurare quote/avvisi di spesa nel progetto Google Cloud.

La chiave browser viene necessariamente restituita al client da `/api/street-config`:
non usare credenziali server, service account o token privati. Nessun SDK Google
viene caricato prima che il giocatore apra questa modalità. Le immagini restano
nel visualizzatore ufficiale; niente download, caching o ricostruzione da immagini.

## Collaudo necessario dopo attivazione

Verificare copertura di tutte le tappe, navigazione, errori di autenticazione,
attribuzione Google sempre visibile, selezione marker e acquisto/potenziamento.
I marker sono basati sui centri OSM, **non ingressi catastali verificati**.
La colonna proprietà serve anche quando il marker è nascosto o poco preciso.
Il pulsante Vista 3D passa alla posizione corrente, senza modificare proprietà.

## Limiti e prossimo passo

Il panorama è fotografico: gli upgrade non modificano le fotografie. Il progresso
è nelle schede e nei marker. Dopo la verifica visiva con servizio attivo, valutare
etichette di livello e un ingresso comune alle due viste. Non rimuovere la vista
3D prima del confronto. Chi possiede fotografie panoramiche proprie può in futuro
aggiungere un provider indipendente: nessuna immagine Google è copiata negli asset.

Fonti: https://developers.google.com/maps/documentation/javascript/streetview
e https://developers.google.com/maps/documentation/javascript/get-api-key
