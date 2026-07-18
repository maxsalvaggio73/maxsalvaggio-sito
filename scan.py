import os
import json
import re
from datetime import datetime, timezone

base_dir = os.path.dirname(os.path.abspath(__file__))
output_file = os.path.join(base_dir, 'archive-data.js')

# Web-friendly formats
VALID_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}

def clean_title(filename):
    # Get base name without extension
    name, _ = os.path.splitext(filename)
    
    # Remove common prefixes
    prefixes = [
        r'^Max_Salvaggio_', r'^MAX_SALVAGGIO_', r'^Max-Salvaggio-Portfolio-',
        r'^Max-Salvaggio-', r'^MaxSalvaggio-', r'^Max_Salvaggio_©_',
        r'^Max_Salvaggio_edit_', r'^max_salvaggio_fotografo_'
    ]
    for p in prefixes:
        name = re.sub(p, '', name, flags=re.IGNORECASE)
    
    # Replace underscores and dashes with spaces
    name = re.sub(r'[_-]', ' ', name)
    
    # Clean up multiple spaces
    name = re.sub(r'\s+', ' ', name).strip()
    
    # Title Case
    return name.title()

def get_images_in_dir(path, tag_name, relative_base):
    images = []
    if not os.path.exists(path):
        return images
    
    from PIL import Image as PILImage
    for file in sorted(os.listdir(path)):
        file_path = os.path.join(path, file)
        if os.path.isfile(file_path):
            _, ext = os.path.splitext(file.lower())
            if ext in VALID_EXTENSIONS:
                # Relative URL to be used in html/js
                rel_url = os.path.relpath(file_path, relative_base)
                # Normalize path separators for web (forward slashes)
                rel_url = rel_url.replace('\\', '/')
                
                # Leggi dimensioni per filtrare orientamento in JS
                w, h = 0, 0
                try:
                    with PILImage.open(file_path) as pimg:
                        w, h = pimg.size
                except Exception:
                    pass

                images.append({
                    'url': rel_url,
                    'title': clean_title(file),
                    'tag': tag_name,
                    'width': w,
                    'height': h,
                    'is_horizontal': w > h
                })
    return images

