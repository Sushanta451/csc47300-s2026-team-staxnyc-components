import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseKey =
  import.meta.env.VITE_SUPABASE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

/** True when real project URL + anon key are set (not placeholder). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

// Valid-looking defaults so createClient() does not throw when env is missing (dev UX).
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

let resolvedUrl = supabaseUrl
let resolvedKey = supabaseKey

if (!isSupabaseConfigured) {
  if (import.meta.env.DEV) {
    console.warn(
      '[supabase] Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY (or VITE_SUPABASE_ANON_KEY) in .env at the repo root. Using a placeholder client so the UI can load.',
    )
    resolvedUrl = PLACEHOLDER_URL
    resolvedKey = PLACEHOLDER_ANON_KEY
  } else {
    throw new Error(
      'Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_KEY (or VITE_SUPABASE_ANON_KEY). Copy .env.example to .env and add your Supabase project values.',
    )
  }
}

export const supabase = createClient(resolvedUrl, resolvedKey)
