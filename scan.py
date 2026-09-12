import os
import json
import re
import shutil
from datetime import datetime, timezone

base_dir = os.path.dirname(os.path.abspath(__file__))
output_file = os.path.join(base_dir, 'archive-data.js')

# Web-friendly formats
VALID_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}

def clean_title(filename):
    name, _ = os.path.splitext(filename)
    prefixes = [
        r'^Max_Salvaggio_', r'^MAX_SALVAGGIO_', r'^Max-Salvaggio-Portfolio-',
        r'^Max-Salvaggio-', r'^MaxSalvaggio-', r'^Max_Salvaggio_©_',
        r'^Max_Salvaggio_edit_', r'^max_salvaggio_fotografo_'
    ]
    for p in prefixes:
        name = re.sub(p, '', name, flags=re.IGNORECASE)
    
    name = re.sub(r'[_-]', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name.title()

def clean_folder_title(foldername):
    name = re.sub(r'^[0-9]+\s*', '', foldername)
    name = name.replace('-', ' ').replace('_', ' ')
    name = re.sub(r'\s+', ' ', name).strip()
    name = name.replace(' and ', ' & ').replace(' And ', ' & ')
    return name.title()

def get_web_subfolder_for_relpath(rel_path):
    """
    Normalizza la sotto-cartella web per garantire la perfetta corrispondenza tra photo master e photo_web.
    """
    rel_clean = rel_path.replace('\\', '/').strip('/')
    rel_lower = rel_clean.lower()
    
    if rel_lower == 'swimwear' or rel_lower.startswith('swimwear/'):
        return 'campaigns/swimwear'
    if rel_lower == 'lingerie' or rel_lower.startswith('lingerie/'):
        return 'campaigns/lingerie'
    if rel_lower == 'fashion' or rel_lower.startswith('fashion/') or rel_lower == 'campaigns':
        return 'campaigns/fashion'
    if rel_lower.startswith('pet & portraits') or rel_lower.startswith('pet_and_portraits'):
        return 'pet & portraits'
    
    return rel_lower

def create_thumbnail_custom(orig_path, target_rel_subfolder, relative_base):
    """
    Genera la miniatura .webp in photo_web/[target_rel_subfolder] (es. photo_web/body/water-and-stones/filename.webp)
    Target: <150 KB, max 800px sul lato lungo.
    """
    filename_base, _ = os.path.splitext(os.path.basename(orig_path))
    clean_target_subfolder = target_rel_subfolder.lower().replace('\\', '/')
    thumb_rel_path = os.path.join('photo_web', clean_target_subfolder, filename_base + '.webp').replace('\\', '/')
    thumb_full_path = os.path.join(relative_base, thumb_rel_path)
    
    os.makedirs(os.path.dirname(thumb_full_path), exist_ok=True)
    
    from PIL import Image as PILImage
    try:
        if not os.path.exists(thumb_full_path) or os.path.getmtime(orig_path) > os.path.getmtime(thumb_full_path):
            with PILImage.open(orig_path) as img:
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                w, h = img.size
                if w > 800 or h > 800:
                    img.thumbnail((800, 800), PILImage.Resampling.LANCZOS)
                
                quality = 80
                img.save(thumb_full_path, 'WEBP', quality=quality, optimize=True)
                
                while os.path.getsize(thumb_full_path) > 150 * 1024 and quality > 30:
                    quality -= 10
                    img.save(thumb_full_path, 'WEBP', quality=quality, optimize=True)
    except Exception as e:
        print(f"Errore generazione miniatura per {orig_path}: {e}")
        return thumb_rel_path
        
    return thumb_rel_path

def get_images_in_dir(path, tag_name, relative_base, web_subfolder=None):
    images = []
    if not os.path.exists(path):
        return images
    
    from PIL import Image as PILImage
    for root, dirs, files in os.walk(path):
        dirs.sort()
        for file in sorted(files):
            if file.startswith('.') or file in ('.DS_Store', '.gitkeep'):
                continue
            file_path = os.path.join(root, file)
            if os.path.isfile(file_path):
                _, ext = os.path.splitext(file.lower())
                if ext in VALID_EXTENSIONS:
                    full_res_url = os.path.relpath(file_path, relative_base).replace('\\', '/')
                    
                    if web_subfolder is None:
                        rel_sub = os.path.relpath(root, os.path.join(relative_base, 'photo master')).replace('\\', '/')
                        target_subfolder = get_web_subfolder_for_relpath(rel_sub)
                    else:
                        target_subfolder = get_web_subfolder_for_relpath(web_subfolder)
                    
                    thumb_url = create_thumbnail_custom(file_path, target_subfolder, relative_base)
                    
                    w, h = 0, 0
                    try:
                        with PILImage.open(file_path) as pimg:
                            w, h = pimg.size
                    except Exception:
                        pass

                    images.append({
                        'url': thumb_url,
                        'fullResUrl': full_res_url,
                        'thumbnailUrl': thumb_url,
                        'title': clean_title(file),
                        'tag': tag_name,
                        'width': w,
                        'height': h,
                        'is_horizontal': w > h
                    })
    return images

def find_dir_by_keywords(parent_dir, keywords):
    if not os.path.exists(parent_dir):
        return None
    for entry in os.listdir(parent_dir):
        full_p = os.path.join(parent_dir, entry)
        if os.path.isdir(full_p):
            entry_lower = entry.lower()
            if any(kw.lower() in entry_lower for kw in keywords):
                return full_p
    return None

def cleanup_orphans(base_dir, valid_files, valid_dirs):
    """
    Scansiona photo_web/ e rimuove file .webp e cartelle orfane che non hanno piu un corrispettivo originale in photo master/
    """
    photo_web_base = os.path.join(base_dir, 'photo_web')
    if not os.path.exists(photo_web_base):
        return

    print("Verifica ed eliminazione automatica orfani in photo_web/...")

    removed_files = 0
    for root, dirs, files in os.walk(photo_web_base):
        for f in files:
            if f.startswith('.') or f in ('.DS_Store', '.gitkeep'):
                continue
            full_p = os.path.join(root, f)
            rel_p = os.path.normpath(os.path.relpath(full_p, base_dir)).replace('\\', '/').lower()
            if rel_p not in valid_files:
                try:
                    os.remove(full_p)
                    removed_files += 1
                    print(f"  [Orfano rimosso]: {rel_p}")
                except Exception as e:
                    print(f"  Errore rimozione file orfano {rel_p}: {e}")

    removed_dirs = 0
    for root, dirs, files in os.walk(photo_web_base, topdown=False):
        for d in dirs:
            dir_full = os.path.join(root, d)
            dir_rel = os.path.normpath(os.path.relpath(dir_full, base_dir)).replace('\\', '/').lower()
            
            try:
                contents = [c for c in os.listdir(dir_full) if not c.startswith('.')]
                if not contents or dir_rel not in valid_dirs:
                    shutil.rmtree(dir_full, ignore_errors=True)
                    removed_dirs += 1
                    print(f"  [Cartella orfana rimossa]: {dir_rel}")
            except Exception as e:
                pass

    if removed_files > 0 or removed_dirs > 0:
        print(f"Sincronizzazione completata: {removed_files} file orfani e {removed_dirs} cartelle orfane rimosse.\n")
    else:
        print("Sincronizzazione completata: nessun file o cartella orfana trovata.\n")

def scan_all():
    print("Inizio scansione automatica e ricorsiva cartelle photo master...")
    
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
            'water_and_stones': [],
            'shadows_and_graphic_intimacy': []
        },
        'portraits_and_beauty': {
            'portraits': [],
            'beauty': [],
            'pets_and_portraits': []
        },
        'categories_meta': {}
    }

    photo_master_base = os.path.join(base_dir, 'photo master')

    # Scansione automatica e ricorsiva di TUTTE le sotto-cartelle in photo master per pre-generare miniature webp e catalogare anteprime/cover
    if os.path.exists(photo_master_base):
        for root, dirs, files in os.walk(photo_master_base):
            dirs.sort()
            valid_files = [f for f in sorted(files) if not f.startswith('.') and os.path.splitext(f.lower())[1] in VALID_EXTENSIONS]
            if valid_files:
                rel_path = os.path.relpath(root, photo_master_base).replace('\\', '/')
                folder_name = os.path.basename(root)
                clean_name = clean_folder_title(folder_name)
                web_sub = get_web_subfolder_for_relpath(rel_path)
                
                tag = rel_path.split('/')[0].upper() if '/' in rel_path else rel_path.upper()
                imgs = get_images_in_dir(root, tag, base_dir, web_subfolder=web_sub)
                
                if imgs:
                    cover_img = imgs[0]['url']
                    data['categories_meta'][web_sub] = {
                        'title': clean_name,
                        'cover': cover_img,
                        'preview_icon': cover_img,
                        'count': len(imgs)
                    }

    # 1. OVERVIEW
    overview_master_path = os.path.join(photo_master_base, 'overview')
    if os.path.exists(overview_master_path):
        data['overview'] = get_images_in_dir(overview_master_path, 'OVERVIEW', base_dir, web_subfolder='overview')
    else:
        legacy_overview_path = os.path.join(base_dir, 'overview')
        if os.path.exists(legacy_overview_path):
            data['overview'] = get_images_in_dir(legacy_overview_path, 'OVERVIEW', base_dir, web_subfolder='overview')

    # 2. EDITORIALS
    editorials_master_path = os.path.join(photo_master_base, 'editorials')
    if os.path.exists(editorials_master_path):
        for item in sorted(os.listdir(editorials_master_path)):
            if item.startswith('.') or item in ('.DS_Store', '.gitkeep'):
                continue
            item_path = os.path.join(editorials_master_path, item)
            if os.path.isdir(item_path):
                project_id = item.lower().replace(' ', '-').replace('_', '-')
                project_title = clean_folder_title(item)
                images = get_images_in_dir(item_path, 'EDITORIALS', base_dir, web_subfolder=f'editorials/{item.lower()}')
                if images:
                    cover_url = images[0]['url']
                    data['editorials']['projects'].append({
                        'id': project_id,
                        'title': project_title,
                        'cover': cover_url,
                        'preview_icon': cover_url,
                        'place': '',
                        'magazine': '',
                        'images': images
                    })
            elif os.path.isfile(item_path):
                _, ext = os.path.splitext(item.lower())
                if ext in VALID_EXTENSIONS:
                    imgs = get_images_in_dir(editorials_master_path, 'EDITORIALS', base_dir, web_subfolder='editorials')
                    data['editorials']['unpublished_research'].extend(imgs)
                    break
    else:
        legacy_editorials = os.path.join(base_dir, '1 EDITORIALS', 'editorials')
        if os.path.exists(legacy_editorials):
            for folder in sorted(os.listdir(legacy_editorials)):
                folder_path = os.path.join(legacy_editorials, folder)
                if os.path.isdir(folder_path):
                    images = get_images_in_dir(folder_path, 'EDITORIALS', base_dir, web_subfolder=f'editorials/{folder.lower()}')
                    if images:
                        cover_url = images[0]['url']
                        data['editorials']['projects'].append({
                            'id': folder.lower().replace(' ', '-'),
                            'title': clean_folder_title(folder),
                            'cover': cover_url,
                            'preview_icon': cover_url,
                            'place': '',
                            'magazine': '',
                            'images': images
                        })

    # 3. CAMPAIGNS
    campaigns_master_path = os.path.join(photo_master_base, 'campaigns')
    data['campaigns']['fashion'] = get_images_in_dir(os.path.join(campaigns_master_path, 'fashion'), 'CAMPAIGNS', base_dir, web_subfolder='campaigns/fashion') if os.path.exists(os.path.join(campaigns_master_path, 'fashion')) else get_images_in_dir(campaigns_master_path, 'CAMPAIGNS', base_dir, web_subfolder='campaigns/fashion')
    
    lingerie_master_path = os.path.join(photo_master_base, 'lingerie')
    if not os.path.exists(lingerie_master_path):
        lingerie_master_path = os.path.join(campaigns_master_path, 'lingerie')
    data['campaigns']['lingerie'] = get_images_in_dir(lingerie_master_path, 'CAMPAIGNS', base_dir, web_subfolder='campaigns/lingerie')

    swimwear_master_path = os.path.join(photo_master_base, 'swimwear')
    if not os.path.exists(swimwear_master_path):
        swimwear_master_path = os.path.join(campaigns_master_path, 'swimwear')
    data['campaigns']['swimwear'] = get_images_in_dir(swimwear_master_path, 'CAMPAIGNS', base_dir, web_subfolder='campaigns/swimwear')

    # Fallback su vecchie cartelle se photo master è vuota
    if not data['campaigns']['fashion']:
        data['campaigns']['fashion'] = get_images_in_dir(os.path.join(base_dir, '2 CAMPAIGNS', 'FASHION'), 'CAMPAIGNS', base_dir, web_subfolder='campaigns/fashion')
    if not data['campaigns']['lingerie']:
        data['campaigns']['lingerie'] = get_images_in_dir(os.path.join(base_dir, '2 CAMPAIGNS', 'LINGERIE'), 'CAMPAIGNS', base_dir, web_subfolder='campaigns/lingerie')
    if not data['campaigns']['swimwear']:
        data['campaigns']['swimwear'] = get_images_in_dir(os.path.join(base_dir, '2 CAMPAIGNS', 'SWIMMWEAR'), 'CAMPAIGNS', base_dir, web_subfolder='campaigns/swimwear')

    # 4. BODY & FORM
    body_master_path = os.path.join(photo_master_base, 'body')
    organic_path = find_dir_by_keywords(body_master_path, ['organic'])
    water_path = find_dir_by_keywords(body_master_path, ['water', 'stone'])
    shadows_path = find_dir_by_keywords(body_master_path, ['shadow'])

    if organic_path:
        rel_sub = os.path.relpath(organic_path, photo_master_base).replace('\\', '/').lower()
        data['body_and_form']['organic_sculptures'] = get_images_in_dir(organic_path, 'BODY & FORM', base_dir, web_subfolder=rel_sub)
    else:
        data['body_and_form']['organic_sculptures'] = get_images_in_dir(os.path.join(base_dir, '3 BODY & FORM', 'ORGANIC SCULPTURES'), 'BODY & FORM', base_dir, web_subfolder='body/organic sculptures')

    if water_path:
        rel_sub = os.path.relpath(water_path, photo_master_base).replace('\\', '/').lower()
        data['body_and_form']['water_and_stones'] = get_images_in_dir(water_path, 'BODY & FORM', base_dir, web_subfolder=rel_sub)
    else:
        legacy_water = os.path.join(base_dir, 'images', 'body', 'water-and-stones')
        if os.path.exists(legacy_water):
            data['body_and_form']['water_and_stones'] = get_images_in_dir(legacy_water, 'BODY & FORM', base_dir, web_subfolder='body/water-and-stones')

    if shadows_path:
        rel_sub = os.path.relpath(shadows_path, photo_master_base).replace('\\', '/').lower()
        data['body_and_form']['shadows_and_graphic_intimacy'] = get_images_in_dir(shadows_path, 'BODY & FORM', base_dir, web_subfolder=rel_sub)
    else:
        data['body_and_form']['shadows_and_graphic_intimacy'] = get_images_in_dir(os.path.join(base_dir, '3 BODY & FORM', 'SHADOWS & GRAPHIC INTIMACY'), 'BODY & FORM', base_dir, web_subfolder='body/shadows')

    # Scansione dinamica per eventuali sotto-cartelle aggiuntive in body
    if os.path.exists(body_master_path):
        for item in sorted(os.listdir(body_master_path)):
            item_p = os.path.join(body_master_path, item)
            if os.path.isdir(item_p):
                item_lower = item.lower()
                key = item_lower.replace(' ', '_').replace('-', '_')
                if key not in data['body_and_form']:
                    rel_sub = os.path.relpath(item_p, photo_master_base).replace('\\', '/').lower()
                    data['body_and_form'][key] = get_images_in_dir(item_p, 'BODY & FORM', base_dir, web_subfolder=rel_sub)

    # 5. PORTRAITS & BEAUTY
    portraits_i_path = find_dir_by_keywords(os.path.join(photo_master_base, 'portraits'), ['portrait i', 'portraits i', 'portraits 1', 'portrait 1'])
    portraits_ii_path = find_dir_by_keywords(os.path.join(photo_master_base, 'portraits'), ['portrait ii', 'portraits ii', 'portraits 2', 'portrait 2'])
    pets_master_path = os.path.join(photo_master_base, 'pet & portraits')

    # Defensive loading of optional portrait and pet folders
    if portraits_i_path and os.path.isdir(portraits_i_path):
        portraits_i_imgs = get_images_in_dir(portraits_i_path, 'PORTRAITS', base_dir, web_subfolder='portraits/portraits I')
    else:
        print('Warning: Portraits I folder not found; skipping.')
        portraits_i_imgs = []
    if portraits_ii_path and os.path.isdir(portraits_ii_path):
        portraits_ii_imgs = get_images_in_dir(portraits_ii_path, 'PORTRAITS', base_dir, web_subfolder='portraits/portraits II')
    else:
        print('Warning: Portraits II folder not found; skipping.')
        portraits_ii_imgs = []
    if pets_master_path and os.path.isdir(pets_master_path):
        pets_imgs = get_images_in_dir(pets_master_path, 'PET & PORTRAITS', base_dir, web_subfolder='pet & portraits')
    else:
        print('Warning: Pets & Portraits folder not found; skipping.')
        pets_imgs = []

    data['portraits_and_beauty']['portraits'] = portraits_i_imgs if portraits_i_imgs else get_images_in_dir(os.path.join(base_dir, '4 PORTRAITS I'), 'PORTRAITS', base_dir, web_subfolder='portraits/portraits I')
    if portraits_ii_imgs:
        data['editorials']['unpublished_research'] = portraits_ii_imgs
    elif not data['editorials']['unpublished_research']:
        data['editorials']['unpublished_research'] = get_images_in_dir(os.path.join(base_dir, '1 EDITORIALS', 'unpublished_research'), 'EDITORIALS', base_dir, web_subfolder='editorials/unpublished_research')
        
    data['portraits_and_beauty']['pets_and_portraits'] = pets_imgs if pets_imgs else get_images_in_dir(os.path.join(base_dir, '4 PET and Portraits'), 'PET & PORTRAITS', base_dir, web_subfolder='pet & portraits')
    data['portraits_and_beauty']['beauty'] = get_images_in_dir(os.path.join(base_dir, '4 beauty'), 'BEAUTY', base_dir, web_subfolder='beauty')

    # Estrai tutti i percorsi validi di miniature e directory generati per portfolioData
    valid_files = set()
    valid_dirs = set()

    def extract_valid_paths(obj):
        if isinstance(obj, dict):
            for k in ('url', 'cover', 'preview_icon'):
                key_val = obj.get(k)
                if key_val and isinstance(key_val, str):
                    p = os.path.normpath(key_val).replace('\\', '/').lower()
                    valid_files.add(p)
                    curr = os.path.dirname(p)
                    while curr and curr != 'photo_web':
                        valid_dirs.add(curr.lower())
                        curr = os.path.dirname(curr)
            for v in obj.values():
                extract_valid_paths(v)
        elif isinstance(obj, list):
            for item in obj:
                extract_valid_paths(item)

    extract_valid_paths(data)

    # Pulizia bidirezionale orfani in photo_web/
    cleanup_orphans(base_dir, valid_files, valid_dirs)

    # Output JSON database to file
    js_content = f"""// Database delle immagini generato automaticamente dallo script scan.py
// Data di generazione: {datetime.now(timezone.utc).isoformat()}

const portfolioData = {json.dumps(data, indent=2, ensure_ascii=False)};
"""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successo! Scansione completata. Database scritto in: {output_file}")

if __name__ == '__main__':
    scan_all()
