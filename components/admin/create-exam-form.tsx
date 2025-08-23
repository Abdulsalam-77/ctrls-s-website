"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2 } from "lucide-react"

interface Question {
  id: string
  question_text: string
  question_type: "multiple_choice" | "true_false" | "short_answer" | "essay"
  options: string[]
  correct_answer: string
  points: number
  order_index: number
}

interface ExamForm {
  title: string
  description: string
  duration_minutes: number
  start_date: string
  end_date: string
  status: "draft" | "active" | "inactive"
}

export default function CreateExamForm() {
  const [examForm, setExamForm] = useState<ExamForm>({
    title: "",
    description: "",
    duration_minutes: 60,
    start_date: "",
    end_date: "",
    status: "draft",
  })

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const addQuestion = (type: Question["question_type"]) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      question_text: "",
      question_type: type,
      options: type === "multiple_choice" ? ["", "", "", ""] : type === "true_false" ? ["True", "False"] : [],
      correct_answer: "",
      points: 1,
      order_index: questions.length,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (question) {
      const newOptions = [...question.options]
      newOptions[optionIndex] = value
      updateQuestion(questionId, { options: newOptions })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Create exam
      const { data: exam, error: examError } = await supabase.from("exams").insert([examForm]).select().single()

      if (examError) throw examError

      // Create questions
      if (questions.length > 0) {
        const questionsToInsert = questions.map((q) => ({
          exam_id: exam.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          correct_answer: q.correct_answer,
          points: q.points,
          order_index: q.order_index,
        }))

        const { error: questionsError } = await supabase.from("exam_questions").insert(questionsToInsert)

        if (questionsError) throw questionsError
      }

      toast({
        title: "Success",
        description: "Exam created successfully",
      })

      // Reset form
      setExamForm({
        title: "",
        description: "",
        duration_minutes: 60,
        start_date: "",
        end_date: "",
        status: "draft",
      })
      setQuestions([])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Exam</CardTitle>
          <CardDescription>Set up a new exam with questions and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Exam Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input
                  id="title"
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={examForm.duration_minutes}
                  onChange={(e) => setExamForm({ ...examForm, duration_minutes: Number.parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={examForm.description}
                onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={examForm.start_date}
                  onChange={(e) => setExamForm({ ...examForm, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={examForm.end_date}
                  onChange={(e) => setExamForm({ ...examForm, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={examForm.status === "active"}
                onCheckedChange={(checked) => setExamForm({ ...examForm, status: checked ? "active" : "draft" })}
              />
              <Label htmlFor="active">Make exam active immediately</Label>
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions</h3>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => addQuestion("multiple_choice")}>
                    <Plus className="w-4 h-4 mr-1" />
                    MCQ
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addQuestion("true_false")}>
                    <Plus className="w-4 h-4 mr-1" />
                    True/False
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addQuestion("short_answer")}>
                    <Plus className="w-4 h-4 mr-1" />
                    Short Answer
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addQuestion("essay")}>
                    <Plus className="w-4 h-4 mr-1" />
                    Essay
                  </Button>
                </div>
              </div>

              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Question {index + 1}</CardTitle>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(question.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.question_text}
                        onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })}
                        placeholder="Enter your question..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Question Type</Label>
                        <Select
                          value={question.question_type}
                          onValueChange={(value) =>
                            updateQuestion(question.id, { question_type: value as Question["question_type"] })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="true_false">True/False</SelectItem>
                            <SelectItem value="short_answer">Short Answer</SelectItem>
                            <SelectItem value="essay">Essay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Points</Label>
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, { points: Number.parseInt(e.target.value) })}
                          min="1"
                        />
                      </div>
                    </div>

                    {/* Options for MCQ and True/False */}
                    {(question.question_type === "multiple_choice" || question.question_type === "true_false") && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              disabled={question.question_type === "true_false"}
                            />
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correct_answer === option}
                              onChange={() => updateQuestion(question.id, { correct_answer: option })}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Correct Answer for Short Answer */}
                    {question.question_type === "short_answer" && (
                      <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        <Input
                          value={question.correct_answer}
                          onChange={(e) => updateQuestion(question.id, { correct_answer: e.target.value })}
                          placeholder="Enter the correct answer..."
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating Exam..." : "Create Exam"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
