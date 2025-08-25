import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

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

    const { data: activeExams } = await supabase.from("exams").select("id", { count: "exact" }).eq("status", "active")

    const { data: upcomingExams } = await supabase.from("exams").select("id", { count: "exact" }).eq("status", "draft")

    const { data: totalSubmissions } = await supabase.from("submissions").select("id", { count: "exact" })

    return NextResponse.json({
      stats: {
        totalExams: totalExams?.length || 0,
        activeExams: activeExams?.length || 0,
        upcomingExams: upcomingExams?.length || 0,
        totalSubmissions: totalSubmissions?.length || 0,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
