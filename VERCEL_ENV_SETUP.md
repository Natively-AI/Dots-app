# Vercel Environment Variables Setup

This guide explains how to set up environment variables for the Dots app in Vercel.

## Required Environment Variables

The following environment variables must be set in your Vercel project:

### Frontend Environment Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Format: `https://xxxxxxxxxxxxx.supabase.co`
   - Found in: Supabase Dashboard → Settings → API → Project URL

2. **NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY**
   - Your Supabase anon/public key
   - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Found in: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

3. **NEXT_PUBLIC_API_URL** (Optional, defaults to http://localhost:8000)
   - Your backend API URL
   - Format: `https://your-backend-url.run.app`
   - This is your GCP Cloud Run service URL

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Add each variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - **Environment**: Select all environments (Production, Preview, Development)
5. Repeat for all required variables
6. **Important**: After adding variables, redeploy your application for changes to take effect

## Verification

After setting the environment variables and redeploying:

1. Check your Vercel deployment logs to ensure no environment variable errors
2. Test authentication flows (login, register, password reset)
3. Check browser console for any Supabase connection errors

## Common Issues

### "SUPABASE_URL is not configured" Error

**Cause**: Environment variables are not set in Vercel or deployment hasn't been triggered after adding them.

**Solution**:
1. Verify variables are set in Vercel → Settings → Environment Variables
2. Ensure variables are enabled for the correct environment (Production, Preview, Development)
3. Redeploy your application after adding variables
4. Check that variable names match exactly (case-sensitive)

### Authentication Not Working

**Cause**: Incorrect Supabase URL or key, or variables not available at runtime.

**Solution**:
1. Verify Supabase URL and key are correct in Supabase Dashboard
2. Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
3. Check browser console for specific error messages
4. Verify Supabase project is active and not paused

## Notes

- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never commit `.env.local` files to version control
- Use different Supabase projects for development and production if needed
- Redeploy after changing environment variables
