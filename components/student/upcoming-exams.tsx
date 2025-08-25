"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, FileText } from "lucide-react"
import Link from "next/link"

interface Exam {
  id: string
  title: string
  description: string
  duration_minutes: number
  start_date: string
  end_date: string
  submission?: {
    id: string
    status: string
  }
}

export default function UpcomingExams() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingExams()
  }, [])

  const fetchUpcomingExams = async () => {
    try {
      const response = await fetch("/api/student-exams")
      if (response.ok) {
        const { availableExams } = await response.json()
        setExams(availableExams)
      }
    } catch (error) {
      console.error("Failed to fetch exams:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isExamAvailable = (exam: Exam) => {
    const now = new Date()
    const startDate = new Date(exam.start_date)
    const endDate = new Date(exam.end_date)
    return now >= startDate && now <= endDate
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Upcoming Exams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading exams...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Upcoming Exams
        </CardTitle>
        <CardDescription>Available exams you can take</CardDescription>
      </CardHeader>
      <CardContent>
        {exams.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No exams available at the moment</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Card key={exam.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <CardDescription className="mt-1">{exam.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {exam.submission?.status === "in_progress" && <Badge variant="secondary">In Progress</Badge>}
                      {isExamAvailable(exam) ? (
                        <Badge variant="default">Available</Badge>
                      ) : (
                        <Badge variant="outline">Scheduled</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exam.duration_minutes} minutes
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(exam.start_date)} - {formatDate(exam.end_date)}
                      </div>
                    </div>
                    <div>
                      {exam.submission?.status === "in_progress" ? (
                        <Button asChild>
                          <Link href={`/dashboard/student/exam/${exam.id}`}>Continue Exam</Link>
                        </Button>
                      ) : isExamAvailable(exam) ? (
                        <Button asChild>
                          <Link href={`/dashboard/student/exam/${exam.id}`}>Start Exam</Link>
                        </Button>
                      ) : (
                        <Button disabled>Not Available</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
