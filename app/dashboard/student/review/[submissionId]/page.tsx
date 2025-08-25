"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, XCircle, Trophy, FileText, Eye } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  question_text: string
  question_type: "mcq" | "true_false" | "short_answer" | "essay" | "file_upload"
  options: Record<string, string>
  correct_answer: string
  points: number
  file_url?: string
}

interface Answer {
  id: string
  student_answer: string
  student_file_url?: string
  score: number
  feedback?: string
  is_correct?: boolean
  questions: Question
}

interface Submission {
  id: string
  total_score: number
  max_score: number
  start_time: string
  end_time: string
  status: string
}

interface Exam {
  id: string
  title: string
  description: string
  allow_review: boolean
  show_results: boolean
}

interface ReviewData {
  submission: Submission
  answers: Answer[]
  exam: Exam
}

export default function ExamReviewPage({ params }: { params: { submissionId: string } }) {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchReviewData()
  }, [params.submissionId])

  const fetchReviewData = async () => {
    try {
      const response = await fetch(`/api/review/${params.submissionId}`)

      if (!response.ok) {
        if (response.status === 403) {
          setError("Review not allowed for this exam")
        } else {
          setError("Failed to load review data")
        }
        return
      }

      const data = await response.json()
      setReviewData(data)
    } catch (error) {
      setError("Failed to load review data")
    } finally {
      setLoading(false)
    }
  }

  const getScorePercentage = (score: number, maxScore: number) => {
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreGrade = (percentage: number) => {
    if (percentage >= 90) return "A"
    if (percentage >= 80) return "B"
    if (percentage >= 70) return "C"
    if (percentage >= 60) return "D"
    return "F"
  }

  const formatTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const renderQuestionAnswer = (answer: Answer) => {
    const question = answer.questions

    switch (question.question_type) {
      case "mcq":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Options:</h5>
              {Object.entries(question.options).map(([key, value]) => {
                const isStudentAnswer = answer.student_answer === key
                const isCorrectAnswer = question.correct_answer === key

                return (
                  <div
                    key={key}
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      isCorrectAnswer
                        ? "bg-green-50 border border-green-200"
                        : isStudentAnswer && !isCorrectAnswer
                          ? "bg-red-50 border border-red-200"
                          : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {isCorrectAnswer && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {isStudentAnswer && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-600" />}
                      <span className="font-medium">{key}.</span>
                    </div>
                    <span className="flex-1">{value}</span>
                    {isStudentAnswer && (
                      <Badge variant={isCorrectAnswer ? "default" : "destructive"} className="px-2 py-1 text-xs">
                        Your Answer
                      </Badge>
                    )}
                    {isCorrectAnswer && !isStudentAnswer && (
                      <Badge variant="outline" className="px-2 py-1 text-xs">
                        Correct Answer
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )

      case "true_false":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              {Object.entries(question.options).map(([key, value]) => {
                const isStudentAnswer = answer.student_answer === key
                const isCorrectAnswer = question.correct_answer === key

                return (
                  <div
                    key={key}
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      isCorrectAnswer
                        ? "bg-green-50 border border-green-200"
                        : isStudentAnswer && !isCorrectAnswer
                          ? "bg-red-50 border border-red-200"
                          : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {isCorrectAnswer && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {isStudentAnswer && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-600" />}
                    </div>
                    <span className="flex-1">{value}</span>
                    {isStudentAnswer && (
                      <Badge variant={isCorrectAnswer ? "default" : "destructive"} className="px-2 py-1 text-xs">
                        Your Answer
                      </Badge>
                    )}
                    {isCorrectAnswer && !isStudentAnswer && (
                      <Badge variant="outline" className="px-2 py-1 text-xs">
                        Correct Answer
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )

      case "short_answer":
        return (
          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-sm mb-2">Your Answer:</h5>
              <div className="p-3 bg-gray-50 rounded-lg">{answer.student_answer || "No answer provided"}</div>
            </div>
            {question.correct_answer && (
              <div>
                <h5 className="font-medium text-sm mb-2">Sample Answer:</h5>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">{question.correct_answer}</div>
              </div>
            )}
          </div>
        )

      case "essay":
        return (
          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-sm mb-2">Your Answer:</h5>
              <div className="p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{answer.student_answer || "No answer provided"}</pre>
              </div>
            </div>
          </div>
        )

      case "file_upload":
        return (
          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-sm mb-2">Your Submission:</h5>
              <div className="space-y-2">
                {answer.student_file_url && (
                  <Button variant="outline" size="sm" onClick={() => window.open(answer.student_file_url, "_blank")}>
                    <FileText className="w-4 h-4 mr-1" />
                    View Uploaded File
                  </Button>
                )}
                {answer.student_answer && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h6 className="font-medium text-xs mb-1">Comments:</h6>
                    <p className="text-sm">{answer.student_answer}</p>
                  </div>
                )}
                {!answer.student_file_url && !answer.student_answer && (
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-muted-foreground">No submission provided</div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading exam review...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Review</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/dashboard/student">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!reviewData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Review data not found</div>
      </div>
    )
  }

  const { submission, answers, exam } = reviewData
  const percentage = getScorePercentage(submission.total_score, submission.max_score)
  const letterGrade = getScoreGrade(percentage)
  const colorClass = getScoreColor(percentage)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/student">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <p className="text-muted-foreground">{exam.description}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${colorClass}`}>{letterGrade}</div>
            <div className="text-sm text-muted-foreground">{percentage}%</div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Exam Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{submission.total_score}</div>
              <div className="text-sm text-muted-foreground">Points Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{submission.max_score}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{answers.length}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(submission.start_time, submission.end_time)}</div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Score</span>
              <span>
                {submission.total_score} / {submission.max_score}
              </span>
            </div>
            <Progress value={percentage} className="h-3" />
            <div className="flex justify-between items-center">
              <Badge variant={percentage >= 70 ? "default" : "destructive"}>
                {percentage >= 70 ? "Passed" : "Failed"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Completed on {new Date(submission.end_time).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Review */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Question Review</h2>

        {answers.map((answer, index) => {
          const question = answer.questions
          const isCorrect = answer.is_correct || answer.score === question.points

          return (
            <Card key={answer.id} className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      Question {index + 1}
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1 text-base leading-relaxed">
                      {question.question_text}
                    </CardDescription>
                    {question.file_url && (
                      <div className="mt-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(question.file_url, "_blank")}>
                          <Eye className="w-4 h-4 mr-1" />
                          View Question Attachment
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold">
                      {answer.score} / {question.points}
                    </div>
                    <div className="text-sm text-muted-foreground">points</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderQuestionAnswer(answer)}

                {answer.feedback && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Instructor Feedback:</h5>
                    <p className="text-sm">{answer.feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <Button asChild>
          <Link href="/dashboard/student">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
