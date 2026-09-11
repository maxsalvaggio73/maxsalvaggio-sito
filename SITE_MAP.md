# Mappa del Sito e Architettura del Progetto — Max Salvaggio Portfolio

**Ultimo aggiornamento:** 11 Settembre 2026  
**Tag di Stato Stabile:** `STABLE_STATE_2026_09_11_2200`

---

## 1. Architettura delle Rotte SPA (Single Page Application)

Il sito opera su un'unica struttura HTML ([index.html](file:///Users/mm/Downloads/MAX%20APP%2001/index.html) e [home.html](file:///Users/mm/Downloads/MAX%20APP%2001/home.html)), gestita dinamicamente da [app.js](file:///Users/mm/Downloads/MAX%20APP%2001/app.js).

| Rotta / Hash | Sezione SPA | Descrizione & Comportamento |
|---|---|---|
| `/` o `index.html` | **Overview** | Pagina di atterraggio principale. Renderizza immediatamente ed in modo non-bloccante le miniature WebP locali. |
| `#portraits` | **Portraits** | Gallerie ritratti con tab interni: `PORTRAITS I`, `PORTRAITS II` (Unpublished Research) e `Pets & Portraits`. |
| `#body-form` | **Body & Form** | Sculture organiche e chiaroscuri con tab: `Organic Sculptures` e `Shadows & Graphic Intimacy`. |
| `#archive` | **Archive** | Landing page archivio categorizzato (Editorials, Lingerie, Swimwear). |
| `#editorials` | **Editorials** | Progetti editoriali e collezioni pubblicate. |
| `#campaigns-fashion` | **Fashion** | Campagne di moda e location. |
| `#campaigns-lingerie` | **Lingerie** | Campagne lingerie. |
| `#campaigns-swimwear` | **Swimwear** | Campagne swimwear. |
| `#contact` | **INFO** | Biografia di Max Salvaggio, ritratto ufficiale e informazioni di contatto direct (`max@maxsalvaggio.com`). |

---

## 2. Struttura delle Risorse Fisiche e Asset Locali

```
MAX APP 01/
├── index.html                   # Entry-point root servito direttamente all'utente
├── home.html                    # Template sorgente SPA
├── app.js                       # Logic di rendering SPA, Lightbox e paginazione
├── archive-data.js              # Database JavaScript locale auto-generato con metadati immagini
├── styles.css                   # Stili globali CSS, Glassmorphism, Responsive & Dark/Light mode
├── scan.py                      # Script Python per scansionare le cartelle e rigenerare archive-data.js
├── Aggiorna_Portfolio.command   # Script di automazione per rigenerare il database localmente
├── overview/                    # Cartella ad alte prestazioni contenente le miniature WebP (70 file)
│   └── *.webp
├── 0 OVERVIEW/                  # Cartella immagini master sorgente (JPG)
├── 1 EDITORIALS/                # Cartella master Editoriali
├── 2 CAMPAIGNS/                 # Cartella master Campagne
├── 3 BODY & FORM/               # Cartella master Body & Form
├── 4 PORTRAITS I/               # Cartella master Ritratti
├── 5 BIO & CONTACT/             # Fotografia ed asset biografia
└── assets/                      # Thumbnail e risorse statiche di supporto
```

---

## 3. Flusso di Rendering ed Ottimizzazione Performance

1. **Iniezione Sincrona Istantanea (OVERVIEW):**
   - All'apertura della pagina, `initApp()` in [app.js](file:///Users/mm/Downloads/MAX%20APP%2001/app.js) legge il dataset locale `portfolioData.overview` da `archive-data.js`.
   - Genera l'ordinamento curato (`generateCuratedOverviewList`) ed inietta il primo blocco di miniature `.webp` direttamente dalla cartella `overview/` senza alcuna chiamata bloccante a Supabase o servizi remoti.

2. **Differimento Asincrono (Non-Bloccante):**
   - Tutte le operazioni di inizializzazione secondarie (caricamento portfolio Supabase per sezioni aggiuntive, griglie Editorials/Campaigns/Portraits, form di contatto, tracker del cursore) vengono differite tramite `requestAnimationFrame` e `setTimeout(..., 0)`.
   - Il DOM e la risposta HTTP alla radice rimangono liberi ed immediati (`200 OK`).
