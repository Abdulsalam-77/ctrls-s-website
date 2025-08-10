"use client"

import type React from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-context"
import { useEffect, useState } from "react"
import { addLecture, updateLecture, type ContentItem } from "@/app/dashboard/admin/actions"
import { useToast } from "@/hooks/use-toast" // Assuming you have a useToast hook

interface AddEditLectureFormProps {
  isOpen: boolean
  onClose: () => void
  lecture?: ContentItem // Optional, for editing
  onSuccess: () => void
}

export default function AddEditLectureForm({ isOpen, onClose, lecture, onSuccess }: AddEditLectureFormProps) {
  const { currentContent } = useLanguage()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"Theoretical" | "Practical">("Theoretical")
  const [thumbnailImage, setThumbnailImage] = useState("")
  const [videoSourceUrl, setVideoSourceUrl] = useState("")
  const [isPending, setIsPending] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (lecture) {
      setTitle(lecture.title)
      setDescription(lecture.description || "")
      setCategory(lecture.section as "Theoretical" | "Practical")
      setThumbnailImage(lecture.thumbnail_image || "")
      setVideoSourceUrl(lecture.url || "")
    } else {
      // Reset form for adding new lecture
      setTitle("")
      setDescription("")
      setCategory("Theoretical")
      setThumbnailImage("")
      setVideoSourceUrl("")
    }
  }, [lecture, isOpen]) // Reset when modal opens or lecture prop changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)

    const formData = new FormData()
    if (lecture) {
      formData.append("id", lecture.id)
    }
    formData.append("title", title)
    formData.append("description", description)
    formData.append("category", category)
    formData.append("thumbnailImage", thumbnailImage)
    formData.append("videoSourceUrl", videoSourceUrl)

    const { success, message } = lecture ? await updateLecture(formData) : await addLecture(formData)

    if (success) {
      toast({
        title: "Success",
        description: message,
      })
      onSuccess()
    } else {
      toast({
        title: "Error",
        description: `Failed to ${lecture ? "update" : "add"} lecture: ${message}`,
        variant: "destructive",
      })
    }
    setIsPending(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-inter text-xl font-bold text-neutral-dark">
            {lecture
              ? currentContent.auth.adminDashboard.contentManagement.editLecture
              : currentContent.auth.adminDashboard.contentManagement.addLecture}
          </DialogTitle>
          <DialogDescription className="font-inter text-base font-normal text-neutral-grey leading-relaxed">
            {lecture
              ? currentContent.auth.adminDashboard.contentManagement.editLectureDescription
              : currentContent.auth.adminDashboard.contentManagement.addLectureDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right text-neutral-dark">
              {currentContent.auth.adminDashboard.contentManagement.form.lectureTitle}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right text-neutral-dark">
              {currentContent.auth.adminDashboard.contentManagement.form.description}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right text-neutral-dark">
              {currentContent.auth.adminDashboard.contentManagement.form.category}
            </Label>
            <Select value={category} onValueChange={(value) => setCategory(value as "Theoretical" | "Practical")}>
              <SelectTrigger id="category" className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Theoretical">
                  {currentContent.auth.adminDashboard.contentManagement.form.theoretical}
                </SelectItem>
                <SelectItem value="Practical">
                  {currentContent.auth.adminDashboard.contentManagement.form.practical}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="thumbnailImage" className="text-right text-neutral-dark">
              {currentContent.auth.adminDashboard.contentManagement.form.thumbnailImage}
            </Label>
            <Input
              id="thumbnailImage"
              value={thumbnailImage}
              onChange={(e) => setThumbnailImage(e.target.value)}
              className="col-span-3"
              placeholder="e.g., /images/lecture-thumb.jpg"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="videoSourceUrl" className="text-right text-neutral-dark">
              {currentContent.auth.adminDashboard.contentManagement.form.videoSourceUrl}
            </Label>
            <Input
              id="videoSourceUrl"
              value={videoSourceUrl}
              onChange={(e) => setVideoSourceUrl(e.target.value)}
              className="col-span-3"
              placeholder="e.g., https://example.com/video.mp4"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="bg-accent-teal text-white hover:bg-primary-purple">
              {isPending
                ? lecture
                  ? "Saving..."
                  : "Adding..."
                : lecture
                  ? currentContent.auth.adminDashboard.contentManagement.form.saveLecture
                  : currentContent.auth.adminDashboard.contentManagement.form.addLecture}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
