"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Eye } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface Grade {
  id: string
  total_score: number
  max_score: number
  end_time: string
  exams: {
    id: string
    title: string
    allow_review: boolean
    show_results: boolean
  }
}

export default function RecentGrades() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    try {
      const response = await fetch("/api/grades")
      if (!response.ok) throw new Error("Failed to fetch grades")

      const { grades } = await response.json()
      setGrades(grades)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load grades. Please refresh the page.",
        variant: "destructive",
      })
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Recent Grades
          </CardTitle>
          <CardDescription>Your completed exam results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Recent Grades
        </CardTitle>
        <CardDescription>Your completed exam results</CardDescription>
      </CardHeader>
      <CardContent>
        {grades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No completed exams yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {grades.map((grade) => {
              const percentage = getScorePercentage(grade.total_score, grade.max_score)
              const letterGrade = getScoreGrade(percentage)
              const colorClass = getScoreColor(percentage)

              return (
                <Card key={grade.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{grade.exams.title}</CardTitle>
                        <CardDescription className="mt-1">
                          Completed on {new Date(grade.end_time).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${colorClass}`}>{letterGrade}</div>
                        <div className="text-sm text-muted-foreground">{percentage}%</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Score</span>
                          <span>
                            {grade.total_score} / {grade.max_score}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant={percentage >= 70 ? "default" : "destructive"}>
                          {percentage >= 70 ? "Passed" : "Failed"}
                        </Badge>
                        {grade.exams.allow_review && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/student/review/${grade.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
