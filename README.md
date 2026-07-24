# Max Salvaggio — Portfolio Website

Sito portfolio ufficiale del fotografo **Max Salvaggio**, con gallerie interattive divise per categoria e pagina Coming Soon con form di contatto.

## Struttura

| File | Descrizione |
|---|---|
| `index.html` | Home del portfolio con navigazione categorie |
| `coming-soon.html` | Pagina Coming Soon con mosaico fotografico e form contatto |
| `styles.css` | Stili globali (RAL 7016, RAL 7035, glassmorphism) |
| `app.js` | Logica galleria, lightbox e navigazione |
| `archive-data.js` | Dataset immagini generato automaticamente |
| `scan.py` | Script Python per scansionare l'archivio locale |

## Categorie

- Commercial
- Fashion – Location
- Fashion Studio
- Lingerie
- Menswear
- Swimwear

## Note

Le fotografie originali dell'archivio **non sono incluse** in questo repository per motivi di peso e copyright.  
Per eseguire il sito in locale, posiziona la cartella `Max Salvaggio Archivio/` nella stessa directory di `index.html`.

## Cronologia delle modifiche (CHANGELOG)

- **2026-07-18** – Ripristino forzato alla versione stabile via Git (commit 97704da).
- **2026-07-20** – Implementata logica "Registra & Invia Credenziali" per la sezione Guest (creazione Supabase, email Formspree, UI refresh).
- **2026-07-22** – Aggiunta area di upload drag-and-drop e gestione provini condivisi per la sezione Guest.
- **2026-07-22** – Ripristinato aspect-ratio naturale miniature (max-width 300px vert / 600px orizz) ed attivato lentino ingranditore 250% al passaggio del mouse.
- **2026-07-24** – Ottimizzato il lentino d'ingrandimento in modalità Pixel-Perfect (100% risoluzione nativa del file sorgente) con rendering ad alta nitidezza.
- **2026-07-24** – Ottimizzazione caricamento miniature Workspace: Lazy Loading, async decoding e caricamento progressivo a blocchi.
- **2026-07-24** – Risoluzione bug caricamento immagini Guest in client-area: allineamento generazione URL firmati (createSignedUrl con fallback a getPublicUrl).
- **2026-07-24** – Implementata paginazione a 8 foto con indicatore X/Y pag. nello Workspace e Admin.
- **2026-07-24** – Risolto bug di login/redirect Workspace (sessione persistente e verifica asincrona senza espulsioni) e stabilizzata paginazione a 8 provini con indicatore X/Y pag.
- **2026-07-24** – Fix matching percorso Storage Guest per il rendering dei provini in Workspace.
- **2026-07-24** – Implementata ricerca multi-percorso in cascata (`guest/${email}`, `${email}`, `${email.toLowerCase()}`, `${user.id}`) con log di debug in `client-area.html`.
- **2026-07-24** – Fix contrasto testo scheda vuota (`color: rgba(255,255,255,0.85)`) e timeout non-bloccante di 2.5s per ogni scansione percorso Storage in `client-area.html`.
- **2026-07-24** – Forzatura contrasto testo scuro (#111111/#333333/#222222) per la scheda vuota ed aggiunta del timeout non-bloccante sulla query del profilo utente in `client-area.html`.
- **2026-07-24** – Allineata la composizione del percorso Storage Guest tra Admin e Client-Area e risolto bug di sintassi PostgREST su email con carattere "+".
- **2026-07-24** – Nuova strategia: resize automatico miniature 240px/480px e fix definitivo loader client-area.
- **2026-07-24** – Fix strutturale con try-finally e fallback hard 3.5s per caricamento galleria client-area.
- **2026-07-24** – Fix sblocco automatico overlay verifica sessione in client-area.
- **2026-07-24** – Rimozione drastica overlay di caricamento iniziale per visualizzazione immediata workspace.
- **2026-07-24** – Fix recupero utente ed email per caricamento provini workspace.
- **2026-07-24** – Fix definitivo session check e hard redirect login se user undefined in client-area.
- **2026-07-24** – Fix generazione URL immagini con fallback signed e restyle griglia gallery-panel.
- **2026-07-24** – Rimozione crossorigin da tag img per corretto rendering provini.
- **2026-07-24** – FixSignedURL: utilizzo esclusivo createSignedUrl per ovviare alle restrizioni RLS dello storage.
- **2026-07-24** – Aggiunta funzionalità PhotoShare per lead generation eventi con download Social Ready.
- **2026-07-24** – Fix drag and drop area PhotoShare upload in admin.html.
- **2026-07-24** – Aggiunta anteprima foto evento e gestione storage in PhotoShare admin & client.
- **2026-07-24** – Uniformità grafica PhotoShare: dimensioni miniature 240px/480px, lentino zoom, checkbox in alto a destra e cestino in basso a destra.
- **2026-07-24** – Integrazione esatta Lightbox Guest per PhotoShare, controlli esterni all'immagine e mantenimento file originali.
- **2026-07-24** – Fix lentino reverse, re-layout controlli con checkbox a sinistra e cestino a destra sotto la foto in PhotoShare.
- **2026-07-24** – Fix lentino HD con sorgente full-res, checkbox in riga col nome file e aggiunta upload foto su evento esistente in PhotoShare.
- **2026-07-24** – Aggiornate dimensioni miniature a max 200px/400px e aggiunta cancellazione multipla in blocco per PhotoShare admin.
- **2026-07-24** – Aggiunto pulsante verde download ZIP per foto selezionate in PhotoShare admin.
- **2026-07-24** – Allineati sulla stessa riga i pulsanti di azione foto e aggiunto tasto Deseleziona Tutto in PhotoShare admin.
- **2026-07-24** – Rimosso pulsante cestino singolo dalle miniature in PhotoShare.
- **2026-07-24** – Rimosso cestino singolo dalle miniature, aggiunto tasto Seleziona Tutto come primo pulsante a sinistra in PhotoShare admin.
- **2026-07-24** – Forzato layout single-line no-wrap per tutti i pulsanti azione foto in PhotoShare admin.

---

© Max Salvaggio — Tutti i diritti riservati
