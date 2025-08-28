"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

interface ExamItemProps {
  exam: Exam
  onUpdate: () => void
}

export default function ExamItem({ exam, onUpdate }: ExamItemProps) {
  const [toggleLoading, setToggleLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const toggleExamStatus = async (actionType: "activate" | "deactivate") => {
    setToggleLoading(true)
    const newStatus = exam.status === "active" ? "draft" : "active"

    try {
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
          .eq("exam_id", exam.id)
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

      const response = await fetch(`/admin/exams/${exam.id}`, {
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

      onUpdate()
    } catch (error) {
      console.log("[v0] Error toggling exam status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update exam status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setToggleLoading(false)
    }
  }

  const deleteExam = async () => {
    setDeleteLoading(true)

    try {
      const response = await fetch(`/admin/exams/${exam.id}`, {
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

      onUpdate()
    } catch (error) {
      console.log("[v0] Error deleting exam:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete exam. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleEditExam = () => {
    router.push(`/admin/exam-management/edit/${exam.id}`)
  }

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
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
            {exam.status === "draft" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={toggleLoading}
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
                      onClick={() => toggleExamStatus("activate")}
                      className="bg-accent-teal hover:bg-primary-purple font-medium"
                    >
                      Activate Exam
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {exam.status === "active" && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={toggleLoading}
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
                        onClick={() => toggleExamStatus("deactivate")}
                        className="bg-red-600 hover:bg-red-700 font-medium"
                      >
                        Deactivate Exam
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 font-medium"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  View Results
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleEditExam}
              className="font-medium hover:bg-gray-50 bg-transparent"
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
                    disabled={deleteLoading}
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
                    <AlertDialogAction onClick={deleteExam} className="bg-red-600 hover:bg-red-700 font-medium">
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
            <p className="text-gray-600">{exam.start_date ? new Date(exam.start_date).toLocaleString() : "Not set"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">End Date</p>
            <p className="text-gray-600">{exam.end_date ? new Date(exam.end_date).toLocaleString() : "Not set"}</p>
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
}
