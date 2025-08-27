import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch available exams for the student
    const { data: exams, error } = await supabase
      .from("exams")
      .select(`
        *,
        exam_submissions!left (
          id,
          status,
          total_score,
          max_score,
          submitted_at
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter and categorize exams
    const availableExams = []
    const completedExams = []

    for (const exam of exams || []) {
      const submission = exam.exam_submissions?.find((s: any) => s.student_id === user.id)

      if (submission && submission.status === "submitted") {
        completedExams.push({
          ...exam,
          submission,
        })
      } else if (!submission || submission.status === "in_progress") {
        availableExams.push({
          ...exam,
          submission,
        })
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