def scan_all():
    print("Inizio scansione cartelle...")
    
    data = {
        'overview': [],
        'editorials': {
            'projects': [],
            'unpublished_research': []
        },
        'campaigns': {
            'fashion': [],
            'lingerie': [],
            'swimwear': []
        },
        'body_and_form': {
            'organic_sculptures': [],
            'shadows_and_graphic_intimacy': []
        },
        'portraits_and_beauty': {
            'portraits': [],
            'beauty': [],
            'pets_and_portraits': []
        }
    }

    # 1. OVERVIEW
    overview_path = os.path.join(base_dir, '0 OVERVIEW')
    overview_images = get_images_in_dir(overview_path, 'OVERVIEW', base_dir)
    
    # 40 foto di altissimo profilo luxury ed estremamente variegate (Vogue style opener)
    # alternate per modella, tipologia merceologica, colori ed ambientazioni.
    PRIORITY_IMAGES = [
        "max-salvaggio-fotografo-drink-campaign-campari.jpg",                   # Commercial (Drink) - Rosso vibrante
        "max-salvaggio-fotografo-beauty-ray-bitancourt-021.jpg",                 # Beauty (Modella di colore) - Studio close-up
        "max-salvaggio-fotografo-moda-grazia-daniela-de-jesus-cambodia-143.jpg", # Fashion Location (Abito rosso/Tempio)
        "max-salvaggio-fotografo-adv-bag-dee-ocleppo.jpg",                       # Accessori (Borsa luxury) - Campagna Adv
        "max-salvaggio-fotografo-nudo-fine-art-003.jpg",                         # Nudo fine-art (B&W/Chiaroscuro)
        "max-salvaggio-fotografo-moda-grazia-hong-kong-042.jpg",                 # Urbano notturno (Neon/Cinematic) - Modella asiatica/dettaglio
        "max-salvaggio-fotografo-beauty-001.jpg",                               # Beauty (Modella bionda/chiara) - Studio
        "max-salvaggio-fotografo-lingerie-010.jpg",                             # Lingerie (Ombre calde/Sensuale)
        "max-salvaggio-fotografo-polo-cavallo-Anna-001.jpg",                     # Sport/Equitazione (Azione/Polo)
        "max-salvaggio-fotografo-portrait-uomo-013.jpg",                         # Menswear (Ritratto maschile) - B&W
        "max-salvaggio-fotografo-moda-grazia-egypt-081.jpg",                     # Travel (Deserto Egitto/Sabbia)
        "max-salvaggio-fotografo-swimwear-014.jpg",                             # Swimwear (Campagna mare/Acqua azzurra)
        "max-salvaggio-fotografo-beauty-007.jpg",                               # Beauty (Luxury editorial/Studio)
        "max-salvaggio-fotografo-lingerie-007.jpeg",                             # Lingerie (Luce soffusa/Modella chiara)
        "max-salvaggio-fotografo-moda-grazia-daniela-de-jesus-mexico-088.jpeg",   # Beach Editorial (Tulum/Toni caldi)
        "max-salvaggio-fotografo-nudo-fine-art-009.jpg",                         # Fine Art (Abstract B&W)
        "max-salvaggio-fotografo-polo-cavallo-Bea-001.jpg",                     # Sport/Fashion (Polo/Cavalli)
        "max-salvaggio-fotografo-moda-grazia-kenya-103.jpg",                     # Travel (Safari Kenya/Colori caldi)
        "max-salvaggio-fotografo-portrait-cane-cecilia-capriotti-001.jpg",       # Portrait/Pets (Cane & Celebrità)
        "max-salvaggio-fotografo-moda-grazia-shanghai-073.jpg",                   # Urban Travel (Shanghai/Toni rossi)
        "max-salvaggio-fotografo-swimwear-033.jpg",                             # Swimwear (Luce del tramonto/Sabbia)
        "max-salvaggio-fotografo-nude-fine-art-006.jpg",                         # Fine Art (B&W/Studio)
        "max-salvaggio-fotografo-beauty-002.jpg",                               # Beauty (Primi piani/Studio)
        "max-salvaggio-fotografo-lingerie-023.jpg",                             # Lingerie (Luce calda)
        "max-salvaggio-fotografo-moda-grazia-sicilia-097.jpg",                   # Location (Sicilia mare/Scogliera)
        "max-salvaggio-fotografo-moda-grazia-vietnam-136.jpg",                   # Travel (Vietnam/Toni verdi/Templi)
        "max-salvaggio-fotografo-moda-grazia-hong-kong-051.jpeg",                 # Urban (Hong Kong di giorno/Azione)
        "max-salvaggio-fotografo-nudo-fine-art-011.jpg",                         # Fine Art (Profilo B&W)
        "max-salvaggio-fotografo-beauty-013.jpg",                               # Beauty (Close-up labbra/Dettaglio)
        "max-salvaggio-fotografo-moda-grazia-tulum-024.jpg",                     # Beach (Tulum spiaggia)
        "max-salvaggio-fotografo-polo-cavallo-Anna-006.jpg",                     # Sport (Cavallo dettaglio)
        "max-salvaggio-fotografo-lingerie-005.jpg",                             # Lingerie (Ombre e luce finestra)
        "max-salvaggio-fotografo-moda-grazia-daniela-de-jesus-cambodia-147.jpg", # Location (Tempio Angkor Wat)
        "max-salvaggio-fotografo-swimwear-024.jpg",                             # Swimwear (Piscina/Toni freddi)
        "max-salvaggio-fotografo-beauty-015.jpeg",                               # Beauty (Modella asiatica/Studio)
        "max-salvaggio-fotografo-moda-grazia-hong-kong-043.jpeg",                 # Urbano (Hong Kong notte/Taxi)
        "max-salvaggio-fotografo-moda-grazia-daniela-de-jesus-mexico-090.jpeg",   # Beach Editorial (Messico mare)
        "max-salvaggio-fotografo-moda-grazia-kenya-111.jpg",                     # Safari (Kenya savana)
        "max-salvaggio-fotografo-beauty-011.jpeg",                               # Beauty (Close-up occhi/Trucco)
        "max-salvaggio-fotografo-moda-grazia-vietnam-128.jpg"                    # Location (Vietnam risaie/Toni verdi)
    ]
    
    # Ordinamento editoriale artistico combinato: prima le 40 prioritarie in ordine esatto,
    # poi le restanti raggruppate per tema/cromaticità (Vogue flow)
    def get_editorial_weight(img):
        url = img['url'].lower()
        filename = os.path.basename(img['url'])
        
        # Se è nelle foto prioritari, assegna il peso di testa (gruppo 0)
        if filename in PRIORITY_IMAGES:
            return (0, PRIORITY_IMAGES.index(filename), url)
            
        # Altrimenti assegna il peso tematico standard (gruppo 1) per le restanti
        # 1. INTRO / ICONIC
        if any(k in url for k in ['campari', 'westwood', 'cover']):
            weight = 1
        # 2. TONI CALDI & DESERTO
        elif any(k in url for k in ['egypt', 'mexico', 'tulum', 'kenya', 'safari']):
            weight = 2
        # 3. LINGERIE & INTIMO
        elif 'lingerie' in url:
            weight = 3
        # 4. NUDO ARTISTICO
        elif any(k in url for k in ['nude', 'nudo']):
            weight = 4
        # 5. B&W / PORTRAITS
        elif any(k in url for k in ['portrait-uomo', 'portrait-0', 'bw']):
            weight = 5
        # 6. SUN-DRENCHED & EQUITAZIONE
        elif any(k in url for k in ['sicilia', 'polo', 'cavallo']):
            weight = 6
        # 7. ORIENTE ESOTICO
        elif any(k in url for k in ['cambodia', 'vietnam', 'giungla', 'oriente']):
            weight = 7
        # 8. CINEMA URBANO & NOTTURNO
        elif any(k in url for k in ['shanghai', 'hong-kong', 'hong_kong', 'h-kong', 'hkong', 'street-style']):
            weight = 8
        # 9. CANI & ANIMALI
        elif any(k in url for k in ['cane', 'pet']):
            weight = 9
        # 10. BEAUTY & DETTAGLI STUDIO
        elif 'beauty' in url:
            weight = 10
        else:
            weight = 11
            
        return (1, weight, url)
        
    data['overview'] = sorted(overview_images, key=get_editorial_weight)
    print(f"- 0 OVERVIEW (Ord. Vogue Curato): Trovate {len(data['overview'])} immagini ordinate.")

    # 2. EDITORIALS
    editorial_projects_path = os.path.join(base_dir, '1 EDITORIALS', 'editorials')
    if os.path.exists(editorial_projects_path):
        # Dizionario di associazione tra cartelle e titoli originali in grassetto degli spread editoriali
        titles_map = {
            "covers": "Covers",
            "moda-grazia-viaggio-oriente": "Viaggio in Oriente",
            "moda-grazia-mito-futuro": "Mito Futuro",
            "moda-grazia-nero-diverso": "Nero, Diverso",
            "moda-grazia-safari-chic": "Safari Chic",
            "moda-grazia-leggerezza": "Leggerezza",
            "moda-grazia-hong-kong-express": "Hong Kong Express",
            "moda-grazia-bon_ton-grinta": "Bon Ton con Grinta",
            "moda-grazia-seduzioni-oriente": "Seduzioni d'Oriente",
            "moda-grazia-etnico-dark": "Etnico (e dark)",
            "moda-grazia-giungla-urbana": "Giungla Urbana",
            "moda-grazia-dettaglio": "Basta un Dettaglio",
            "moda-grazia-love-shanghai": "I Love Shanghai",
            "moda-grazia-stile-romanzo": "Uno Stile da Romanzo",
            "moda-grazia-specie": "E tu, di che specie sei?",
            "moda-grazia-bianco": "Bianco"
        }

        # Dizionario di associazione tra cartelle e luoghi di scatto
        places_map = {
            "covers": "Various",
            "moda-grazia-viaggio-oriente": "Cambodia",
            "moda-grazia-mito-futuro": "Mexico",
            "moda-grazia-nero-diverso": "Sicilia",
            "moda-grazia-safari-chic": "Kenya",
            "moda-grazia-leggerezza": "Egypt",
            "moda-grazia-hong-kong-express": "Hong Kong",
            "moda-grazia-bon_ton-grinta": "Hong Kong",
            "moda-grazia-seduzioni-oriente": "Hong Kong",
            "moda-grazia-etnico-dark": "Mexico",
            "moda-grazia-giungla-urbana": "Hong Kong",
            "moda-grazia-dettaglio": "Miami",
            "moda-grazia-love-shanghai": "Shanghai",
            "moda-grazia-stile-romanzo": "Vietnam",
            "moda-grazia-specie": "Tulum",
            "moda-grazia-bianco": "Hong Kong"
        }

        for folder in sorted(os.listdir(editorial_projects_path)):
            folder_path = os.path.join(editorial_projects_path, folder)
            if os.path.isdir(folder_path):
                folder_lower = folder.lower()
                project_id = folder_lower.replace(' ', '-').replace('_', '-')
                project_title = titles_map.get(folder_lower, folder.replace('moda-grazia-', '').replace('-', ' ').replace('_', ' ').title())
                project_place = places_map.get(folder_lower, "")
                project_magazine = "Grazia" if folder_lower != "covers" else ""
                images = get_images_in_dir(folder_path, 'EDITORIALS', base_dir)
                if images:
                    data['editorials']['projects'].append({
                        'id': project_id,
                        'title': project_title,
                        'place': project_place,
                        'magazine': project_magazine,
                        'images': images
                    })
        
        # Ordinamento curato per gli editoriali per alternare modella, cromaticità e stile
        curated_editorial_order = [
            "covers",
            "moda-grazia-viaggio-oriente",
            "moda-grazia-mito-futuro",
            "moda-grazia-nero-diverso",
            "moda-grazia-safari-chic",
            "moda-grazia-leggerezza",
            "moda-grazia-hong-kong-express",
            "moda-grazia-bon-ton-grinta",
            "moda-grazia-seduzioni-oriente",
            "moda-grazia-etnico-dark",
            "moda-grazia-giungla-urbana",
            "moda-grazia-dettaglio",
            "moda-grazia-love-shanghai",
            "moda-grazia-stile-romanzo",
            "moda-grazia-specie",
            "moda-grazia-bianco"
        ]
        
        def get_project_order(project):
            pid = project['id']
            if pid in curated_editorial_order:
                return curated_editorial_order.index(pid)
            return len(curated_editorial_order)
            
        data['editorials']['projects'] = sorted(data['editorials']['projects'], key=get_project_order)
        print(f"- 1 EDITORIALS (Ord. Alternato): Trovati {len(data['editorials']['projects'])} progetti ordinati.")
        
    unpublished_path = os.path.join(base_dir, '1 EDITORIALS', 'unpublished_research')
    data['editorials']['unpublished_research'] = get_images_in_dir(unpublished_path, 'EDITORIALS', base_dir)
    print(f"- 1 EDITORIALS (Unpublished): Trovate {len(data['editorials']['unpublished_research'])} immagini.")

    # 3. CAMPAIGNS
    campaigns_base = os.path.join(base_dir, '2 CAMPAIGNS')
    data['campaigns']['fashion'] = get_images_in_dir(os.path.join(campaigns_base, 'FASHION'), 'CAMPAIGNS', base_dir)
    data['campaigns']['lingerie'] = get_images_in_dir(os.path.join(campaigns_base, 'LINGERIE'), 'CAMPAIGNS', base_dir)
    data['campaigns']['swimwear'] = get_images_in_dir(os.path.join(campaigns_base, 'SWIMMWEAR'), 'CAMPAIGNS', base_dir)
    print(f"- 2 CAMPAIGNS: Fashion ({len(data['campaigns']['fashion'])}), Lingerie ({len(data['campaigns']['lingerie'])}), Swimwear ({len(data['campaigns']['swimwear'])}).")

    # 4. BODY & FORM
    body_form_base = os.path.join(base_dir, '3 BODY & FORM')
    data['body_and_form']['organic_sculptures'] = get_images_in_dir(os.path.join(body_form_base, 'ORGANIC SCULPTURES'), 'BODY & FORM', base_dir)
    data['body_and_form']['shadows_and_graphic_intimacy'] = get_images_in_dir(os.path.join(body_form_base, 'SHADOWS & GRAPHIC INTIMACY'), 'BODY & FORM', base_dir)
    print(f"- 3 BODY & FORM: Organic ({len(data['body_and_form']['organic_sculptures'])}), Shadows ({len(data['body_and_form']['shadows_and_graphic_intimacy'])}).")

    # 5. PORTRAITS & BEAUTY
    portraits_path = os.path.join(base_dir, '4 PORTRAITS I')
    beauty_path = os.path.join(base_dir, '4 beauty')
    pets_path = os.path.join(base_dir, '4 PET and Portraits')
    
    data['portraits_and_beauty']['portraits'] = get_images_in_dir(portraits_path, 'PORTRAITS', base_dir)
    data['portraits_and_beauty']['beauty'] = get_images_in_dir(beauty_path, 'BEAUTY', base_dir)
    data['portraits_and_beauty']['pets_and_portraits'] = get_images_in_dir(pets_path, 'PET & PORTRAITS', base_dir)
    print(f"- 4 PORTRAITS & BEAUTY: Portraits ({len(data['portraits_and_beauty']['portraits'])}), Beauty ({len(data['portraits_and_beauty']['beauty'])}), Pets ({len(data['portraits_and_beauty']['pets_and_portraits'])}).")

    # Output JSON database to file
    js_content = f"""// Database delle immagini generato automaticamente dallo script scan.py
// Data di generazione: {datetime.now(timezone.utc).isoformat()}

const portfolioData = {json.dumps(data, indent=2, ensure_ascii=False)};
"""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"\nSuccesso! Database scritto in: {output_file}")

if __name__ == '__main__':
    scan_all()
