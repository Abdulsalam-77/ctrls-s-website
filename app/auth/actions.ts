"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Define the expected return type for the action
type SignInState = {
  success: boolean
  message: string
} | null

export async function signIn(prevState: SignInState, formData: FormData) {
  console.log("[v0] Starting signIn process")

  const email = formData.get("email") as string | null | undefined
  const password = formData.get("password") as string | null | undefined

  console.log("[v0] Email provided:", !!email)
  console.log("[v0] Password provided:", !!password)

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    console.error("[v0] Error: Email or password missing or invalid type.")
    return { success: false, message: "Please provide a valid email and password." }
  }

  console.log("[v0] Creating Supabase client...")
  const supabase = await createClient() // Await createClient()

  console.log("[v0] Attempting to sign in with Supabase...")
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("[v0] Sign in error:", error.message)
    return { success: false, message: error.message }
  }

  const user = data.user
  console.log("[v0] User signed in successfully:", !!user)

  if (!user) {
    console.error("[v0] User data not found after sign-in")
    return { success: false, message: "User data not found after sign-in." }
  }

  console.log("[v0] Fetching user profile...")
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("[v0] Error fetching profile:", profileError.message)
    return { success: false, message: "Failed to retrieve user profile." }
  }

  console.log("[v0] Profile data:", profileData)
  console.log("[v0] Is admin:", profileData?.is_admin)

  if (profileData?.is_admin) {
    console.log("[v0] Redirecting to admin dashboard")
    redirect("/dashboard/admin")
  } else {
    console.log("[v0] Redirecting to student dashboard")
    redirect("/dashboard/student")
  }
}

export async function signOut() {
  const supabase = await createClient() // Await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
