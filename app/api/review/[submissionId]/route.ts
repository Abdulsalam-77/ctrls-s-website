import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { submissionId: string } }) {
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

    // Get submission details with exam info
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select(`
        *,
        exams (
          id,
          title,
          description,
          allow_review,
          show_results
        )
      `)
      .eq("id", params.submissionId)
      .single()

    if (submissionError) {
      return NextResponse.json({ error: submissionError.message }, { status: 500 })
    }

    // Check if user owns this submission or is admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (submission.student_id !== user.id && !profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if review is allowed
    if (!submission.exams?.allow_review && !profile?.is_admin) {
      return NextResponse.json({ error: "Review not allowed for this exam" }, { status: 403 })
    }

    // Get all answers with question details
    const { data: answers, error: answersError } = await supabase
      .from("answers")
      .select(`
        *,
        questions (
          id,
          question_text,
          question_type,
          options,
          correct_answer,
          points,
          file_url
        )
      `)
      .eq("submission_id", params.submissionId)
      .order("questions(order_index)")

    if (answersError) {
      return NextResponse.json({ error: answersError.message }, { status: 500 })
    }

    return NextResponse.json({
      submission,
      answers,
      exam: submission.exams,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
