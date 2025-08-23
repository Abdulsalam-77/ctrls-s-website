import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  // Made async
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kbvxiiskkbaqhazvvuak.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtidnhpaXNra2JhcWhhenZ2dWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjM1MzQsImV4cCI6MjA2OTc5OTUzNH0.VirREIN3VSt1DPxjsMlLrPxt-zSaQh0Mu-4qM3YgEBU"

  const cookieStore = await cookies() // Await cookies() to satisfy Next.js's static analysis

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
