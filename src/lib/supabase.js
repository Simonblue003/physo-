// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || (global?.__supabase_url__);
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || (global?.__supabase_anon_key__);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase keys: make sure SUPABASE_URL and SUPABASE_ANON_KEY are provided.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  // disable local persistence for simple usage
  auth: { persistSession: false }
});
