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

---

© Max Salvaggio — Tutti i diritti riservati
