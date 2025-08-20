"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"

export type Exam = {
  id: string
  title: string
  description: string | null
  type: "theoretical" | "practical"
  total_questions: number
  time_limit_minutes: number
  is_active: boolean
  created_at: string
}

export type ExamAttempt = {
  id: string
  score: number
  total_questions: number
  percentage: number
  completed_at: string
}

interface ExamCardProps {
  exam: Exam
  attempt?: ExamAttempt
}

export default function ExamCard({ exam, attempt }: ExamCardProps) {
  const isCompleted = !!attempt
  const isPractical = exam.type === "practical"

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-lg ${isCompleted ? "border-green-200 bg-green-50" : ""}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">{exam.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isPractical ? "secondary" : "default"}>{exam.type}</Badge>
            {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
        </div>
        <CardDescription>{exam.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{exam.time_limit_minutes} minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{exam.total_questions} questions</span>
            </div>
          </div>

          {isCompleted ? (
            <div className="space-y-2">
              <div className="text-sm font-medium text-green-700">
                Completed: {attempt.score}/{attempt.total_questions} ({attempt.percentage.toFixed(1)}%)
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${attempt.percentage}%` }}
                />
              </div>
            </div>
          ) : (
            <Link href={`/dashboard/student/exam/${exam.id}`}>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                {isPractical ? "Start Practical Exam" : "Start MCQ Exam"}
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
