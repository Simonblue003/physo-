// app.config.js
import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    name: config.name ?? "Desk Reset",
    slug: config.slug ?? "desk-reset",
    extra: {
      // EAS: set SUPABASE_URL and SUPABASE_ANON_KEY in EAS project env
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    },
  };
};
