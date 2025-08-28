"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { Trash2, Edit, Eye, EyeOff } from "lucide-react"

interface Lecture {
  id: string
  title: string
  description: string
  content_type: string
  content_url: string
  visibility: "published" | "hidden"
  section: string
  created_at: string
}

interface LectureItemProps {
  lecture: Lecture
  onUpdate: () => void
}

export default function LectureItem({ lecture, onUpdate }: LectureItemProps) {
  const [visibilityLoading, setVisibilityLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()

  const toggleVisibility = async () => {
    setVisibilityLoading(true)
    const newVisibility = lecture.visibility === "published" ? "hidden" : "published"

    try {
      const supabase = createClient()
      const { error } = await supabase.from("content_items").update({ visibility: newVisibility }).eq("id", lecture.id)

      if (error) throw error

      toast({
        title: "Success!",
        description: `Lecture ${newVisibility === "published" ? "published" : "hidden"} successfully`,
      })

      onUpdate()
    } catch (error) {
      console.log("[v0] Error updating visibility:", error)
      toast({
        title: "Error",
        description: "Failed to update lecture visibility. Please try again.",
        variant: "destructive",
      })
    } finally {
      setVisibilityLoading(false)
    }
  }

  const deleteLecture = async () => {
    setDeleteLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("content_items").delete().eq("id", lecture.id)

      if (error) throw error

      toast({
        title: "Success!",
        description: "Lecture deleted successfully",
      })

      onUpdate()
    } catch (error) {
      console.log("[v0] Error deleting lecture:", error)
      toast({
        title: "Error",
        description: "Failed to delete lecture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 flex-wrap font-inter text-xl font-bold text-primary-purple">
              {lecture.title}
              <Badge
                variant={lecture.visibility === "published" ? "default" : "secondary"}
                className={
                  lecture.visibility === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                }
              >
                {lecture.visibility === "published" ? "Published" : "Hidden"}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1 text-gray-600">{lecture.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={lecture.visibility === "published"}
                onCheckedChange={toggleVisibility}
                disabled={visibilityLoading}
              />
              <span className="text-sm text-gray-600">
                {lecture.visibility === "published" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </span>
            </div>

            <Button variant="outline" size="sm" className="font-medium hover:bg-gray-50 bg-transparent">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>

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
                    Delete Lecture
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600">
                    Are you sure you want to permanently delete this lecture? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="font-medium">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteLecture} className="bg-red-600 hover:bg-red-700 font-medium">
                    Delete Lecture
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Section</p>
            <p className="text-gray-600">{lecture.section || "General"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Content Type</p>
            <p className="text-gray-600 capitalize">{lecture.content_type}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Created</p>
            <p className="text-gray-600">{new Date(lecture.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
