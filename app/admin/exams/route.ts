import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

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

    const { data: exams, error } = await supabase
      .from("exams")
      .select(`*, exam_submissions(count)`)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ exams })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { title, description, duration_minutes, start_date, end_date, status = "draft" } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: "Exam title is required" }, { status: 400 })
    }

    if (!start_date) {
      return NextResponse.json({ error: "Start date is required" }, { status: 400 })
    }

    if (!end_date) {
      return NextResponse.json({ error: "End date is required" }, { status: 400 })
    }

    if (new Date(start_date) >= new Date(end_date)) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 })
    }

    if (duration_minutes < 1) {
      return NextResponse.json({ error: "Duration must be at least 1 minute" }, { status: 400 })
    }

    const { data: exam, error } = await supabase
      .from("exams")
      .insert({
        title,
        description,
        duration_minutes,
        start_date,
        end_date,
        status,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "Failed to create exam. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ exam })
  } catch (error) {
    console.error("[v0] Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
