"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, ChevronLeft, ChevronRight, Upload, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { put } from "@vercel/blob"

interface Question {
  id: string
  question_text: string
  question_type: "mcq" | "true_false" | "short_answer" | "essay" | "file_upload"
  options: Record<string, string>
  points: number
  file_url?: string
}

interface Exam {
  id: string
  title: string
  description: string
  duration_minutes: number
  questions: Question[]
}

interface Answer {
  questionId: string
  answer: string
  fileUrl?: string
}

export default function ExamPage({ params }: { params: { examId: string } }) {
  const [exam, setExam] = useState<Exam | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Auto-save answers every 30 seconds
  const autoSave = useCallback(async () => {
    if (!submissionId || Object.keys(answers).length === 0) return

    try {
      const supabase = createClient()
      const answersArray = Object.values(answers)

      for (const answer of answersArray) {
        await supabase.from("answers").upsert({
          submission_id: submissionId,
          question_id: answer.questionId,
          student_answer: answer.answer,
          student_file_url: answer.fileUrl,
        })
      }
    } catch (error) {
      console.error("Auto-save failed:", error)
    }
  }, [submissionId, answers])

  useEffect(() => {
    fetchExamData()
  }, [params.examId])

  useEffect(() => {
    const interval = setInterval(autoSave, 30000) // Auto-save every 30 seconds
    return () => clearInterval(interval)
  }, [autoSave])

  useEffect(() => {
    if (timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit(true) // Auto-submit when time runs out
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const fetchExamData = async () => {
    try {
      const supabase = createClient()

      // Get exam details with questions
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select(`
          *,
          questions (*)
        `)
        .eq("id", params.examId)
        .single()

      if (examError) throw examError

      setExam({
        ...examData,
        questions: examData.questions.sort((a: any, b: any) => a.order_index - b.order_index),
      })

      // Check for existing submission
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      let { data: submission, error: submissionError } = await supabase
        .from("submissions")
        .select("*")
        .eq("exam_id", params.examId)
        .eq("student_id", user.id)
        .single()

      if (submissionError && submissionError.code !== "PGRST116") {
        throw submissionError
      }

      if (!submission) {
        // Create new submission
        const { data: newSubmission, error: createError } = await supabase
          .from("submissions")
          .insert({
            exam_id: params.examId,
            student_id: user.id,
            status: "in_progress",
          })
          .select()
          .single()

        if (createError) throw createError
        submission = newSubmission
      }

      setSubmissionId(submission.id)

      // Calculate time remaining
      const startTime = new Date(submission.start_time)
      const now = new Date()
      const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60))
      const remainingMinutes = Math.max(0, examData.duration_minutes - elapsedMinutes)
      setTimeRemaining(remainingMinutes * 60) // Convert to seconds

      // Load existing answers
      const { data: existingAnswers } = await supabase.from("answers").select("*").eq("submission_id", submission.id)

      if (existingAnswers) {
        const answersMap: Record<string, Answer> = {}
        existingAnswers.forEach((answer) => {
          answersMap[answer.question_id] = {
            questionId: answer.question_id,
            answer: answer.student_answer || "",
            fileUrl: answer.student_file_url,
          }
        })
        setAnswers(answersMap)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exam",
        variant: "destructive",
      })
      router.push("/dashboard/student")
    } finally {
      setLoading(false)
    }
  }

  const updateAnswer = (questionId: string, answer: string, fileUrl?: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
        fileUrl: fileUrl || prev[questionId]?.fileUrl,
      },
    }))
  }

  const handleFileUpload = async (questionId: string, file: File) => {
    setUploadingFile(true)
    try {
      const blob = await put(`student-answers/${Date.now()}-${file.name}`, file, {
        access: "public",
      })

      updateAnswer(questionId, answers[questionId]?.answer || "", blob.url)

      toast({
        title: "Success",
        description: "File uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/submit-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: params.examId,
          answers: Object.values(answers),
        }),
      })

      if (!response.ok) throw new Error("Failed to submit exam")

      toast({
        title: "Success",
        description: autoSubmit ? "Exam auto-submitted due to time limit" : "Exam submitted successfully",
      })

      router.push("/dashboard/student")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit exam",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading exam...</div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Exam not found</div>
      </div>
    )
  }

  const currentQuestion = exam.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <div className="flex items-center gap-4">
            <Badge variant={timeRemaining > 300 ? "default" : "destructive"} className="text-lg px-3 py-1">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timeRemaining)}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>
            Question {currentQuestionIndex + 1} of {exam.questions.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Question {currentQuestionIndex + 1}</span>
            <Badge variant="outline">
              {currentQuestion.points} point{currentQuestion.points !== 1 ? "s" : ""}
            </Badge>
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">{currentQuestion.question_text}</CardDescription>
          {currentQuestion.file_url && (
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={() => window.open(currentQuestion.file_url, "_blank")}>
                View Attachment
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* MCQ Questions */}
          {currentQuestion.question_type === "mcq" && (
            <div className="space-y-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={`option-${key}`}
                    name={`question-${currentQuestion.id}`}
                    value={key}
                    checked={answers[currentQuestion.id]?.answer === key}
                    onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer">
                    <span className="font-medium mr-2">{key}.</span>
                    {value}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {/* True/False Questions */}
          {currentQuestion.question_type === "true_false" && (
            <div className="space-y-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={`option-${key}`}
                    name={`question-${currentQuestion.id}`}
                    value={key}
                    checked={answers[currentQuestion.id]?.answer === key}
                    onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer">
                    {value}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {/* Short Answer Questions */}
          {currentQuestion.question_type === "short_answer" && (
            <div className="space-y-2">
              <Label>Your Answer</Label>
              <Input
                value={answers[currentQuestion.id]?.answer || ""}
                onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                placeholder="Enter your answer..."
              />
            </div>
          )}

          {/* Essay Questions */}
          {currentQuestion.question_type === "essay" && (
            <div className="space-y-2">
              <Label>Your Answer</Label>
              <Textarea
                value={answers[currentQuestion.id]?.answer || ""}
                onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                placeholder="Write your essay here..."
                rows={8}
              />
            </div>
          )}

          {/* File Upload Questions */}
          {currentQuestion.question_type === "file_upload" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Your Answer</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFileUpload(currentQuestion.id, file)
                        }
                      }}
                      disabled={uploadingFile}
                      className="max-w-xs mx-auto"
                    />
                    {uploadingFile && <div className="mt-2 text-sm text-muted-foreground">Uploading...</div>}
                    {answers[currentQuestion.id]?.fileUrl && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(answers[currentQuestion.id].fileUrl, "_blank")}
                        >
                          View Uploaded File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Additional Comments (Optional)</Label>
                <Textarea
                  value={answers[currentQuestion.id]?.answer || ""}
                  onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Add any comments about your submission..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {timeRemaining <= 300 && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Less than 5 minutes remaining!
            </div>
          )}
        </div>

        {currentQuestionIndex === exam.questions.length - 1 ? (
          <Button onClick={() => handleSubmit()} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Exam"}
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestionIndex(Math.min(exam.questions.length - 1, currentQuestionIndex + 1))}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
