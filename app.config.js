// app.config.js
try { require('dotenv').config(); } catch (e) { /* dotenv optional */ }

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  APP_NAME = 'Desk Reset',
  SLUG = 'desk-reset-app',
  ANDROID_PACKAGE = 'com.yourcompany.deskreset',    // <-- REPLACE this
  IOS_BUNDLE_ID = 'com.yourcompany.deskreset'      // <-- REPLACE this
} = process.env;

module.exports = ({ config }) => {
  return {
    ...config,
    name: APP_NAME,
    slug: SLUG,
    version: '0.1.0',
    extra: {
      SUPABASE_URL: SUPABASE_URL || 'https://replace-with-your-supabase-url',
      SUPABASE_ANON_KEY: SUPABASE_ANON_KEY || 'replace-with-anon-key'
    },
    ios: {
      bundleIdentifier: IOS_BUNDLE_ID
    },
    android: {
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
      favicon: './assets/favicon.png'
    }
  };
};
