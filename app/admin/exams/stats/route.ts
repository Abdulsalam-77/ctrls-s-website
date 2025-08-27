import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { count: totalExams } = await supabase.from("exams").select("id", { count: "exact" })
    const { count: activeExams } = await supabase.from("exams").select("id", { count: "exact" }).eq("status", "active")
    const { count: upcomingExams } = await supabase.from("exams").select("id", { count: "exact" }).eq("status", "draft")
    const { count: totalSubmissions } = await supabase.from("exam_submissions").select("id", { count: "exact" })

    return NextResponse.json({
      stats: {
        totalExams: totalExams ?? 0,
        activeExams: activeExams ?? 0,
        upcomingExams: upcomingExams ?? 0,
        totalSubmissions: totalSubmissions ?? 0,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}