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
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-context"
import { useState } from "react"
import { createStudentAccount } from "@/app/dashboard/admin/actions"
import { useToast } from "@/hooks/use-toast"

interface CreateStudentFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateStudentForm({ isOpen, onClose, onSuccess }: CreateStudentFormProps) {
  const { currentContent } = useLanguage()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPending, setIsPending] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)

    const formData = new FormData()
    formData.append("fullName", fullName)
    formData.append("email", email)
    formData.append("password", password)

    const { success, message } = await createStudentAccount(formData)

    if (success) {
      toast({
        title: "Success",
        description: message,
      })
      onSuccess()
      // Clear form fields
      setFullName("")
      setEmail("")
      setPassword("")
    } else {
      toast({
        title: "Error",
        description: `Failed to create student: ${message}`,
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
            {currentContent.auth.adminDashboard.studentManagement.createStudentAccount}
          </DialogTitle>
          <DialogDescription className="font-inter text-base font-normal text-neutral-grey leading-relaxed">
            {currentContent.auth.adminDashboard.studentManagement.createStudentAccountDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right text-neutral-dark">
              {currentContent.auth.adminDashboard.studentManagement.form.fullName}
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right text-neutral-dark">
              {currentContent.auth.adminDashboard.studentManagement.form.emailAddress}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right text-neutral-dark">
              {currentContent.auth.adminDashboard.studentManagement.form.password}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="bg-accent-teal text-white hover:bg-primary-purple">
              {isPending ? "Creating..." : currentContent.auth.adminDashboard.studentManagement.form.createAccount}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
