#!/usr/bin/env python3
# usage: python scripts/repair_images.py
from PIL import Image, UnidentifiedImageError
import os, sys, traceback

root = os.getcwd()
exts = ('.png','.jpg','.jpeg','.webp')
paths = []
for r,d,fns in os.walk(root):
    for fn in fns:
        if fn.lower().endswith(exts):
            paths.append(os.path.join(r,fn))

bad = []
fixed = []
print("Scanning", len(paths), "images...")
for p in paths:
    try:
        # try to open and verify
        with Image.open(p) as img:
            img.verify()
        # now reopen and re-save to normalize
        with Image.open(p) as img:
            # choose format based on extension
            fmt = 'PNG' if p.lower().endswith('.png') else 'JPEG'
            # for PNG, ensure correct mode
            if fmt == 'PNG' and img.mode not in ('RGBA','RGB','L'):
                img = img.convert('RGBA')
            elif fmt == 'JPEG' and img.mode in ('RGBA',):
                img = img.convert('RGB')
            img.save(p, format=fmt, optimize=True)
        fixed.append(p)
    except UnidentifiedImageError as e:
        bad.append((p, 'UNIDENTIFIED: ' + str(e)))
        # attempt to replace with placeholder
        try:
            placeholder = Image.new('RGBA', (256,256), (255,255,255,0))
            placeholder.save(p, format='PNG')
            fixed.append(p + ' (replaced placeholder)')
        except Exception as e2:
            bad.append((p, 'REPLACE_FAIL: ' + str(e2)))
    except Exception as e:
        bad.append((p, str(e)))
        # try to re-save anyway if possible
        try:
            with Image.open(p) as img:
                img = img.convert('RGBA')
                img.save(p, format='PNG', optimize=True)
            fixed.append(p + ' (converted)')
        except Exception as e2:
            bad.append((p, 'SECONDARY_FAIL: ' + str(e2)))

print("Done. Fixed:", len(fixed), "Failed:", len(bad))
if bad:
    print("\nFailures:")
    for p,reason in bad:
        print(p, "->", reason)
sys.exit(0 if not bad else 2)
