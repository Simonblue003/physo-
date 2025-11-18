// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const SUPABASE_URL = process.env.SUPABASE_URL || Constants.manifest?.extra?.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || Constants.manifest?.extra?.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase env vars missing. Set SUPABASE_URL and SUPABASE_ANON_KEY')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
})
