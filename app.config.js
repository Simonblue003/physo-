// app.config.js
// Safe dynamic config for Expo/EAS. Replace the ALL-CAPS placeholders below.
try { require('dotenv').config(); } catch (e) { /* optional */ }

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  APP_NAME = 'Desk Reset',
  SLUG = 'desk-reset-app',
  ANDROID_PACKAGE = 'com.simonblue003.physo',      // <-- REPLACE with your package id
  IOS_BUNDLE_ID = 'com.simonblue003.physo',       // <-- REPLACE with your bundle id
  EAS_PROJECT_ID = '8323ca4c-dacc-46b4-ac00-23e46fcbced8' // <-- keep or replace with your projectId
} = process.env;

module.exports = ({ config }) => {
  // Use the incoming `config` only inside this function scope
  return {
    ...config,
    name: APP_NAME,
    slug: SLUG,
    version: '0.1.0',
    extra: {
      ...(config.extra || {}),
      eas: { projectId: EAS_PROJECT_ID },
      SUPABASE_URL: SUPABASE_URL || (config.extra && config.extra.SUPABASE_URL) || '',
      SUPABASE_ANON_KEY: SUPABASE_ANON_KEY || (config.extra && config.extra.SUPABASE_ANON_KEY) || ''
    },
    ios: {
      ...(config.ios || {}),
      bundleIdentifier: IOS_BUNDLE_ID
    },
    android: {
      ...(config.android || {}),
      package: ANDROID_PACKAGE,
      adaptiveIcon: config.android?.adaptiveIcon || {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF'
      }
    },
    plugins: [
      ...(config.plugins || []),
      'expo-secure-store'
    ],
    web: {
      ...(config.web || {}),
      favicon: config.web?.favicon || './assets/favicon.png'
    }
  };
};
