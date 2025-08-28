"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Edit, Power, PowerOff, BarChart3 } from "lucide-react"

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
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const draftExams = exams.filter((exam) => exam.status === "draft")
  const activeExams = exams.filter((exam) => exam.status === "active")

  useEffect(() => {
    fetchExams()
    fetchStats()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await fetch("/admin/exams")
      if (!response.ok) throw new Error("Failed to fetch exams")

      const { exams: examData } = await response.json()
      setExams(examData || [])
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

  const toggleExamStatus = async (examId: string, currentStatus: string, actionType: "activate" | "deactivate") => {
    setToggleLoading(examId)
    const newStatus = currentStatus === "active" ? "draft" : "active"

    try {
      const exam = exams.find((e) => e.id === examId)
      if (!exam) {
        throw new Error("Exam not found")
      }

      if (newStatus === "active") {
        // Validation for activation
        if (!exam.start_date || !exam.end_date) {
          toast({
            title: "Cannot Activate Exam",
            description: "Exam must have start and end dates before activation",
            variant: "destructive",
          })
          return
        }

        if (new Date(exam.start_date) >= new Date(exam.end_date)) {
          toast({
            title: "Cannot Activate Exam",
            description: "End date must be after start date",
            variant: "destructive",
          })
          return
        }

        const supabase = createClient()
        const { data: questions, error: questionsError } = await supabase
          .from("exam_questions")
          .select("id")
          .eq("exam_id", examId)
          .limit(1)

        if (questionsError) {
          console.log("[v0] Error checking questions:", questionsError)
          toast({
            title: "Error",
            description: "Failed to validate exam questions",
            variant: "destructive",
          })
          return
        }

        if (!questions || questions.length === 0) {
          toast({
            title: "Cannot Activate Exam",
            description: "Exam must have at least one question before activation",
            variant: "destructive",
          })
          return
        }
      }

      const response = await fetch(`/admin/exams/${examId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: exam.title,
          description: exam.description,
          status: newStatus,
          duration_minutes: exam.duration_minutes,
          start_date: exam.start_date,
          end_date: exam.end_date,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update exam status")
      }

      if (newStatus === "active") {
        toast({
          title: "Success!",
          description: "Exam has been activated! ✅",
        })
      } else {
        toast({
          title: "Success!",
          description: "Exam has been deactivated and returned to drafts. 📝",
        })
      }

      await Promise.all([fetchExams(), fetchStats()])
    } catch (error) {
      console.log("[v0] Error toggling exam status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update exam status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setToggleLoading(null)
    }
  }

  const deleteExam = async (examId: string) => {
    setDeleteLoading(examId)

    try {
      const response = await fetch(`/admin/exams/${examId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete exam")
      }

      toast({
        title: "Success!",
        description: "Exam deleted successfully",
      })

      await Promise.all([fetchExams(), fetchStats()])
    } catch (error) {
      console.log("[v0] Error deleting exam:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete exam. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleEditExam = (examId: string) => {
    router.push(`/dashboard/admin/exam/edit/${examId}`)
  }

  const ExamCard = ({
    exam,
    showActivateButton = false,
    showDeactivateButton = false,
    showViewResults = false,
  }: {
    exam: Exam
    showActivateButton?: boolean
    showDeactivateButton?: boolean
    showViewResults?: boolean
  }) => (
    <Card key={exam.id} className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 flex-wrap font-inter text-xl font-bold text-primary-purple">
              {exam.title}
              <Badge
                variant={exam.status === "active" ? "default" : "secondary"}
                className={exam.status === "active" ? "bg-accent-teal text-white" : "bg-gray-100 text-gray-700"}
              >
                {exam.status}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1 text-gray-600">{exam.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {showActivateButton && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={toggleLoading === exam.id}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 font-medium"
                  >
                    <Power className="w-4 h-4 mr-1" />
                    Activate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-inter text-xl font-bold text-primary-purple">
                      Activate Exam
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                      Are you sure you want to make this exam live for students?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="font-medium">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => toggleExamStatus(exam.id, exam.status, "activate")}
                      className="bg-accent-teal hover:bg-primary-purple font-medium"
                    >
                      Activate Exam
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {showDeactivateButton && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={toggleLoading === exam.id}
                    className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 font-medium"
                  >
                    <PowerOff className="w-4 h-4 mr-1" />
                    Deactivate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-inter text-xl font-bold text-primary-purple">
                      Deactivate Exam
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                      Are you sure you want to deactivate this exam? Students will no longer be able to take it.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="font-medium">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => toggleExamStatus(exam.id, exam.status, "deactivate")}
                      className="bg-red-600 hover:bg-red-700 font-medium"
                    >
                      Deactivate Exam
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {showViewResults && (
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 font-medium"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                View Results
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditExam(exam.id)}
              className="font-medium hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>

            {exam.status === "draft" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deleteLoading === exam.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-inter text-xl font-bold text-primary-purple">
                      Delete Exam Draft
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                      Are you sure you want to permanently delete this exam draft? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="font-medium">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteExam(exam.id)}
                      className="bg-red-600 hover:bg-red-700 font-medium"
                    >
                      Delete Exam
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Duration</p>
            <p className="text-gray-600">{exam.duration_minutes} minutes</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Start Date</p>
            <p className="text-gray-600">
              {exam.start_date ? new Date(exam.start_date).toLocaleDateString() : "Not set"}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-700">End Date</p>
            <p className="text-gray-600">{exam.end_date ? new Date(exam.end_date).toLocaleDateString() : "Not set"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Submissions</p>
            <p className="text-accent-teal font-medium">
              {exam.submissions && exam.submissions.length > 0 ? exam.submissions[0].count : 0} submissions
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
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
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-purple">{stats.totalExams}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-teal">{stats.activeExams}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Draft Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.upcomingExams}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700">{stats.totalSubmissions}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Tabs defaultValue="drafts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger
            value="drafts"
            className="font-medium data-[state=active]:bg-white data-[state=active]:text-primary-purple"
          >
            Drafts ({draftExams.length})
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="font-medium data-[state=active]:bg-white data-[state=active]:text-primary-purple"
          >
            Active ({activeExams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-primary-purple font-inter">Draft Exams</h2>
            {draftExams.length === 0 ? (
              <Card className="border border-gray-200">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">No draft exams found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {draftExams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} showActivateButton={true} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-primary-purple font-inter">Active Exams</h2>
            {activeExams.length === 0 ? (
              <Card className="border border-gray-200">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">No active exams found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeExams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} showDeactivateButton={true} showViewResults={true} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
