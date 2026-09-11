import os
import json
import re
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

def create_thumbnail_custom(orig_path, target_rel_subfolder, relative_base):
    """
    Genera la miniatura .webp in photo_web/[target_rel_subfolder] (es. photo_web/portraits/portraits I/filename.webp)
    """
    filename_base, _ = os.path.splitext(os.path.basename(orig_path))
    thumb_rel_path = os.path.join('photo_web', target_rel_subfolder, filename_base + '.webp').replace('\\', '/')
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
        return target_rel_subfolder.replace('\\', '/')
        
    return thumb_rel_path

def get_images_in_dir(path, tag_name, relative_base, web_subfolder=None):
    images = []
    if not os.path.exists(path):
        return images
    
    from PIL import Image as PILImage
    for root, dirs, files in os.walk(path):
        dirs.sort()
        for file in sorted(files):
            file_path = os.path.join(root, file)
            if os.path.isfile(file_path):
                _, ext = os.path.splitext(file.lower())
                if ext in VALID_EXTENSIONS:
                    # Relative URL per l'immagine originale ad alta risoluzione (photo master/...)
                    full_res_url = os.path.relpath(file_path, relative_base).replace('\\', '/')
                    
                    # Sotto-cartella target per la miniatura WebP in photo_web/
                    if web_subfolder is None:
                        target_subfolder = os.path.relpath(root, os.path.join(relative_base, 'photo master')).replace('\\', '/')
                    else:
                        target_subfolder = web_subfolder
                    
                    # Genera miniatura in photo_web/
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

