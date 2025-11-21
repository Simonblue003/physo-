# check_repair_images.py
# Usage: python check_repair_images.py
# Scans repo for PNG/JPG/JPEG/WEBP files, verifies them, tries to repair by re-saving.
# If repair fails, backs up the original to ./corrupt_image_backups/ and writes a small valid placeholder to the original path.

import os, sys, time
from PIL import Image, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True
EXTS = ('.png', '.jpg', '.jpeg', '.webp', '.bmp')

root = os.path.abspath(".")
backup_dir = os.path.join(root, "corrupt_image_backups_" + time.strftime("%Y%m%d_%H%M%S"))
os.makedirs(backup_dir, exist_ok=True)

placeholder = Image.new("RGBA", (1024,1024), (255,255,255,255))
# quick visual marker so you can spot placeholders
# (draw a small red corner)
try:
    from PIL import ImageDraw
    draw = ImageDraw.Draw(placeholder)
    draw.rectangle([0,0,160,160], fill=(200,40,40,255))
except Exception:
    pass

found = []
repaired = []
replaced = []
ok = []

def try_verify(path):
    try:
        with Image.open(path) as im:
            im.verify()   # raises if file is truncated or invalid
        return True, None
    except Exception as e:
        return False, str(e)

def try_repair(path):
    # attempt to open and re-save (this often fixes CRC chunk problems)
    try:
        with Image.open(path) as im:
            im = im.convert("RGBA")
            tmp = path + ".repairtmp"
            im.save(tmp, format="PNG")
        # replace original atomically
        os.replace(tmp, path)
        return True, None
    except Exception as e:
        # cleanup any tmp
        try:
            if os.path.exists(path + ".repairtmp"):
                os.remove(path + ".repairtmp")
        except:
            pass
        return False, str(e)

for dirpath, dirnames, filenames in os.walk(root):
    # skip .git, node_modules, android/.gradle caches, build outputs
    if any(x in dirpath for x in (os.path.join(root, ".git"), "node_modules", "android" + os.sep + "build", "android" + os.sep + "app" + os.sep + "build")):
        # still include android/app/src/main/res because it contains drawable PNGs
        if "android" in dirpath and "src" in dirpath and "main" in dirpath and "res" in dirpath:
            pass
        else:
            continue
    for f in filenames:
        if f.lower().endswith(EXTS):
            path = os.path.join(dirpath, f)
            rel = os.path.relpath(path, root)
            ok_flag, err = try_verify(path)
            if ok_flag:
                ok.append(rel)
                continue
            found.append((rel, err))
            # try to repair
            rep_ok, rep_err = try_repair(path)
            if rep_ok:
                repaired.append(rel)
                continue
            # if repair failed, back up original and write placeholder
            try:
                # move original to backup
                bpath = os.path.join(backup_dir, rel.replace(os.sep, "_"))
                os.makedirs(os.path.dirname(bpath), exist_ok=True)
                os.replace(path, bpath)
                # write placeholder PNG in original location
                os.makedirs(os.path.dirname(path), exist_ok=True)
                placeholder.save(path, format="PNG")
                replaced.append(rel)
            except Exception as e:
                print("FAILED to backup/replace", rel, e)

# summary
print("=== IMAGE SCAN SUMMARY ===")
print("Total OK (no issues):", len(ok))
print("Found corrupted files:", len(found))
if found:
    print("\nCorrupted files (first 30):")
    for r, e in found[:30]:
        print(" -", r, " ->", e)
print("\nSuccessfully repaired by re-saving:", len(repaired))
if repaired:
    for r in repaired[:30]:
        print(" R:", r)
print("\nBacked up original and replaced with placeholder:", len(replaced))
if replaced:
    for r in replaced[:30]:
        print(" P:", r)

if found:
    print("\nBackups were saved to:", backup_dir)
    print("If you want to preserve originals, don't delete that folder.")
    print("Next steps: git add the repaired/replaced files, commit, push, then run 'npx expo prebuild --no-install --platform android' locally to confirm.")
    sys.exit(2)
else:
    print("\nNo corrupted images found. Prebuild CRC issue may be from cached/generated files. Try `npx expo prebuild --no-install --platform android` again.")
    sys.exit(0)
