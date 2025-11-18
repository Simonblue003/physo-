// app.config.js
// Loads .env during local dev (optional). For EAS builds / CI use real environment variables or eas secrets.
try { require('dotenv').config(); } catch (e) { /* dotenv not installed - fine */ }

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  APP_NAME = 'Desk Reset',
  SLUG = 'desk-reset-app',
  IOS_BUNDLE_ID = 'com.yourcompany.deskreset',
  ANDROID_PACKAGE = 'com.yourcompany.deskreset',
  EXPO_OWNER
} = process.env;

/**
 * Export config as a function so we can merge with an existing config if needed.
 * This file will be evaluated by Expo/EAS on build time (node environment),
 * so reading process.env here is the appropriate pattern.
 */
module.exports = ({ config }) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // friendly warning during local runs - EAS should use secrets instead
    // (not a blocker for development if you use Expo's app.json extras temporarily)
    console.warn(
      'Warning: SUPABASE_URL or SUPABASE_ANON_KEY not set. ' +
      'Set environment variables (locally via .env or in EAS secrets) before building.'
    );
  }

  return {
    ...config,
    name: APP_NAME,
    slug: SLUG,
    owner: EXPO_OWNER || config.owner,
    version: '0.1.0',
    orientation: 'portrait',
    extra: {
      // Values consumed in the app via expo-constants (Constants.expoConfig.extra)
      SUPABASE_URL: SUPABASE_URL || 'https://lvebhpkdvvbxrvdbptfc.supabase.co',
      SUPABASE_ANON_KEY: SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2ZWJocGtkdnZieHJ2ZGJwdGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzcyNjAsImV4cCI6MjA3NzQ1MzI2MH0.FigoSpkJg93ZQgvFumNGUUKex7E6R56d8lp4ZfKtrvw',
      // you can add additional runtime config keys here if needed
    },
    ios: {
      bundleIdentifier: IOS_BUNDLE_ID,
      supportsTablet: false,
    },
    android: {
      package: ANDROID_PACKAGE,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF'
      }
    },
    web: {
      favicon: './assets/favicon.png'
    }
  };
};
