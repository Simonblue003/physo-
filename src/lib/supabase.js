// src/lib/supabase.js
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const publicUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  ?? Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL
  ?? Constants.manifest?.extra?.EXPO_PUBLIC_SUPABASE_URL;

const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ?? Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ?? Constants.manifest?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!publicUrl || !anonKey) {
  console.warn('Missing Supabase config. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(publicUrl || '', anonKey || '');
