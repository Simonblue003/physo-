// find-bad-pngs.js (improved)
// Usage:
//   node find-bad-pngs.js       -> fast (android res + assets)
//   node find-bad-pngs.js full  -> full repo (incl node_modules)

const fs = require('fs').promises;
const path = require('path');

async function walk(dir, onFile, opts = {}) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return; }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (!opts.full && ['node_modules', '.git', 'android/.gradle', 'android/build'].includes(ent.name)) continue;
      await walk(full, onFile, opts);
    } else {
      await onFile(full);
    }
  }
}

function isPng(file) {
  return file.toLowerCase().endsWith('.png');
}

function loadJimp() {
  // prefer jimp-compact (matches expo), fallback to jimp
  const tryModules = ['jimp-compact', 'jimp'];
  for (const mod of tryModules) {
    try {
      const loaded = require(mod);
      // handle default exports
      const candidate = (typeof loaded === 'object' && loaded.default) ? loaded.default : loaded;
      // some packages export a function/class directly which has .read; others export object with read
      if (candidate && (typeof candidate.read === 'function' || typeof candidate === 'function')) {
        return candidate;
      }
    } catch (e) {
      // ignore and try next
    }
  }
  throw new Error('Could not load jimp or jimp-compact. Install one of them: npm i jimp-compact --no-save');
}

async function main() {
  const root = process.cwd();
  const mode = process.argv[2] === 'full' ? 'full' : 'fast';
  const logPath = path.join(root, 'bad-pngs-log.txt');
  await fs.writeFile(logPath, `Scan started: mode=${mode}\n`, 'utf8');

  let Jimp;
  try {
    Jimp = loadJimp();
    // normalize: if package export is the Jimp class (constructor), ensure we can call .read
    if (typeof Jimp === 'function' && typeof Jimp.read !== 'function') {
      // some versions attach read on the export object under .read or .default.read
      if (Jimp.default && typeof Jimp.default.read === 'function') {
        Jimp = Jimp.default;
      } else {
        // wrap: some versions export an instance factory; require('jimp') might return object with 'read' elsewhere
        // but if we reach here we'll try alternative
      }
    }
  } catch (err) {
    console.error('Failed to load Jimp:', err.message || err);
    process.exit(4);
  }

  const scanDirs = [
    path.join(root, 'android', 'app', 'src', 'main', 'res'),
    path.join(root, 'assets'),
    path.join(root, 'assets', 'images'),
  ];

  const dirsToScan = [];
  for (const d of scanDirs) {
    try { const st = await fs.stat(d); if (st.isDirectory()) dirsToScan.push(d); } catch {}
  }
  if (mode === 'full') dirsToScan.length = 0, dirsToScan.push(root);
  else if (dirsToScan.length === 0) dirsToScan.push(root);

  console.log('Scanning (mode=' + mode + ') directories:\n' + dirsToScan.join('\n'));
  let found = 0;

  for (const base of dirsToScan) {
    await walk(base, async (file) => {
      if (!isPng(file)) return;
      try {
        const st = await fs.stat(file);
        if (st.size === 0) {
          await fs.appendFile(logPath, `ZERO-BYTES\t${file}\n`, 'utf8');
          console.log('[ZERO] ' + file);
          found++;
          return;
        }
      } catch { return; }

      try {
        // call read in a safe way regardless of export shape
        if (typeof Jimp.read === 'function') {
          await Jimp.read(file);
        } else if (typeof Jimp === 'function') {
          // some builds export a function that must be called (rare) — attempt new Jimp(file)
          await Jimp.read ? await Jimp.read(file) : await Jimp(file);
        } else if (Jimp.default && typeof Jimp.default.read === 'function') {
          await Jimp.default.read(file);
        } else {
          throw new Error('Jimp loaded but no read() function found');
        }
      } catch (err) {
        const message = String(err && err.message ? err.message : err);
        const logLine = `ERROR\t${file}\t${message}\n`;
        await fs.appendFile(logPath, logLine, 'utf8');
        console.error('[BAD PNG] ' + file + ' -> ' + message);
        found++;
        if (message.includes('Crc error') || message.includes('CrcError')) {
          console.error('Detected CRC error on file, exiting with code 2.');
          process.exit(2);
        }
      }
    }, { full: mode === 'full' });
  }

  await fs.appendFile(logPath, `Scan finished. Found=${found}\n`, 'utf8');
  console.log('Scan finished. Found=' + found + '. See bad-pngs-log.txt');
  process.exit(found === 0 ? 0 : 1);
}

main().catch(e => {
  console.error('Scanner failed:', e);
  process.exit(3);
});
