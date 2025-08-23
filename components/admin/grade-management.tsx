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
  student_email: string
  answers: any
  score: number | null
  submitted_at: string
  time_taken: number
  graded: boolean
}

export default function GradeManagement() {
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<string>("")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [feedback, setFeedback] = useState("")
  const [manualScore, setManualScore] = useState<number>(0)
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
    const supabase = createClient()

    const { data, error } = await supabase
      .from("exam_submissions")
      .select(`
        *,
        profiles!exam_submissions_student_id_fkey(email)
      `)
      .eq("exam_id", examId)
      .order("submitted_at", { ascending: false })

    if (!error && data) {
      const submissionsWithEmail = data.map((sub) => ({
        ...sub,
        student_email: sub.profiles?.email || "Unknown",
        graded: sub.score !== null,
      }))
      setSubmissions(submissionsWithEmail)
    }
    setLoading(false)
  }

  const openGradingDialog = (submission: Submission) => {
    setSelectedSubmission(submission)
    setManualScore(submission.score || 0)
    setFeedback("")
  }

  const submitGrade = async () => {
    if (!selectedSubmission) return

    const supabase = createClient()
    const { error } = await supabase
      .from("exam_submissions")
      .update({
        score: manualScore,
        feedback: feedback,
      })
      .eq("id", selectedSubmission.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save grade",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Grade saved successfully",
      })
      fetchSubmissions(selectedExam)
      setSelectedSubmission(null)
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
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
                          <TableCell>{submission.student_email}</TableCell>
                          <TableCell>{new Date(submission.submitted_at).toLocaleString()}</TableCell>
                          <TableCell>{formatTime(submission.time_taken)}</TableCell>
                          <TableCell>{submission.score !== null ? `${submission.score}%` : "-"}</TableCell>
                          <TableCell>
                            <Badge variant={submission.graded ? "default" : "secondary"}>
                              {submission.graded ? "Graded" : "Pending"}
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
                                    Review and grade {submission.student_email}'s submission
                                  </DialogDescription>
                                </DialogHeader>

                                {selectedSubmission && (
                                  <div className="space-y-6">
                                    {/* Submission Details */}
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                      <div>
                                        <p className="font-medium">Student:</p>
                                        <p>{selectedSubmission.student_email}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium">Submitted:</p>
                                        <p>{new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium">Time Taken:</p>
                                        <p>{formatTime(selectedSubmission.time_taken)}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium">Current Score:</p>
                                        <p>
                                          {selectedSubmission.score !== null
                                            ? `${selectedSubmission.score}%`
                                            : "Not graded"}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Answers Review */}
                                    <div className="space-y-4">
                                      <h4 className="font-semibold">Student Answers</h4>
                                      <div className="p-4 border rounded-lg">
                                        <pre className="whitespace-pre-wrap text-sm">
                                          {JSON.stringify(selectedSubmission.answers, null, 2)}
                                        </pre>
                                      </div>
                                    </div>

                                    {/* Grading Section */}
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="score">Score (%)</Label>
                                        <Input
                                          id="score"
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={manualScore}
                                          onChange={(e) => setManualScore(Number.parseInt(e.target.value) || 0)}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="feedback">Feedback (Optional)</Label>
                                        <Textarea
                                          id="feedback"
                                          value={feedback}
                                          onChange={(e) => setFeedback(e.target.value)}
                                          placeholder="Provide feedback for the student..."
                                          rows={4}
                                        />
                                      </div>

                                      <Button onClick={submitGrade} className="w-full">
                                        Save Grade
                                      </Button>
                                    </div>
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
