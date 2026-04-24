import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — check .env.local')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    // No Supabase auth for patient-facing app — use token-based identity
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'x-app-source': 'patienttrac-profiler',
    },
  },
})

export const ORG_ID          = import.meta.env.VITE_DEV_ORG_ID as string
export const SCHEDULING_URL  = import.meta.env.VITE_SCHEDULING_URL as string || 'https://patienttracforge.com'
