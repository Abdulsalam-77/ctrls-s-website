// pages/api/admin/exams/route.ts (App Router style)
import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const supabase = createAdminClient();
    try {
        const body = await req.json();

        const { data: exam, error: examError } = await supabase
            .from("exams")
            .insert({
                title: body.title,
                description: body.description,
                duration_minutes: body.duration_minutes,
                start_date: body.start_date,
                end_date: body.end_date,
                status: body.status || "draft",
                created_by: body.created_by,
            })
            .select()
            .single();

        if (examError) throw examError;

        if (body.questions?.length > 0) {
            const questionsToInsert = body.questions.map((q, i) => ({
                exam_id: exam.id,
                question_text: q.question_text,
                question_type: q.question_type,
                options: q.options,
                correct_answer: q.correct_answer,
                points: q.points,
                order_index: i,
                attachment_url: q.file_url,
                attachment_name: q.file_url?.split("/").pop() ?? null,
            }));

            const { error: questionsError } = await supabase
                .from("exam_questions")
                .insert(questionsToInsert);

            if (questionsError) throw questionsError;
        }

        return NextResponse.json({ exam });
    } catch (error) {
        console.error("Error creating exam:", error);
        return NextResponse.json(
            { error: "Failed to create exam" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    const supabase = createAdminClient();
    try {
        const body = await req.json();
        const examId = body.id;

        if (!examId) return NextResponse.json({ error: "Missing exam ID" }, { status: 400 });

        const { data: exam, error: examError } = await supabase
            .from("exams")
            .update({
                title: body.title,
                description: body.description,
                duration_minutes: body.duration_minutes,
                start_date: body.start_date,
                end_date: body.end_date,
                status: body.status || "draft",
            })
            .eq("id", examId)
            .select()
            .single();

        if (examError) throw examError;

        if (body.questions?.length > 0) {
            await supabase.from("exam_questions").delete().eq("exam_id", examId);

            const questionsToInsert = body.questions.map((q, i) => ({
                exam_id: examId,
                question_text: q.question_text,
                question_type: q.question_type,
                options: q.options,
                correct_answer: q.correct_answer,
                points: q.points,
                order_index: i,
                attachment_url: q.file_url,
                attachment_name: q.file_url?.split("/").pop() ?? null,
            }));

            const { error: questionsError } = await supabase
                .from("exam_questions")
                .insert(questionsToInsert);

            if (questionsError) throw questionsError;
        }

        return NextResponse.json({ exam });
    } catch (error) {
        console.error("Error updating exam:", error);
        return NextResponse.json(
            { error: "Failed to update exam" },
            { status: 500 }
        );
    }
}
