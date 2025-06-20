// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
console.log('Supabase supabaseServiceRoleKey:', supabaseServiceRoleKey);

// Client-side Supabase instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase instance (admin)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
