"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import ExamItem from "./ExamItem"

interface Exam {
  id: string
  title: string
  description: string
  status: "draft" | "active" | "completed" | "archived"
  start_date: string
  end_date: string
  duration_minutes: number
  created_at: string
  submissions: { count: number }[]
}

interface ExamListProps {
  status: "draft" | "active"
}

export default function ExamList({ status }: ExamListProps) {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchExams()
  }, [status])

  const fetchExams = async () => {
    try {
      const response = await fetch("/admin/exams")
      if (!response.ok) throw new Error("Failed to fetch exams")

      const { exams: examData } = await response.json()
      const filteredExams = examData?.filter((exam: Exam) => exam.status === status) || []
      setExams(filteredExams)
    } catch (error) {
      console.log("[v0] Error fetching exams:", error)
      toast({
        title: "Error",
        description: "Failed to fetch exams. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExamUpdate = () => {
    fetchExams()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (exams.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">No {status} exams found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-primary-purple font-inter">
        {status === "draft" ? "Draft" : "Active"} Exams ({exams.length})
      </h2>
      <div className="grid gap-4">
        {exams.map((exam) => (
          <ExamItem key={exam.id} exam={exam} onUpdate={handleExamUpdate} />
        ))}
      </div>
    </div>
  )
}