def scan_all():
    print("Inizio scansione cartelle photo master...")
    
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

    photo_master_base = os.path.join(base_dir, 'photo master')

    # 1. OVERVIEW (Fallback se photo master/overview esiste, altrimenti mantiene overview/ esistente se presente)
    overview_master_path = os.path.join(photo_master_base, 'overview')
    if os.path.exists(overview_master_path):
        data['overview'] = get_images_in_dir(overview_master_path, 'OVERVIEW', base_dir, web_subfolder='overview')
    else:
        legacy_overview_path = os.path.join(base_dir, 'overview')
        if os.path.exists(legacy_overview_path):
            data['overview'] = get_images_in_dir(legacy_overview_path, 'OVERVIEW', base_dir, web_subfolder='overview')

    # 2. EDITORIALS (photo master/editorials)
    editorials_master_path = os.path.join(photo_master_base, 'editorials')
    if os.path.exists(editorials_master_path):
        for item in sorted(os.listdir(editorials_master_path)):
            item_path = os.path.join(editorials_master_path, item)
            if os.path.isdir(item_path):
                project_id = item.lower().replace(' ', '-').replace('_', '-')
                project_title = item.replace('-', ' ').replace('_', ' ').title()
                images = get_images_in_dir(item_path, 'EDITORIALS', base_dir, web_subfolder=f'editorials/{item}')
                if images:
                    data['editorials']['projects'].append({
                        'id': project_id,
                        'title': project_title,
                        'place': '',
                        'magazine': '',
                        'images': images
                    })
            elif os.path.isfile(item_path):
                # Immagini dirette in editorials/ vanno in unpublished_research
                imgs = get_images_in_dir(editorials_master_path, 'EDITORIALS', base_dir, web_subfolder='editorials')
                data['editorials']['unpublished_research'].extend(imgs)
                break
    else:
        # Backward compatibility con vecchie cartelle se photo master/editorials è vuota
        legacy_editorials = os.path.join(base_dir, '1 EDITORIALS', 'editorials')
        if os.path.exists(legacy_editorials):
            for folder in sorted(os.listdir(legacy_editorials)):
                folder_path = os.path.join(legacy_editorials, folder)
                if os.path.isdir(folder_path):
                    images = get_images_in_dir(folder_path, 'EDITORIALS', base_dir, web_subfolder=f'editorials/{folder}')
                    if images:
                        data['editorials']['projects'].append({
                            'id': folder.lower().replace(' ', '-'),
                            'title': folder.title(),
                            'place': '',
                            'magazine': '',
                            'images': images
                        })

    # 3. CAMPAIGNS (photo master/campaigns)
    campaigns_master_path = os.path.join(photo_master_base, 'campaigns')
    data['campaigns']['fashion'] = get_images_in_dir(os.path.join(campaigns_master_path, 'fashion'), 'CAMPAIGNS', base_dir, web_subfolder='campaigns/fashion') if os.path.exists(os.path.join(campaigns_master_path, 'fashion')) else get_images_in_dir(os.path.join(campaigns_master_path), 'CAMPAIGNS', base_dir, web_subfolder='campaigns')
    
    lingerie_master_path = os.path.join(photo_master_base, 'lingerie')
    data['campaigns']['lingerie'] = get_images_in_dir(lingerie_master_path, 'CAMPAIGNS', base_dir, web_subfolder='lingerie')

    swimwear_master_path = os.path.join(photo_master_base, 'swimwear')
    data['campaigns']['swimwear'] = get_images_in_dir(swimwear_master_path, 'CAMPAIGNS', base_dir, web_subfolder='swimwear')

    # Fallback su vecchie cartelle se nuove in photo master sono vuote
    if not data['campaigns']['fashion']:
        data['campaigns']['fashion'] = get_images_in_dir(os.path.join(base_dir, '2 CAMPAIGNS', 'FASHION'), 'CAMPAIGNS', base_dir, web_subfolder='campaigns/fashion')
    if not data['campaigns']['lingerie']:
        data['campaigns']['lingerie'] = get_images_in_dir(os.path.join(base_dir, '2 CAMPAIGNS', 'LINGERIE'), 'CAMPAIGNS', base_dir, web_subfolder='lingerie')
    if not data['campaigns']['swimwear']:
        data['campaigns']['swimwear'] = get_images_in_dir(os.path.join(base_dir, '2 CAMPAIGNS', 'SWIMMWEAR'), 'CAMPAIGNS', base_dir, web_subfolder='swimwear')

    # 4. BODY & FORM (photo master/body)
    body_master_path = os.path.join(photo_master_base, 'body')
    data['body_and_form']['organic_sculptures'] = get_images_in_dir(os.path.join(body_master_path, 'organic sculptures'), 'BODY & FORM', base_dir, web_subfolder='body/organic sculptures') if os.path.exists(os.path.join(body_master_path, 'organic sculptures')) else get_images_in_dir(body_master_path, 'BODY & FORM', base_dir, web_subfolder='body')
    data['body_and_form']['shadows_and_graphic_intimacy'] = get_images_in_dir(os.path.join(body_master_path, 'shadows'), 'BODY & FORM', base_dir, web_subfolder='body/shadows')

    if not data['body_and_form']['organic_sculptures']:
        data['body_and_form']['organic_sculptures'] = get_images_in_dir(os.path.join(base_dir, '3 BODY & FORM', 'ORGANIC SCULPTURES'), 'BODY & FORM', base_dir, web_subfolder='body/organic sculptures')
    if not data['body_and_form']['shadows_and_graphic_intimacy']:
        data['body_and_form']['shadows_and_graphic_intimacy'] = get_images_in_dir(os.path.join(base_dir, '3 BODY & FORM', 'SHADOWS & GRAPHIC INTIMACY'), 'BODY & FORM', base_dir, web_subfolder='body/shadows')

    # 5. PORTRAITS & BEAUTY (photo master/portraits & photo master/pet & portraits)
    portraits_i_path = os.path.join(photo_master_base, 'portraits', 'portraits I')
    portraits_ii_path = os.path.join(photo_master_base, 'portraits', 'portraits II')
    pets_master_path = os.path.join(photo_master_base, 'pet & portraits')

    portraits_i_imgs = get_images_in_dir(portraits_i_path, 'PORTRAITS', base_dir, web_subfolder='portraits/portraits I')
    portraits_ii_imgs = get_images_in_dir(portraits_ii_path, 'PORTRAITS II', base_dir, web_subfolder='portraits/portraits II')
    pets_imgs = get_images_in_dir(pets_master_path, 'PET & PORTRAITS', base_dir, web_subfolder='pet & portraits')

    data['portraits_and_beauty']['portraits'] = portraits_i_imgs if portraits_i_imgs else get_images_in_dir(os.path.join(base_dir, '4 PORTRAITS I'), 'PORTRAITS', base_dir, web_subfolder='portraits/portraits I')
    if portraits_ii_imgs:
        data['editorials']['unpublished_research'] = portraits_ii_imgs
    elif not data['editorials']['unpublished_research']:
        data['editorials']['unpublished_research'] = get_images_in_dir(os.path.join(base_dir, '1 EDITORIALS', 'unpublished_research'), 'EDITORIALS', base_dir, web_subfolder='editorials/unpublished_research')
        
    data['portraits_and_beauty']['pets_and_portraits'] = pets_imgs if pets_imgs else get_images_in_dir(os.path.join(base_dir, '4 PET and Portraits'), 'PET & PORTRAITS', base_dir, web_subfolder='pet & portraits')
    data['portraits_and_beauty']['beauty'] = get_images_in_dir(os.path.join(base_dir, '4 beauty'), 'BEAUTY', base_dir, web_subfolder='beauty')

    # Output JSON database to file
    js_content = f"""// Database delle immagini generato automaticamente dallo script scan.py
// Data di generazione: {datetime.now(timezone.utc).isoformat()}

const portfolioData = {json.dumps(data, indent=2, ensure_ascii=False)};
"""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"\nSuccesso! Scansione completata. Database scritto in: {output_file}")

if __name__ == '__main__':
    scan_all()
