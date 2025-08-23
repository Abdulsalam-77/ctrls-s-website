"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/language-context"
import { useEffect, useState } from "react"
import { fetchStudents, type Profile } from "@/app/dashboard/admin/actions"
import CreateStudentForm from "@/components/admin/create-student-form"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function StudentManagement() {
  const { currentContent } = useLanguage()
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const loadStudents = async () => {
    setLoading(true)
    const { data, error } = await fetchStudents()
    if (error) {
      toast({
        title: "Error",
        description: `Failed to load students: ${error}`,
        variant: "destructive",
      })
    } else if (data) {
      setStudents(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const handleCreateStudent = () => {
    setIsModalOpen(true)
  }

  const handleFormSubmitSuccess = () => {
    setIsModalOpen(false)
    loadStudents() // Reload students after creation
  }

  if (loading) {
    return <div className="text-center py-8">Loading students...</div>
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreateStudent} className="bg-accent-teal text-white hover:bg-primary-purple">
          {currentContent.auth.adminDashboard.studentManagement.createStudentAccount}
        </Button>
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-neutral-dark">
                {currentContent.auth.adminDashboard.studentManagement.table.studentName}
              </TableHead>
              <TableHead className="text-neutral-dark">
                {currentContent.auth.adminDashboard.studentManagement.table.emailAddress}
              </TableHead>
              <TableHead className="text-neutral-dark">
                {currentContent.auth.adminDashboard.studentManagement.table.dateRegistered}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium text-neutral-dark">
                    {student.email?.split("@")[0] || "N/A"}
                  </TableCell>{" "}
                  {/* Placeholder for name */}
                  <TableCell className="text-neutral-grey">{student.email}</TableCell>
                  <TableCell className="text-neutral-grey">{format(new Date(student.created_at), "PPP")}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateStudentForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleFormSubmitSuccess}
      />
    </div>
  )
}
