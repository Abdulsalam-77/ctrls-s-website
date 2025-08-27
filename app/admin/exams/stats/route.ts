import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  try {
    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get exam statistics
    const { data: totalExams } = await supabase.from("exams").select("id", { count: "exact" })

    const { data: activeExams } = await supabase.from("exams").select("id", { count: "exact" }).eq("is_active", true)

    const { data: inactiveExams } = await supabase.from("exams").select("id", { count: "exact" }).eq("is_active", false)

    const { data: totalSubmissions } = await supabase.from("exam_submissions").select("id", { count: "exact" })

    return NextResponse.json({
      stats: {
        totalExams: totalExams?.length || 0,
        activeExams: activeExams?.length || 0,
        inactiveExams: inactiveExams?.length || 0,
        totalSubmissions: totalSubmissions?.length || 0,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
