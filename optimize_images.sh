#!/bin/bash
echo "Starting image optimization..."
mkdir -p "assets/mosaic"
rm -f assets/mosaic_list.txt

count=1
find "Max Salvaggio Archivio" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | grep -v " NO/" | head -n 75 | while read -r img; do
    # Ridimensiona a 800px, qualità JPEG 60%
    sips -Z 800 -s format jpeg -s formatOptions 60 "$img" --out "assets/mosaic/img${count}.jpg" >/dev/null 2>&1
    
    echo "\"assets/mosaic/img${count}.jpg\"," >> assets/mosaic_list.txt
    count=$((count+1))
done

echo "Done! Processed $count images."
