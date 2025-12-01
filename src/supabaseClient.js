// src/supabaseClient.js
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const { supabaseUrl, supabaseAnonKey } = Constants.expoConfig?.extra ?? {};

// debug guard
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase config missing. Check app.config.js / EAS envs');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
