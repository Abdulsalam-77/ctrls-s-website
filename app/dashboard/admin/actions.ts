"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// --- TYPE DEFINITIONS ---
// These define the 'shape' of our data.
export type ContentItem = {
  id: string
  title: string
  description: string | null
  type: string
  section: string
  url: string | null
  text_content: string | null
  thumbnail_image: string | null
  created_at: string
}

export type Profile = {
  id: string
  email: string | null
  is_admin?: boolean // Corrected: Made optional
  created_at?: string // Corrected: Made optional
  full_name?: string
}

export type Exam = {
    id: string
    title: string
    exam_type: string
    total_points: number
    due_date: string | null
    duration_minutes: number | null
    created_at: string
    is_active?: boolean // Added for stats
}

export type StudentGrade = {
    id: string
    student_id: string
    exam_id: string
    score: number | null
    submission_date: string | null
    profiles: { full_name: string | null, email: string | null }
    exams: { title: string | null }
}


// --- NEW ADMIN ACTIONS FOR EXAMS & GRADES ---

export async function fetchAllStudentsForAdmin(): Promise<{ data: Profile[] | null; error: string | null }> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("is_admin", false)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching all students:", error.message)
        return { data: null, error: error.message }
    }
    return { data, error: null }
}

export async function fetchExamsForAdmin(): Promise<{ data: Exam[] | null; error: string | null }> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("exams")
        .select("*")
        .order("created_at", { ascending: false })
    
    if (error) {
        console.error("Error fetching exams:", error.message)
        return { data: null, error: error.message }
    }
    return { data, error: null }
}

export async function createExam(formData: FormData) {
    const supabase = await createClient()
    const { error } = await supabase.from("exams").insert({
        title: formData.get("title") as string,
        exam_type: formData.get("exam_type") as string,
        total_points: Number(formData.get("total_points")),
        due_date: formData.get("due_date") as string,
    })
    if (error) return { success: false, message: error.message }
    revalidatePath("/dashboard/admin")
    return { success: true, message: "Exam created successfully." }
}

export async function fetchGradesForStudent(studentId: string): Promise<{ data: StudentGrade[] | null; error: string | null }> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("student_exams")
        .select(`*, profiles(full_name, email), exams(title)`)
        .eq("student_id", studentId)

    if (error) {
        console.error("Error fetching grades:", error.message)
        return { data: null, error: error.message }
    }
    return { data, error: null }
}

export async function assignGrade(formData: FormData) {
    const supabase = await createClient()
    const { error } = await supabase.from("student_exams").insert({
        student_id: formData.get("student_id") as string,
        exam_id: formData.get("exam_id") as string,
        score: Number(formData.get("score")),
        submission_date: new Date().toISOString(),
    })
    if (error) return { success: false, message: error.message }
    revalidatePath("/dashboard/admin")
    return { success: true, message: "Grade assigned successfully." }
}


// --- EXISTING ADMIN ACTIONS ---

export async function fetchAdminDashboardStats() {
  const supabase = await createClient()
  const { count: totalStudents } = await supabase.from("profiles").select("id", { count: "exact" }).eq("is_admin", false)
  const { count: totalVideos } = await supabase.from("content_items").select("id", { count: "exact" })
  return { totalStudents: totalStudents || 0, totalVideos: totalVideos || 0, newSignups30Days: 0 }
}

export async function fetchContentItems(): Promise<{ data: ContentItem[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("content_items").select("*").order("created_at", { ascending: false })
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function createStudentAccount(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return { success: false, message: error.message }
  revalidatePath("/dashboard/admin")
  return { success: true, message: "Student account created." }
}

export async function signOutAdmin() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
