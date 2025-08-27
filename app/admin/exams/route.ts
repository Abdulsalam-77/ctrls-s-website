import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  try {
    console.log("[v0] GET /admin/exams - Starting request")

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] User found:", !!user)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Checking user profile for admin status")
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.log("[v0] Profile query error:", profileError)
      return NextResponse.json({ error: `Profile error: ${profileError.message}` }, { status: 500 })
    }

    console.log("[v0] Profile data:", profile)

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log("[v0] Fetching exams from database")
    // Fetch all exams with submission counts
    const { data: exams, error } = await supabase
      .from("exams")
      .select(`
        *,
        exam_submissions(count)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.log("[v0] Exams query error:", error)
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Exams fetched successfully:", exams?.length || 0)
    return NextResponse.json({ exams })
  } catch (error) {
    console.log("[v0] Unexpected error in GET /admin/exams:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    console.log("[v0] POST /admin/exams - Starting exam creation")

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] User found:", !!user)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Checking user profile for admin status")
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.log("[v0] Profile query error:", profileError)
      return NextResponse.json({ error: `Profile error: ${profileError.message}` }, { status: 500 })
    }

    console.log("[v0] Profile data:", profile)

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    console.log("[v0] Request body received:", {
      title: body.title,
      description: body.description?.substring(0, 50) + "...",
      duration_minutes: body.duration_minutes,
      questionsCount: body.questions?.length || 0,
    })

    const { title, description, duration_minutes, questions } = body

    console.log("[v0] Inserting exam into database")
    const { data: exam, error } = await supabase
      .from("exams")
      .insert({
        title,
        description,
        duration_minutes,
        total_marks: questions?.reduce((sum: number, q: any) => sum + (q.marks || 1), 0) || 100,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.log("[v0] Exam insertion error:", error)
      return NextResponse.json({ error: `Exam creation error: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Exam created successfully:", exam.id)

    // Insert questions if provided
    if (questions && questions.length > 0) {
      console.log("[v0] Inserting questions for exam:", exam.id)
      const questionsToInsert = questions.map((q: any, index: number) => ({
        exam_id: exam.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || null,
        correct_answer: q.correct_answer || null,
        marks: q.marks || 1,
        order_index: index,
      }))

      const { error: questionsError } = await supabase.from("exam_questions").insert(questionsToInsert)

      if (questionsError) {
        console.log("[v0] Questions insertion error:", questionsError)
        return NextResponse.json({ error: `Questions creation error: ${questionsError.message}` }, { status: 500 })
      }

      console.log("[v0] Questions inserted successfully:", questions.length)
    }

    console.log("[v0] Exam creation completed successfully")
    return NextResponse.json({ exam })
  } catch (error) {
    console.log("[v0] Unexpected error in POST /admin/exams:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
