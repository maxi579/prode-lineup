import { createClient } from '@supabase/supabase-js';
import { soloDemo } from './demo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// La versión demo se compila sin datos de Supabase y nunca lo usa
export const supabase = soloDemo ? null : createClient(supabaseUrl, supabaseAnonKey);
