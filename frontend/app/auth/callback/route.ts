import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // Supabase handles email confirmation automatically via URL detection
  // This route just redirects after confirmation
  // The supabase client with detectSessionInUrl: true will handle the token
  
  const next = requestUrl.searchParams.get('next') || '/login';
  
  // Redirect to login page - user can sign in after email confirmation
  // The auth state change will detect the confirmed session
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
