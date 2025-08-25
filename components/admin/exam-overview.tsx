"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

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

interface ExamStats {
  totalExams: number
  activeExams: number
  upcomingExams: number
  totalSubmissions: number
}

export default function ExamOverview() {
  const [exams, setExams] = useState<Exam[]>([])
  const [stats, setStats] = useState<ExamStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchExams()
    fetchStats()
  }, [])

  const fetchExams = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("exams")
        .select(`
          *,
          submissions(count)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const examsWithCounts = data.map((exam) => ({
        ...exam,
        submissions: exam.submissions || [{ count: 0 }],
      }))
      setExams(examsWithCounts)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch exams. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/admin/exams/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")
      
      const { stats } = await response.json()
      setStats(stats)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exam statistics",
        variant: "destructive",
      })
    } finally {
      setStatsLoading(false)
    }
  }

  const toggleExamStatus = async (examId: string, currentStatus: string) => {
    setToggleLoading(examId)
    const newStatus = currentStatus === "active" ? "draft" : "active"
    
    try {
      const supabase = createClient()
      const { error } = await supabase.from("exams").update({ status: newStatus }).eq("id", examId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Exam ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      })
      fetchExams()
      fetchStats()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update exam status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setToggleLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Exams List Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExams}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeExams}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Draft Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.upcomingExams}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Exam List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Exams</h2>
        {exams.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No exams created yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Card key={exam.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        {exam.title}
                        <Badge variant={exam.status === "active" ? "default" : "secondary"}>{exam.status}</Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">{exam.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={exam.status === "active"}
                        onCheckedChange={() => toggleExamStatus(exam.id, exam.status)}
                        disabled={toggleLoading === exam.id}
                      />
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-muted-foreground">{exam.duration_minutes} minutes</p>
                    </div>
                    <div>
                      <p className="font-medium">Start Date</p>
                      <p className="text-muted-foreground">
                        {exam.start_date ? new Date(exam.start_date).toLocaleDateString() : "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">End Date</p>
                      <p className="text-muted-foreground">
                        {exam.end_date ? new Date(exam.end_date).toLocaleDateString() : "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Submissions</p>
                      <p className="text-muted-foreground">
                        <Button variant="link" className="p-0 h-auto">
                          {exam.submissions[0]?.count || 0} submissions
                        </Button>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
