// find-bad-pngs.js
// Usage:
//   node find-bad-pngs.js         # scan android res + assets (fast)
//   node find-bad-pngs.js full    # scan the entire repo including node_modules (slow)

const fs = require('fs').promises;
const path = require('path');

async function walk(dir, onFile, opts = {}) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);

    if (ent.isDirectory()) {
      // Skip common huge or irrelevant folders unless user asked "full"
      if (!opts.full && ['node_modules', '.git', 'android/.gradle', 'android/build'].includes(ent.name)) continue;
      await walk(full, onFile, opts);
    } else {
      await onFile(full);
    }
  }
}

async function fileIsPng(file) {
  return file.toLowerCase().endsWith('.png');
}

async function main() {
  const Jimp = require('jimp'); // requires jimp installed
  const root = process.cwd();
  const mode = process.argv[2] === 'full' ? 'full' : 'fast';
  const logPath = path.join(root, 'bad-pngs-log.txt');
  await fs.writeFile(logPath, `Scan started: mode=${mode}\n`, 'utf8');

  // default scan locations
  const scanDirs = [
    path.join(root, 'android', 'app', 'src', 'main', 'res'),
    path.join(root, 'assets'),
    path.join(root, 'assets', 'images'),
  ];

  // if fast mode, only include scanDirs that exist
  const dirsToScan = [];
  for (const d of scanDirs) {
    try {
      const st = await fs.stat(d);
      if (st.isDirectory()) dirsToScan.push(d);
    } catch (e) { /* ignore missing */ }
  }

  if (mode === 'full') {
    dirsToScan.length = 0;
    dirsToScan.push(root);
  } else if (dirsToScan.length === 0) {
    // nothing found in expected fast paths -> fall back to root
    dirsToScan.push(root);
  }

  console.log('Scanning (mode=' + mode + ') directories:\n' + dirsToScan.join('\n'));
  let found = 0;

  for (const base of dirsToScan) {
    await walk(base, async (file) => {
      if (!await fileIsPng(file)) return;
      // skip unreadable / zero length quickly
      try {
        const st = await fs.stat(file);
        if (st.size === 0) {
          const msg = `ZERO-BYTES\t${file}\n`;
          await fs.appendFile(logPath, msg, 'utf8');
          console.log('[ZERO] ' + file);
          found++;
          return;
        }
      } catch (_) { return; }

      try {
        // jimp.read returns a promise; if it throws (Crc error) we'll catch it.
        await Jimp.read(file);
      } catch (err) {
        const message = String(err && err.message ? err.message : err);
        const logLine = `ERROR\t${file}\t${message}\n`;
        await fs.appendFile(logPath, logLine, 'utf8');
        console.error('[BAD PNG] ' + file + ' -> ' + message);
        found++;
        // if this is the CRC error pattern, exit immediately so you can fix it
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

main().catch((e) => {
  console.error('Scanner failed:', e);
  process.exit(3);
});
