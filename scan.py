import os
import json
import re
from datetime import datetime

archive_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Max Salvaggio Archivio')
output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'archive-data.js')

folder_meta = {
    'COMMERCIAL': { 'index': 0, 'meta': 'Luxury Brands & Advertising Campaigns' },
    'FASHION – LOCATION': { 'index': 1, 'meta': 'Editorial Travel & High-Fashion on Location' },
    'FASHION-STUDIO': { 'index': 2, 'meta': 'Studio Lighting & Creative Concept Editorials' },
    'LINGERIE': { 'index': 3, 'meta': 'Sensual Fine Art & Premium Lingerie Portfolio' },
    'MENSWEAR': { 'index': 4, 'meta': 'Contemporary Masculine Fashion & Portraits' },
    'SWIMMWEAR': { 'index': 5, 'meta': 'Swimwear, Beachwear & Outdoor Light Photography' }
}

def clean_title(filename):
    # Get base name without extension
    name, _ = os.path.splitext(filename)
    
    # Remove common prefixes
    name = re.sub(r'^Max_Salvaggio_', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^MAX_SALVAGGIO_', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Max-Salvaggio-Portfolio-', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Max-Salvaggio-', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^MaxSalvaggio-', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Max_Salvaggio_©_', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Max_Salvaggio_edit_', '', name, flags=re.IGNORECASE)
    
    # Replace underscores and dashes with spaces
    name = re.sub(r'[_-]', ' ', name)
    
    # Clean up multiple spaces
    name = re.sub(r'\s+', ' ', name).strip()
    
    # Title Case
    return name.title()

try:
    if not os.path.exists(archive_dir):
        print(f"Error: Archive directory not found at: {archive_dir}")
        exit(1)

    subdirs = [f for f in os.listdir(archive_dir) if os.path.isdir(os.path.join(archive_dir, f))]

    portfolio_data = {}

    for folder in subdirs:
        meta_info = folder_meta.get(folder)
        if not meta_info:
            continue

        folder_path = os.path.join(archive_dir, folder)
        files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
        valid_files = [f for f in files if os.path.splitext(f)[1].lower() in ['.jpg', '.jpeg', '.png', '.webp']]

        print(f"Scanning category \"{folder}\"... Found {len(valid_files)} images.")

        images = []
        for file in sorted(valid_files):
            relative_url = f"Max Salvaggio Archivio/{folder}/{file}"
            title = clean_title(file)
            tag = re.split(r'[–-]', folder)[0].strip().upper()
            
            images.append({
                'url': relative_url,
                'title': title,
                'tag': tag
            })

        portfolio_data[meta_info['index']] = {
            'title': folder,
            'meta': meta_info['meta'],
            'images': images
        }

    js_content = f"""// Automatically generated from local archive directory scan
// Generated on: {datetime.utcnow().isoformat()}Z

const portfolioData = {json.dumps(portfolio_data, indent=2, ensure_ascii=False)};
"""

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"\nSuccess! Full archive data written dynamically to: {output_file}")

except Exception as e:
    print('Error scanning directories:', e)
    exit(1)
