"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Trash2, Edit, Plus, Upload, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@supabase/ssr"
import Image from "next/image"

interface Exam {
  id: string
  title: string
  description: string
  duration_minutes: number
  start_date: string
  end_date: string
  cover_image?: string
}

interface Question {
  id: string
  question_text: string
  question_type: string
  options: any
  correct_answer: string
  points: number
  is_visible: boolean
  attachment_url?: string
  attachment_name?: string
}

export default function EditExamContent({ examId }: { examId: string }) {
  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const { toast } = useToast()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchExamData()
  }, [examId])

  const fetchExamData = async () => {
    try {
      // Fetch exam details
      const { data: examData, error: examError } = await supabase.from("exams").select("*").eq("id", examId).single()

      if (examError) throw examError

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("exam_id", examId)
        .order("order_index")

      if (questionsError) throw questionsError

      setExam(examData)
      setQuestions(questionsData || [])
    } catch (error) {
      console.error("Error fetching exam data:", error)
      toast({
        title: "Error",
        description: "Failed to load exam data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateExamSettings = async (formData: FormData) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from("exams")
        .update({
          title: formData.get("title"),
          description: formData.get("description"),
          duration_minutes: Number.parseInt(formData.get("duration_minutes") as string),
          start_date: formData.get("start_date"),
          end_date: formData.get("end_date"),
          updated_at: new Date().toISOString(),
        })
        .eq("id", examId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Exam settings updated successfully",
      })

      fetchExamData()
    } catch (error) {
      console.error("Error updating exam:", error)
      toast({
        title: "Error",
        description: "Failed to update exam settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleQuestionVisibility = async (questionId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from("exam_questions")
        .update({ is_visible: !currentVisibility })
        .eq("id", questionId)

      if (error) throw error

      setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, is_visible: !currentVisibility } : q)))

      toast({
        title: "Success",
        description: `Question ${!currentVisibility ? "shown" : "hidden"} successfully`,
      })
    } catch (error) {
      console.error("Error toggling question visibility:", error)
      toast({
        title: "Error",
        description: "Failed to update question visibility",
        variant: "destructive",
      })
    }
  }

  const deleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("exam_questions").delete().eq("id", questionId)

      if (error) throw error

      setQuestions((prev) => prev.filter((q) => q.id !== questionId))
      toast({
        title: "Success",
        description: "Question deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting question:", error)
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Exam not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* A) Exam Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Exam Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateExamSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={exam.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  name="duration_minutes"
                  type="number"
                  defaultValue={exam.duration_minutes}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={exam.description || ""} rows={3} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  defaultValue={exam.start_date ? new Date(exam.start_date).toISOString().slice(0, 16) : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  defaultValue={exam.end_date ? new Date(exam.end_date).toISOString().slice(0, 16) : ""}
                />
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Update Exam Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* B) Cover Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Cover Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exam.cover_image ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image src={exam.cover_image || "/placeholder.svg"} alt="Exam cover" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No cover image uploaded</p>
              </div>
            )}
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Change Image
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* C) Question Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Question Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No questions added yet</p>
            ) : (
              questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={question.is_visible}
                            onCheckedChange={() => toggleQuestionVisibility(question.id, question.is_visible)}
                          />
                          {question.is_visible ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-gray-900 mb-2">{question.question_text}</p>
                      <div className="text-sm text-gray-600">
                        <span className="capitalize">{question.question_type.replace("_", " ")}</span>
                        {" • "}
                        <span>
                          {question.points} point{question.points !== 1 ? "s" : ""}
                        </span>
                        {question.attachment_name && (
                          <>
                            {" • "}
                            <span>📎 {question.attachment_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingQuestion(question.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}

            <Button onClick={() => setShowAddQuestion(true)} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add New Question
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
