from PIL import Image, UnidentifiedImageError
import os, sys, traceback

bad = []
for root, dirs, files in os.walk('.'):
    for fn in files:
        if fn.lower().endswith(('.png','.jpg','.jpeg','.webp')):
            path = os.path.join(root, fn)
            try:
                with Image.open(path) as im:
                    im.verify()
            except Exception as e:
                bad.append((path, repr(e)))
if not bad:
    print("No problematic images found.")
else:
    print("Found problematic images:")
    for p, err in bad:
        print(p, "->", err)
    sys.exit(2)
