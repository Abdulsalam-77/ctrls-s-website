"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface Exam {
  id: string
  title: string
  description: string
  status: "draft" | "active" | "inactive"
  start_date: string
  end_date: string
  duration_minutes: number
  created_at: string
  submission_count?: number
}

interface ExamStats {
  total_exams: number
  active_exams: number
  upcoming_exams: number
  total_submissions: number
}

export default function ExamOverview() {
  const [exams, setExams] = useState<Exam[]>([])
  const [stats, setStats] = useState<ExamStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchExams()
    fetchStats()
  }, [])

  const fetchExams = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("exams")
      .select(`
        *,
        exam_submissions(count)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch exams",
        variant: "destructive",
      })
    } else {
      const examsWithCounts = data.map((exam) => ({
        ...exam,
        submission_count: exam.exam_submissions?.[0]?.count || 0,
      }))
      setExams(examsWithCounts)
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("exam_stats").select("*").single()

    if (!error && data) {
      setStats(data)
    }
  }

  const toggleExamStatus = async (examId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    const supabase = createClient()

    const { error } = await supabase.from("exams").update({ status: newStatus }).eq("id", examId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update exam status",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Exam ${newStatus === "active" ? "enabled" : "disabled"} successfully`,
      })
      fetchExams()
      fetchStats()
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading exams...</div>
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_exams}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active_exams}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.upcoming_exams}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_submissions}</div>
            </CardContent>
          </Card>
        </div>
      )}

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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {exam.title}
                        <Badge variant={exam.status === "active" ? "default" : "secondary"}>{exam.status}</Badge>
                      </CardTitle>
                      <CardDescription>{exam.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={exam.status === "active"}
                        onCheckedChange={() => toggleExamStatus(exam.id, exam.status)}
                      />
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-muted-foreground">{exam.duration_minutes} minutes</p>
                    </div>
                    <div>
                      <p className="font-medium">Start Date</p>
                      <p className="text-muted-foreground">{new Date(exam.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">End Date</p>
                      <p className="text-muted-foreground">{new Date(exam.end_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Submissions</p>
                      <p className="text-muted-foreground">
                        <Button variant="link" className="p-0 h-auto">
                          {exam.submission_count} submissions
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
