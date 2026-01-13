import { createClient } from '@supabase/supabase-js';
import { User } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('Supabase URL or Publishable Key not configured. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper function to convert Supabase user to our User type
export function mapSupabaseUser(supabaseUser: any): User | null {
  if (!supabaseUser) return null;
  
  return {
    id: parseInt(supabaseUser.id) || 0,
    email: supabaseUser.email || '',
    full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
    age: supabaseUser.user_metadata?.age || null,
    bio: supabaseUser.user_metadata?.bio || null,
    location: supabaseUser.user_metadata?.location || null,
    avatar_url: supabaseUser.user_metadata?.avatar_url || null,
    created_at: supabaseUser.created_at || new Date().toISOString(),
    updated_at: supabaseUser.updated_at || null,
  };
}
