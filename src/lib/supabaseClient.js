import { createClient } from '@supabase/supabase-js'

function readViteEnv(name) {
  const value = import.meta.env?.[name]
  return typeof value === 'string' ? value.trim() : ''
}

const supabaseUrl = readViteEnv('VITE_SUPABASE_URL')
const supabaseAnonKey = readViteEnv('VITE_SUPABASE_ANON_KEY')
const normalizedSupabaseUrl = supabaseUrl.replace(/\/+$/, '')
const SUPABASE_REST_VERSION = 'v1'

export const isSupabaseEnabled = Boolean(normalizedSupabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseEnabled
  ? createClient(normalizedSupabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`
        }
      }
    })
  : null

const supabaseDebug = {
  enabled: isSupabaseEnabled,
  url: normalizedSupabaseUrl || '(empty)',
  restUrl: normalizedSupabaseUrl ? `${normalizedSupabaseUrl}/rest/${SUPABASE_REST_VERSION}` : '(empty)',
  anonKeyPrefix: supabaseAnonKey ? `${supabaseAnonKey.slice(0, 16)}...` : '(empty)',
  hasViteSupabaseUrl: Boolean(import.meta.env?.VITE_SUPABASE_URL),
  hasViteSupabaseAnonKey: Boolean(import.meta.env?.VITE_SUPABASE_ANON_KEY)
}

if (typeof window !== 'undefined') {
  window.__LESSON_SUPABASE_DEBUG__ = supabaseDebug
  window.console.info('[supabase-debug]', supabaseDebug)
}
