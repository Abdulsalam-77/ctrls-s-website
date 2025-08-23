import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kbvxiiskkbaqhazvvuak.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtidnhpaXNra2JhcWhhenZ2dWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjM1MzQsImV4cCI6MjA2OTc5OTUzNH0.VirREIN3VSt1DPxjsMlLrPxt-zSaQh0Mu-4qM3YgEBU"

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
