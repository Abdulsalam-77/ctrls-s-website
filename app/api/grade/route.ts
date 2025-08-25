import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { submissionId, grades } = body // grades: [{ answerId, score, feedback }]

    // Update individual answer grades
    for (const grade of grades) {
      const { error: gradeError } = await supabase
        .from("answers")
        .update({
          score: grade.score,
          feedback: grade.feedback,
        })
        .eq("id", grade.answerId)

      if (gradeError) {
        console.error("Error updating grade:", gradeError)
      }
    }

    // Calculate total score for the submission
    const { data: answers } = await supabase
      .from("answers")
      .select("score, questions(points)")
      .eq("submission_id", submissionId)

    let totalScore = 0
    let maxScore = 0

    for (const answer of answers || []) {
      totalScore += answer.score || 0
      maxScore += answer.questions?.points || 1
    }

    // Update submission with final scores
    const { error: submissionError } = await supabase
      .from("submissions")
      .update({
        total_score: totalScore,
        max_score: maxScore,
        status: "graded",
      })
      .eq("id", submissionId)

    if (submissionError) {
      return NextResponse.json({ error: submissionError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, totalScore, maxScore })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
