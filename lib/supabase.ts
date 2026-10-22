import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { Storage } from 'expo-sqlite/kv-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// React Native has no `localStorage`, so without an explicit adapter Supabase
// falls back to an in-memory store and the session is lost on every restart.
const storage = Platform.OS === 'web' ? undefined : Storage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});