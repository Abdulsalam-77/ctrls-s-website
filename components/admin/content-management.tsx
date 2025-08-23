"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import { useEffect, useState } from "react"
import { fetchContentItems, deleteLecture, type ContentItem } from "@/app/dashboard/admin/actions"
import AddEditLectureForm from "@/components/admin/add-edit-lecture-form"
import Image from "next/image"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast" // Assuming you have a useToast hook

export default function ContentManagement() {
  const { currentContent } = useLanguage()
  const [lectures, setLectures] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLecture, setEditingLecture] = useState<ContentItem | undefined>(undefined)
  const { toast } = useToast()

  const loadLectures = async () => {
    setLoading(true)
    const { data, error } = await fetchContentItems()
    if (error) {
      toast({
        title: "Error",
        description: `Failed to load lectures: ${error}`,
        variant: "destructive",
      })
    } else if (data) {
      setLectures(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadLectures()
  }, [])

  const handleAddLecture = () => {
    setEditingLecture(undefined)
    setIsModalOpen(true)
  }

  const handleEditLecture = (lecture: ContentItem) => {
    setEditingLecture(lecture)
    setIsModalOpen(true)
  }

  const handleDeleteLecture = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      const { success, message } = await deleteLecture(id)
      if (success) {
        toast({
          title: "Success",
          description: message,
        })
        loadLectures() // Reload lectures after deletion
      } else {
        toast({
          title: "Error",
          description: `Failed to delete lecture: ${message}`,
          variant: "destructive",
        })
      }
    }
  }

  const handleFormSubmitSuccess = () => {
    setIsModalOpen(false)
    loadLectures() // Reload lectures after add/edit
  }

  if (loading) {
    return <div className="text-center py-8">Loading content...</div>
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddLecture} className="bg-accent-teal text-white hover:bg-primary-purple">
          {currentContent.auth.adminDashboard.contentManagement.addLecture}
        </Button>
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-neutral-dark">
                {currentContent.auth.adminDashboard.contentManagement.table.thumbnail}
              </TableHead>
              <TableHead className="text-neutral-dark">
                {currentContent.auth.adminDashboard.contentManagement.table.lectureTitle}
              </TableHead>
              <TableHead className="text-neutral-grey">
                {currentContent.auth.adminDashboard.contentManagement.table.category}
              </TableHead>
              <TableHead className="text-neutral-grey">
                {currentContent.auth.adminDashboard.contentManagement.table.dateAdded}
              </TableHead>
              <TableHead className="text-right text-neutral-grey">
                {currentContent.auth.adminDashboard.contentManagement.table.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lectures.length > 0 ? (
              lectures.map((lecture) => (
                <TableRow key={lecture.id}>
                  <TableCell>
                    {lecture.thumbnail_image ? (
                      <Image
                        src={lecture.thumbnail_image || "/placeholder.svg"}
                        alt={lecture.title}
                        width={60}
                        height={40}
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-[60px] h-[40px] bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded">
                        No Img
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-neutral-dark">{lecture.title}</TableCell>
                  <TableCell className="text-neutral-grey">{lecture.section}</TableCell>
                  <TableCell className="text-neutral-grey">{format(new Date(lecture.created_at), "PPP")}</TableCell>
                  <TableCell className="text-right text-neutral-grey">
                    <Button variant="ghost" size="icon" onClick={() => handleEditLecture(lecture)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteLecture(lecture.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  No lectures found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddEditLectureForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lecture={editingLecture}
        onSuccess={handleFormSubmitSuccess}
      />
    </div>
  )
}
