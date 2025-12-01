// app.config.js — safe static config that guarantees expo.extra.eas.projectId
const fs = require('fs');

const projectId = 'ec60ae2e-cef0-40bb-8cd4-b51730bf5998'; // your EAS project id

// read app.json (if present) to preserve fields, otherwise build minimal config
let base = {};
try {
  base = JSON.parse(fs.readFileSync('./app.json', 'utf8')).expo || {};
} catch (e) {
  base = {
    name: 'Desk Reset',
    slug: 'desk-reset',
    version: '1.0.0',
    platforms: ['ios','android']
  };
}

module.exports = () => {
  base.extra = base.extra || {};
  base.extra.eas = base.extra.eas || {};
  base.extra.eas.projectId = projectId;

  // ensure required identifiers exist
  base.android = base.android || {};
  base.ios = base.ios || {};
  base.android.package = base.android.package || 'com.martiankings.deskreset';
  base.ios.bundleIdentifier = base.ios.bundleIdentifier || 'com.martiankings.deskreset';

  return { expo: base };
};
