import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = await params.id; // Safely store the ID
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
      },
    },
  )

  try {
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, status, duration_minutes, start_date, end_date } = body

    // --- START OF THE FIX: VALIDATION FOR ACTIVATION ---
    if (status === 'active') {
      // 1. Check for questions
      const { data: questions, error: questionsError } = await supabase
        .from("exam_questions")
        .select("id")
        .eq("exam_id", id)
        .limit(1);

      if (questionsError) throw questionsError;
      if (!questions || questions.length === 0) {
        return NextResponse.json({ error: "Exam must have at least one question before activation." }, { status: 400 });
      }

      // 2. Check for valid dates
      if (!start_date || !end_date) {
        return NextResponse.json({ error: "Exam must have a start and end date." }, { status: 400 });
      }
      if (new Date(start_date) >= new Date(end_date)) {
        return NextResponse.json({ error: "End date must be after the start date." }, { status: 400 });
      }
    }
    // --- END OF THE FIX ---

    const { data: exam, error } = await supabase
      .from("exams")
      .update({
        title,
        description,
        status,
        duration_minutes,
        start_date,
        end_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id) // Use the stored 'id' variable
      .select()
      .single()

    if (error) {
      throw error;
    }

    return NextResponse.json({ exam })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Error updating exam:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id; // Safely store the ID
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
      },
    },
  )

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Before deleting the exam, delete related questions
    const { error: questionsError } = await supabase.from("exam_questions").delete().eq("exam_id", id);
    if (questionsError) {
      // Log the error but continue to attempt to delete the exam
      console.error("Error deleting exam questions:", questionsError.message);
    }

    const { error: examError } = await supabase.from("exams").delete().eq("id", id);
    if (examError) {
      throw examError;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Error deleting exam:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}