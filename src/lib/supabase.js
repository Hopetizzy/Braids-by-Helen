import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-public-api-key'
);

if (!isSupabaseConfigured) {
  console.info(
    '%c[Braids by Helen]%c Running in offline demo mode with local mock storage. To connect live Supabase, configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
    'color: #70263D; font-weight: bold;',
    'color: inherit;'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'braids-by-helen-auth-token',
      },
    })
  : null;
