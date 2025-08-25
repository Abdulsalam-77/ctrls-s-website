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
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current time for filtering
    const now = new Date().toISOString()

    // Fetch available exams for the student
    const { data: exams, error } = await supabase
      .from("exams")
      .select(`
        *,
        submissions!left (
          id,
          status,
          total_score,
          max_score,
          end_time
        )
      `)
      .eq("status", "active")
      .or(`visibility.eq.all,exam_visibility.student_id.eq.${user.id}`)
      .order("start_date", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter and categorize exams
    const availableExams = []
    const completedExams = []

    for (const exam of exams || []) {
      const submission = exam.submissions?.[0]

      if (submission && submission.status === "submitted") {
        completedExams.push({
          ...exam,
          submission,
        })
      } else if (!submission || submission.status === "in_progress") {
        // Check if exam is still available (within time window)
        const examStart = exam.start_date ? new Date(exam.start_date) : new Date(0)
        const examEnd = exam.end_date ? new Date(exam.end_date) : new Date("2099-12-31")
        const currentTime = new Date()

        if (currentTime >= examStart && currentTime <= examEnd) {
          availableExams.push({
            ...exam,
            submission,
          })
        }
      }
    }

    return NextResponse.json({
      availableExams,
      completedExams,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
