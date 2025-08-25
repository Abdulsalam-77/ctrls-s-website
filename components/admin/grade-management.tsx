"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Exam {
  id: string
  title: string
  status: string
}

interface Submission {
  id: string
  student_id: string
  total_score: number
  max_score: number
  status: string
  start_time: string
  end_time: string
  profiles: {
    full_name: string
    email: string
  }
}

interface Answer {
  id: string
  student_answer: string
  student_file_url?: string
  score: number
  feedback?: string
  questions: {
    question_text: string
    question_type: string
    correct_answer: string
    points: number
  }
}

export default function GradeManagement() {
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<string>("")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [grades, setGrades] = useState<Record<string, { score: number; feedback: string }>>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchExams()
  }, [])

  useEffect(() => {
    if (selectedExam) {
      fetchSubmissions(selectedExam)
    }
  }, [selectedExam])

  const fetchExams = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("exams")
      .select("id, title, status")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setExams(data)
    }
  }

  const fetchSubmissions = async (examId: string) => {
    setLoading(true)
    const response = await fetch(`/admin/exams/${examId}/submissions`)
    if (response.ok) {
      const { submissions } = await response.json()
      setSubmissions(submissions)
    }
    setLoading(false)
  }

  const openGradingDialog = async (submission: Submission) => {
    setSelectedSubmission(submission)

    // Fetch answers for this submission
    const supabase = createClient()
    const { data: answersData, error } = await supabase
      .from("answers")
      .select(`
        *,
        questions (
          question_text,
          question_type,
          correct_answer,
          points
        )
      `)
      .eq("submission_id", submission.id)

    if (!error && answersData) {
      setAnswers(answersData)

      // Initialize grades state
      const initialGrades: Record<string, { score: number; feedback: string }> = {}
      answersData.forEach((answer) => {
        initialGrades[answer.id] = {
          score: answer.score || 0,
          feedback: answer.feedback || "",
        }
      })
      setGrades(initialGrades)
    }
  }

  const updateGrade = (answerId: string, field: "score" | "feedback", value: string | number) => {
    setGrades((prev) => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        [field]: value,
      },
    }))
  }

  const submitGrades = async () => {
    if (!selectedSubmission) return

    try {
      const gradesArray = Object.entries(grades).map(([answerId, grade]) => ({
        answerId,
        score: grade.score,
        feedback: grade.feedback,
      }))

      const response = await fetch("/api/grade", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          grades: gradesArray,
        }),
      })

      if (!response.ok) throw new Error("Failed to save grades")

      toast({
        title: "Success",
        description: "Grades saved successfully",
      })

      fetchSubmissions(selectedExam)
      setSelectedSubmission(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save grades",
        variant: "destructive",
      })
    }
  }

  const formatTime = (startTime: string, endTime: string) => {
    if (!endTime) return "In progress"
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grade Management</CardTitle>
          <CardDescription>Review and grade student exam submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exam to grade" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedExam && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Submissions</h3>
                {loading ? (
                  <div className="text-center p-4">Loading submissions...</div>
                ) : submissions.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">No submissions found for this exam.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead>Time Taken</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{submission.profiles?.full_name || "Unknown"}</div>
                              <div className="text-sm text-muted-foreground">{submission.profiles?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {submission.end_time ? new Date(submission.end_time).toLocaleString() : "In progress"}
                          </TableCell>
                          <TableCell>{formatTime(submission.start_time, submission.end_time)}</TableCell>
                          <TableCell>
                            {submission.max_score > 0
                              ? `${submission.total_score}/${submission.max_score} (${Math.round((submission.total_score / submission.max_score) * 100)}%)`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={submission.status === "graded" ? "default" : "secondary"}>
                              {submission.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => openGradingDialog(submission)}>
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Grade Submission</DialogTitle>
                                  <DialogDescription>
                                    Review and grade {submission.profiles?.full_name || "student"}'s submission
                                  </DialogDescription>
                                </DialogHeader>

                                {selectedSubmission && (
                                  <div className="space-y-6">
                                    {/* Submission Details */}
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                      <div>
                                        <p className="font-medium">Student:</p>
                                        <p>{selectedSubmission.profiles?.full_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {selectedSubmission.profiles?.email}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-medium">Submitted:</p>
                                        <p>
                                          {selectedSubmission.end_time
                                            ? new Date(selectedSubmission.end_time).toLocaleString()
                                            : "In progress"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-medium">Time Taken:</p>
                                        <p>{formatTime(selectedSubmission.start_time, selectedSubmission.end_time)}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium">Current Score:</p>
                                        <p>
                                          {selectedSubmission.max_score > 0
                                            ? `${selectedSubmission.total_score}/${selectedSubmission.max_score}`
                                            : "Not graded"}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Answers Review */}
                                    <div className="space-y-4">
                                      <h4 className="font-semibold">Student Answers</h4>
                                      {answers.map((answer, index) => (
                                        <Card key={answer.id}>
                                          <CardHeader>
                                            <CardTitle className="text-base">Question {index + 1}</CardTitle>
                                            <CardDescription>{answer.questions.question_text}</CardDescription>
                                          </CardHeader>
                                          <CardContent className="space-y-4">
                                            <div>
                                              <Label className="font-medium">Student Answer:</Label>
                                              <div className="p-3 bg-muted rounded-lg mt-1">
                                                {answer.student_answer || "No answer provided"}
                                              </div>
                                              {answer.student_file_url && (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="mt-2 bg-transparent"
                                                  onClick={() => window.open(answer.student_file_url, "_blank")}
                                                >
                                                  View Uploaded File
                                                </Button>
                                              )}
                                            </div>

                                            {answer.questions.correct_answer && (
                                              <div>
                                                <Label className="font-medium">Correct Answer:</Label>
                                                <div className="p-3 bg-green-50 rounded-lg mt-1">
                                                  {answer.questions.correct_answer}
                                                </div>
                                              </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                <Label>Score (out of {answer.questions.points})</Label>
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  max={answer.questions.points}
                                                  value={grades[answer.id]?.score || 0}
                                                  onChange={(e) =>
                                                    updateGrade(answer.id, "score", Number(e.target.value))
                                                  }
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label>Feedback</Label>
                                                <Textarea
                                                  value={grades[answer.id]?.feedback || ""}
                                                  onChange={(e) => updateGrade(answer.id, "feedback", e.target.value)}
                                                  placeholder="Provide feedback..."
                                                  rows={2}
                                                />
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>

                                    <Button onClick={submitGrades} className="w-full">
                                      Save All Grades
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
