"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, X, GripVertical, Upload, FileText } from "lucide-react";

// --- Type Definitions ---
interface Question {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  options: string[];
  correct_answer: string;
  points: number;
  order_index: number;
  attachment_url?: string;
  attachment_name?: string;
  is_visible: boolean;
}

interface ExamForm {
  title: string;
  description: string;
  duration_minutes: number;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "inactive";
}

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const { toast } = useToast();

  const [examForm, setExamForm] = useState<ExamForm | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Data Fetching ---
  useEffect(() => {
    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  const fetchExamData = async () => {
    setLoading(true);
    const supabase = createClient();
    
    const { data: examData, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();

    if (examError || !examData) {
      toast({ title: "Error", description: "Could not fetch exam details.", variant: "destructive" });
      router.push("/dashboard/admin");
      return;
    }

    setExamForm({
        title: examData.title,
        description: examData.description || "",
        duration_minutes: examData.duration_minutes,
        start_date: examData.start_date ? new Date(examData.start_date).toISOString().slice(0, 16) : "",
        end_date: examData.end_date ? new Date(examData.end_date).toISOString().slice(0, 16) : "",
        status: examData.status,
    });

    const { data: questionsData, error: questionsError } = await supabase
      .from("exam_questions")
      .select("*")
      .eq("exam_id", examId)
      .order("order_index", { ascending: true });

    if (questionsError) {
      toast({ title: "Error", description: "Could not fetch questions.", variant: "destructive" });
    } else {
      setQuestions(questionsData.map(q => ({...q, id: q.id.toString() })));
    }

    setLoading(false);
  };

  // --- Question Management ---
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `new-${Math.random()}`, // Temporary ID for new questions
      question_text: "",
      question_type: "multiple_choice",
      options: ["", ""],
      correct_answer: "",
      points: 1,
      order_index: questions.length,
      is_visible: true,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, ...updates } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // --- Form Submission ---
  const handleSaveChanges = async () => {
    if (!examForm) return;
    setLoading(true);
    const supabase = createClient();

    // 1. Update Exam Details
    const { error: examUpdateError } = await supabase
      .from("exams")
      .update(examForm)
      .eq("id", examId);

    if (examUpdateError) {
      toast({ title: "Error", description: "Failed to update exam settings.", variant: "destructive" });
      setLoading(false);
      return;
    }
    
    // 2. Update, Add, and Delete Questions
    const upsertPromises = questions.map(q => {
        const { id, ...questionData } = q;
        return supabase.from("exam_questions").upsert({
            ...(id.startsWith("new-") ? {} : { id }), // Only include id if it's not a new question
            exam_id: examId,
            ...questionData
        });
    });

    const questionIdsToKeep = questions.map(q => q.id).filter(id => !id.startsWith("new-"));
    const deletePromise = supabase
        .from("exam_questions")
        .delete()
        .eq("exam_id", examId)
        .not("id", "in", `(${questionIdsToKeep.join(",")})`);

    const results = await Promise.all([...upsertPromises, deletePromise]);
    const errors = results.map(r => r.error).filter(Boolean);

    if (errors.length > 0) {
        toast({ title: "Error", description: "Some questions could not be saved.", variant: "destructive" });
    } else {
        toast({ title: "Success!", description: "Exam updated successfully." });
        router.push("/dashboard/admin"); // Or refresh data
    }

    setLoading(false);
  };
  
  if (loading || !examForm) {
      return <div>Loading...</div>; // Add a proper skeleton loader here
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Exam</CardTitle>
          <CardDescription>Update exam details, manage questions, and change settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            {/* Exam Settings Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Exam Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Exam Title</Label>
                        <Input id="title" value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input id="duration" type="number" value={examForm.duration_minutes} onChange={(e) => setExamForm({ ...examForm, duration_minutes: parseInt(e.target.value) || 60 })} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={examForm.description} onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input id="start_date" type="datetime-local" value={examForm.start_date} onChange={(e) => setExamForm({ ...examForm, start_date: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input id="end_date" type="datetime-local" value={examForm.end_date} onChange={(e) => setExamForm({ ...examForm, end_date: e.target.value })} />
                    </div>
                </div>
            </div>

            {/* Question Manager Section */}
            <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Question Manager</h3>
                    <Button onClick={addQuestion}><Plus className="mr-2 h-4 w-4" /> Add Question</Button>
                </div>
                <div className="space-y-4">
                    {questions.map((q, index) => (
                        <Card key={q.id}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Question {index + 1}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor={`visible-${q.id}`} className="text-sm">Visible</Label>
                                    <Switch id={`visible-${q.id}`} checked={q.is_visible} onCheckedChange={(checked) => updateQuestion(q.id, { is_visible: checked })} />
                                    <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea placeholder="Question text..." value={q.question_text} onChange={(e) => updateQuestion(q.id, { question_text: e.target.value })} />
                                {/* Add inputs for options, correct answer, etc. based on question_type */}
                                {/* This part can be complex and might need its own sub-component */}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Button onClick={handleSaveChanges} disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Changes"}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}