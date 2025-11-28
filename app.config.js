// app.config.js
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

const COLORS_XML = `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <!-- ensured by config plugin to avoid missing splashscreen_background AAPT errors -->
  <color name="splashscreen_background">#FFFFFF</color>
  <color name="background">#FFFFFF</color>
  <color name="primary">#2196F3</color>
  <color name="white">#FFFFFF</color>
</resources>
`;

function ensureColorsFile(projectRoot) {
  const valuesPaths = [
    path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'values'),
    path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'values-v21'),
    path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'values-night'),
  ];

  for (const dir of valuesPaths) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, 'colors.xml');
      fs.writeFileSync(file, COLORS_XML, { encoding: 'utf8' });
      // console.log(`WROTE ${file}`);
    } catch (e) {
      // best-effort: do not crash the prebuild plugin
      // console.warn('Could not write colors.xml to', dir, e);
    }
  }
}

// expo config plugin that runs during prebuild (android dangerous mod)
const withColors = config => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      ensureColorsFile(projectRoot);
      return config;
    },
  ]);
};

module.exports = ({ config }) => {
  // add plugin to list (merge safely if user already has plugins)
  const plugins = config.plugins ? [...config.plugins, withColors] : [withColors];

  const final = {
    ...config,
    plugins,
    // ensure splash background color is set so prebuild behavior is consistent
    splash: {
      ...(config.splash || {}),
      backgroundColor: (config.splash && config.splash.backgroundColor) || '#FFFFFF',
      image: (config.splash && config.splash.image) || './assets/splash.png',
      resizeMode: (config.splash && config.splash.resizeMode) || 'contain'
    },
    // ensure android package is present (replace with your package if different)
    android: {
      ...(config.android || {}),
      package: (config.android && config.android.package) || 'com.martiankings.deskreset'
    }
  };
  return final;
};
