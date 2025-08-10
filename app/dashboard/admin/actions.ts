"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Type definitions for content and profile
export type ContentItem = {
  id: string
  title: string
  description: string | null
  type: string
  section: string
  url: string | null
  text_content: string | null
  thumbnail_image: string | null // Added thumbnail_image
  created_at: string
}

export type Profile = {
  id: string
  email: string | null
  is_admin: boolean // This is required by the type
  created_at: string
}

// --- Dashboard Stats (Prompt 6) ---
export async function fetchAdminDashboardStats() {
  const supabase = await createClient()

  // Total Students
  const { count: totalStudents, error: studentsError } = await supabase
    .from("profiles")
    .select("id", { count: "exact" })
    .eq("is_admin", false)

  if (studentsError) {
    console.error("Error fetching total students:", studentsError.message)
    return { totalStudents: 0, totalVideos: 0, newSignups30Days: 0, error: studentsError.message }
  }

  // Total Videos
  const { count: totalVideos, error: videosError } = await supabase
    .from("content_items")
    .select("id", { count: "exact" })

  if (videosError) {
    console.error("Error fetching total videos:", videosError.message)
    return { totalStudents: 0, totalVideos: 0, newSignups30Days: 0, error: videosError.message }
  }

  // New Sign-ups (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { count: newSignups30Days, error: signupsError } = await supabase
    .from("profiles")
    .select("id", { count: "exact" })
    .eq("is_admin", false)
    .gte("created_at", thirtyDaysAgo.toISOString())

  if (signupsError) {
    console.error("Error fetching new sign-ups:", signupsError.message)
    return { totalStudents: 0, totalVideos: 0, newSignups30Days: 0, error: signupsError.message }
  }

  return {
    totalStudents: totalStudents || 0,
    totalVideos: totalVideos || 0,
    newSignups30Days: newSignups30Days || 0,
    error: null,
  }
}

// --- Content Management (Prompt 2 & 3) ---
export async function fetchContentItems(): Promise<{ data: ContentItem[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("content_items").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching content items:", error.message)
    return { data: null, error: error.message }
  }
  return { data, error: null }
}

export async function addLecture(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const category = formData.get("category") as string // 'Theoretical' or 'Practical'
  const thumbnailImage = formData.get("thumbnailImage") as string
  const videoSourceUrl = formData.get("videoSourceUrl") as string

  if (!title || !category || !videoSourceUrl) {
    return { success: false, message: "Title, Category, and Video URL are required." }
  }

  const { error } = await supabase.from("content_items").insert({
    title,
    description,
    type: "video", // Assuming all lectures are videos for now
    section: category,
    url: videoSourceUrl,
    thumbnail_image: thumbnailImage,
  })

  if (error) {
    console.error("Error adding lecture:", error.message)
    return { success: false, message: error.message }
  }

  revalidatePath("/dashboard/admin") // Revalidate the admin dashboard page
  return { success: true, message: "Lecture added successfully!" }
}

export async function updateLecture(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get("id") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const category = formData.get("category") as string
  const thumbnailImage = formData.get("thumbnailImage") as string
  const videoSourceUrl = formData.get("videoSourceUrl") as string

  if (!id || !title || !category || !videoSourceUrl) {
    return { success: false, message: "ID, Title, Category, and Video URL are required." }
  }

  const { error } = await supabase
    .from("content_items")
    .update({
      title,
      description,
      section: category,
      url: videoSourceUrl,
      thumbnail_image: thumbnailImage,
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating lecture:", error.message)
    return { success: false, message: error.message }
  }

  revalidatePath("/dashboard/admin")
  return { success: true, message: "Lecture updated successfully!" }
}

export async function deleteLecture(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("content_items").delete().eq("id", id)

  if (error) {
    console.error("Error deleting lecture:", error.message)
    return { success: false, message: error.message }
  }

  revalidatePath("/dashboard/admin")
  return { success: true, message: "Lecture deleted successfully!" }
}

// --- Student Management (Prompt 4 & 5) ---
export async function fetchStudents(): Promise<{ data: Profile[] | null; error: string | null }> {
  const supabase = await createClient()
  // FIX: Include 'is_admin' in the select query to match the Profile type
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, created_at, is_admin") // Added is_admin here
    .eq("is_admin", false) // Only fetch non-admin profiles
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching students:", error.message)
    return { data: null, error: error.message }
  }
  return { data, error: null }
}

export async function createStudentAccount(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string // Not directly used by auth.signUp, but good for UI

  if (!email || !password) {
    return { success: false, message: "Email and Password are required." }
  }

  // Supabase auth.signUp automatically creates a profile via the trigger
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // This can be passed to the trigger if you modify it to accept full_name
      },
    },
  })

  if (error) {
    console.error("Error creating student account:", error.message)
    return { success: false, message: error.message }
  }

  revalidatePath("/dashboard/admin")
  return { success: true, message: "Student account created successfully!" }
}

export async function signOutAdmin() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
