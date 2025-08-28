"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Clock, FileText } from "lucide-react"

interface Exam {
  id: string
  title: string
  description: string
  duration_minutes: number
  start_date: string
  end_date: string
}

interface Question {
  id: string
  question_text: string
  question_type: "multiple_choice" | "true_false" | "short_answer" | "essay" | "file_upload"
  options: any
  points: number
  attachment_url?: string
  attachment_name?: string
}

interface Answer {
  questionId: string
  answer: string
  file?: File
}

export default function ExamPage({ params }: { params: { id: string } }) {
  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchExamData()
  }, [params.id])

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            submitExam()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeRemaining])

  const fetchExamData = async () => {
    try {
      // Fetch exam details
      const examResponse = await fetch(`/api/student-exam?examId=${params.id}`)
      if (!examResponse.ok) throw new Error("Failed to fetch exam")

      const examData = await examResponse.json()
      setExam(examData.exam)
      setQuestions(examData.questions)

      if (examData.submission) {
        setSubmissionId(examData.submission.id)
        // Calculate remaining time
        const startTime = new Date(examData.submission.start_time).getTime()
        const now = new Date().getTime()
        const elapsed = Math.floor((now - startTime) / 1000)
        const remaining = Math.max(0, examData.exam.duration_minutes * 60 - elapsed)
        setTimeRemaining(remaining)
      } else {
        // Start new submission
        const startResponse = await fetch("/api/student-exam", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ examId: params.id }),
        })

        if (!startResponse.ok) throw new Error("Failed to start exam")

        const startData = await startResponse.json()
        setSubmissionId(startData.submissionId)
        setTimeRemaining(examData.exam.duration_minutes * 60)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exam. Please try again.",
        variant: "destructive",
      })
      router.push("/dashboard/student")
    } finally {
      setLoading(false)
    }
  }

  const updateAnswer = (questionId: string, answer: string, file?: File) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, answer, file },
    }))
  }

  const submitExam = async () => {
    if (submitting) return
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("submissionId", submissionId!)

      // Add answers
      Object.values(answers).forEach((answer, index) => {
        formData.append(`answers[${index}][questionId]`, answer.questionId)
        formData.append(`answers[${index}][answer]`, answer.answer)
        if (answer.file) {
          formData.append(`answers[${index}][file]`, answer.file)
        }
      })

      const response = await fetch("/api/student-exam", {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to submit exam")

      toast({
        title: "Success",
        description: "Exam submitted successfully!",
      })

      router.push("/dashboard/student")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit exam. Please try again.",
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
        <div className="text-center py-8">
          <p>Loading exam...</p>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p>Exam not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{exam.title}</h1>
          <p className="text-gray-600 mt-2">{exam.description}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="w-5 h-5" />
            <span className={timeRemaining < 300 ? "text-red-600" : "text-gray-900"}>{formatTime(timeRemaining)}</span>
          </div>
          <p className="text-sm text-gray-500">Time Remaining</p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="flex items-start gap-2">
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Question {index + 1}</span>
                <span className="flex-1">{question.question_text}</span>
                <span className="text-sm text-gray-500">{question.points} pts</span>
              </CardTitle>
              {question.attachment_url && (
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(question.attachment_url, "_blank")}>
                    <FileText className="w-4 h-4 mr-2" />
                    {question.attachment_name || "View Attachment"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {question.question_type === "multiple_choice" && (
                <RadioGroup
                  value={answers[question.id]?.answer || ""}
                  onValueChange={(value) => updateAnswer(question.id, value)}
                >
                  {question.options?.choices?.map((choice: string, choiceIndex: number) => (
                    <div key={choiceIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={choice} id={`${question.id}-${choiceIndex}`} />
                      <Label htmlFor={`${question.id}-${choiceIndex}`}>{choice}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.question_type === "true_false" && (
                <RadioGroup
                  value={answers[question.id]?.answer || ""}
                  onValueChange={(value) => updateAnswer(question.id, value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id={`${question.id}-true`} />
                    <Label htmlFor={`${question.id}-true`}>True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id={`${question.id}-false`} />
                    <Label htmlFor={`${question.id}-false`}>False</Label>
                  </div>
                </RadioGroup>
              )}

              {question.question_type === "short_answer" && (
                <Input
                  value={answers[question.id]?.answer || ""}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  placeholder="Enter your answer..."
                />
              )}

              {question.question_type === "essay" && (
                <Textarea
                  value={answers[question.id]?.answer || ""}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  placeholder="Write your essay answer..."
                  rows={6}
                />
              )}

              {question.question_type === "file_upload" && (
                <div className="space-y-2">
                  <Input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        updateAnswer(question.id, file.name, file)
                      }
                    }}
                  />
                  {answers[question.id]?.file && (
                    <p className="text-sm text-gray-600">Selected: {answers[question.id].file?.name}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-8 text-center">
        <Button onClick={submitExam} disabled={submitting} size="lg" className="px-8">
          {submitting ? "Submitting..." : "Submit Exam"}
        </Button>
      </div>
    </div>
  )
}
