import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { examId, answers } = body

    // Get or create submission
    let { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("*")
      .eq("exam_id", examId)
      .eq("student_id", user.id)
      .single()

    if (submissionError && submissionError.code !== "PGRST116") {
      return NextResponse.json({ error: submissionError.message }, { status: 500 })
    }

    if (!submission) {
      // Create new submission
      const { data: newSubmission, error: createError } = await supabase
        .from("submissions")
        .insert({
          exam_id: examId,
          student_id: user.id,
          status: "submitted",
          end_time: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }
      submission = newSubmission
    } else {
      // Update existing submission
      const { error: updateError } = await supabase
        .from("submissions")
        .update({
          status: "submitted",
          end_time: new Date().toISOString(),
        })
        .eq("id", submission.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    }

    // Save answers
    for (const answer of answers) {
      const { error: answerError } = await supabase.from("answers").upsert({
        submission_id: submission.id,
        question_id: answer.questionId,
        student_answer: answer.answer,
        student_file_url: answer.fileUrl,
      })

      if (answerError) {
        console.error("Error saving answer:", answerError)
      }
    }

    // Auto-grade MCQ and True/False questions
    await autoGradeSubmission(supabase, submission.id)

    return NextResponse.json({ success: true, submissionId: submission.id })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function autoGradeSubmission(supabase: any, submissionId: string) {
  // Get all answers for this submission with question details
  const { data: answers } = await supabase
    .from("answers")
    .select(`
      *,
      questions (
        question_type,
        correct_answer,
        points
      )
    `)
    .eq("submission_id", submissionId)

  let totalScore = 0
  let maxScore = 0

  for (const answer of answers || []) {
    const question = answer.questions
    maxScore += question.points || 1

    if (question.question_type === "mcq" || question.question_type === "true_false") {
      const isCorrect = answer.student_answer === question.correct_answer
      const score = isCorrect ? question.points || 1 : 0

      await supabase
        .from("answers")
        .update({
          score,
          is_correct: isCorrect,
        })
        .eq("id", answer.id)

      if (isCorrect) {
        totalScore += question.points || 1
      }
    }
  }

  // Update submission with scores
  await supabase
    .from("submissions")
    .update({
      total_score: totalScore,
      max_score: maxScore,
      status: maxScore > totalScore ? "graded" : "graded", // Will be 'graded' when manual grading is needed
    })
    .eq("id", submissionId)
}
