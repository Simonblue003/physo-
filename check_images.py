# Save as check_images.py at the project root
from PIL import Image
import os, sys

bad = []
for root, _, files in os.walk("."):
    for name in files:
        if name.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".bmp")):
            path = os.path.join(root, name)
            try:
                with Image.open(path) as im:
                    im.verify()   # will raise if file is truncated/corrupt
            except Exception as e:
                bad.append((path, str(e)))

if not bad:
    print("OK: No corrupted images found.")
    sys.exit(0)

print("FOUND CORRUPTED IMAGES:")
for p, e in bad:
    print(p, "->", e)
print("\nReplace the listed files (or re-save them in an image editor).")
sys.exit(2)
