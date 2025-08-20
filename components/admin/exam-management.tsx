"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Edit } from "lucide-react"

type Exam = {
  id: string
  title: string
  description: string | null
  type: "theoretical" | "practical"
  total_questions: number
  time_limit_minutes: number
  is_active: boolean
}

type Question = {
  id: string
  exam_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  points: number
}

export default function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedExam, setSelectedExam] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [examForm, setExamForm] = useState({
    title: "",
    description: "",
    type: "theoretical" as "theoretical" | "practical",
    time_limit_minutes: 60,
  })

  const [questionForm, setQuestionForm] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A" as "A" | "B" | "C" | "D",
    points: 1,
  })

  useEffect(() => {
    fetchExams()
  }, [])

  useEffect(() => {
    if (selectedExam) {
      fetchQuestions(selectedExam)
    }
  }, [selectedExam])

  const fetchExams = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("exams").select("*").order("created_at", { ascending: false })

    if (data) setExams(data)
  }

  const fetchQuestions = async (examId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("exam_questions")
      .select("*")
      .eq("exam_id", examId)
      .order("created_at", { ascending: true })

    if (data) setQuestions(data)
  }

  const handleCreateExam = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("exams").insert([examForm])

    if (!error) {
      setExamForm({
        title: "",
        description: "",
        type: "theoretical",
        time_limit_minutes: 60,
      })
      fetchExams()
    }
    setIsLoading(false)
  }

  const handleAddQuestion = async () => {
    if (!selectedExam) return

    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("exam_questions").insert([{ ...questionForm, exam_id: selectedExam }])

    if (!error) {
      setQuestionForm({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        points: 1,
      })
      fetchQuestions(selectedExam)

      // Update exam total questions count
      await supabase
        .from("exams")
        .update({ total_questions: questions.length + 1 })
        .eq("id", selectedExam)

      fetchExams()
    }
    setIsLoading(false)
  }

  const handleDeleteQuestion = async (questionId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("exam_questions").delete().eq("id", questionId)

    if (!error) {
      fetchQuestions(selectedExam)

      // Update exam total questions count
      await supabase
        .from("exams")
        .update({ total_questions: Math.max(0, questions.length - 1) })
        .eq("id", selectedExam)

      fetchExams()
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="exams" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exams">Manage Exams</TabsTrigger>
          <TabsTrigger value="questions">Manage Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Exam</CardTitle>
              <CardDescription>Add a new exam for students to take</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exam-title">Exam Title</Label>
                  <Input
                    id="exam-title"
                    value={examForm.title}
                    onChange={(e) => setExamForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Theoretical Exam 1"
                  />
                </div>
                <div>
                  <Label htmlFor="exam-type">Exam Type</Label>
                  <Select
                    value={examForm.type}
                    onValueChange={(value: "theoretical" | "practical") =>
                      setExamForm((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theoretical">Theoretical (MCQ)</SelectItem>
                      <SelectItem value="practical">Practical (Project)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="exam-description">Description</Label>
                <Textarea
                  id="exam-description"
                  value={examForm.description}
                  onChange={(e) => setExamForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the exam content"
                />
              </div>

              <div>
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <Input
                  id="time-limit"
                  type="number"
                  value={examForm.time_limit_minutes}
                  onChange={(e) =>
                    setExamForm((prev) => ({ ...prev, time_limit_minutes: Number.parseInt(e.target.value) }))
                  }
                  min="15"
                  max="180"
                />
              </div>

              <Button onClick={handleCreateExam} disabled={isLoading || !examForm.title}>
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{exam.title}</h4>
                      <p className="text-sm text-gray-600">{exam.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={exam.type === "theoretical" ? "default" : "secondary"}>{exam.type}</Badge>
                        <span className="text-sm text-gray-500">
                          {exam.total_questions} questions • {exam.time_limit_minutes} min
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedExam(exam.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Manage Questions
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Exam to Manage Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams
                    .filter((exam) => exam.type === "theoretical")
                    .map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedExam && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Add New Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="question-text">Question</Label>
                    <Textarea
                      id="question-text"
                      value={questionForm.question_text}
                      onChange={(e) => setQuestionForm((prev) => ({ ...prev, question_text: e.target.value }))}
                      placeholder="Enter your question here..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="option-a">Option A</Label>
                      <Input
                        id="option-a"
                        value={questionForm.option_a}
                        onChange={(e) => setQuestionForm((prev) => ({ ...prev, option_a: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="option-b">Option B</Label>
                      <Input
                        id="option-b"
                        value={questionForm.option_b}
                        onChange={(e) => setQuestionForm((prev) => ({ ...prev, option_b: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="option-c">Option C</Label>
                      <Input
                        id="option-c"
                        value={questionForm.option_c}
                        onChange={(e) => setQuestionForm((prev) => ({ ...prev, option_c: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="option-d">Option D</Label>
                      <Input
                        id="option-d"
                        value={questionForm.option_d}
                        onChange={(e) => setQuestionForm((prev) => ({ ...prev, option_d: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="correct-answer">Correct Answer</Label>
                      <Select
                        value={questionForm.correct_answer}
                        onValueChange={(value: "A" | "B" | "C" | "D") =>
                          setQuestionForm((prev) => ({ ...prev, correct_answer: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="points">Points</Label>
                      <Input
                        id="points"
                        type="number"
                        value={questionForm.points}
                        onChange={(e) =>
                          setQuestionForm((prev) => ({ ...prev, points: Number.parseInt(e.target.value) }))
                        }
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddQuestion}
                    disabled={isLoading || !questionForm.question_text || !questionForm.option_a}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Questions ({questions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">
                              {index + 1}. {question.question_text}
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <span className={question.correct_answer === "A" ? "font-bold text-green-600" : ""}>
                                A. {question.option_a}
                              </span>
                              <span className={question.correct_answer === "B" ? "font-bold text-green-600" : ""}>
                                B. {question.option_b}
                              </span>
                              <span className={question.correct_answer === "C" ? "font-bold text-green-600" : ""}>
                                C. {question.option_c}
                              </span>
                              <span className={question.correct_answer === "D" ? "font-bold text-green-600" : ""}>
                                D. {question.option_d}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              Correct Answer: {question.correct_answer} • Points: {question.points}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
