"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Define the expected return type for the action
type SignInState = {
  success: boolean
  message: string
} | null

export async function signIn(prevState: SignInState, formData: FormData) {
  const email = formData.get("email") as string | null | undefined
  const password = formData.get("password") as string | null | undefined

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    console.error("Error: Email or password missing or invalid type.")
    return { success: false, message: "Please provide a valid email and password." }
  }

  const supabase = await createClient() // Await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Sign in error:", error.message)
    return { success: false, message: error.message }
  }

  const user = data.user

  if (!user) {
    return { success: false, message: "User data not found after sign-in." }
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("Error fetching profile:", profileError.message)
    return { success: false, message: "Failed to retrieve user profile." }
  }

  if (profileData?.is_admin) {
    redirect("/dashboard/admin")
  } else {
    redirect("/dashboard/student")
  }
}

export async function signOut() {
  const supabase = await createClient() // Await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
