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

module.exports = ({ config }) ; {
  return {
    ...config,
    name: APP_NAME,
    slug: SLUG,
    version: '0.1.0',
    extra: {
      ...(config.extra || {}),
      // <-- ADD THE EAS PROJECT ID you copied from `npx eas project:init` or expo.dev
      eas: {
        projectId: '8323ca4c-dacc-46b4-ac00-23e46fcbced8'   
      },
      SUPABASE_URL: process.env.SUPABASE_URL || (config.extra && config.extra.SUPABASE_URL),
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || (config.extra && config.extra.SUPABASE_ANON_KEY),
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
