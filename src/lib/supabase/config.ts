// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';
import { type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekyerljzfokqimbabzxm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVreWVybGp6Zm9rcWltYmFienhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MjQ5NzAsImV4cCI6MjA1NTUwMDk3MH0.2QYwQYwQYwQYwQYwQYwQYwQYwQYwQYwQYwQYwQYwQYw';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export function isSupabaseAvailable() { return true; }

export const STORAGE_BUCKETS = {
  CLUB_AVATAR: 'clubavatar'
};

// Helper functions for storage operations
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: { cacheControl?: string; upsert?: boolean }
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options);

  if (error) throw error;
  return data;
}

export async function getPublicUrl(bucket: string, path: string) {
  const supabase = getSupabaseClient();
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return data;
}