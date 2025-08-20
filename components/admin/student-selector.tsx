"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, Users, X } from "lucide-react"

interface Student {
  id: string
  name: string
  email: string
  studentId: string
}

interface StudentSelectorProps {
  selectedStudents: string[]
  onSelectionChange: (studentIds: string[]) => void
}

// Mock student data
const mockStudents: Student[] = [
  { id: "st1", name: "Ahmed Hassan", email: "ahmed.hassan@university.edu", studentId: "CS2021001" },
  { id: "st2", name: "Fatima Al-Zahra", email: "fatima.alzahra@university.edu", studentId: "CS2021002" },
  { id: "st3", name: "Omar Khaled", email: "omar.khaled@university.edu", studentId: "CS2021003" },
  { id: "st4", name: "Layla Ibrahim", email: "layla.ibrahim@university.edu", studentId: "CS2021004" },
  { id: "st5", name: "Yusuf Ali", email: "yusuf.ali@university.edu", studentId: "CS2021005" },
  { id: "st6", name: "Nour Mahmoud", email: "nour.mahmoud@university.edu", studentId: "CS2021006" },
  { id: "st7", name: "Karim Farouk", email: "karim.farouk@university.edu", studentId: "CS2021007" },
  { id: "st8", name: "Maryam Saleh", email: "maryam.saleh@university.edu", studentId: "CS2021008" },
]

export default function StudentSelector({ selectedStudents, onSelectionChange }: StudentSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleStudentToggle = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      onSelectionChange(selectedStudents.filter((id) => id !== studentId))
    } else {
      onSelectionChange([...selectedStudents, studentId])
    }
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(filteredStudents.map((student) => student.id))
    }
  }

  const removeStudent = (studentId: string) => {
    onSelectionChange(selectedStudents.filter((id) => id !== studentId))
  }

  const getSelectedStudentNames = () => {
    return selectedStudents
      .map((id) => {
        const student = mockStudents.find((s) => s.id === id)
        return student ? student.name : ""
      })
      .filter(Boolean)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-teal-600">
          <Users className="w-5 h-5" />
          Select Students ({selectedStudents.length} selected)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="student-search">Search Students</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="student-search"
              placeholder="Search by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Selected Students */}
        {selectedStudents.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Students</Label>
            <div className="flex flex-wrap gap-2">
              {getSelectedStudentNames().map((name, index) => (
                <Badge key={index} variant="secondary" className="bg-teal-100 text-teal-700">
                  {name}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto p-0 ml-2 hover:bg-transparent"
                    onClick={() => removeStudent(selectedStudents[index])}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Select All Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent"
          >
            {selectedStudents.length === filteredStudents.length ? "Deselect All" : "Select All"}
          </Button>
          <span className="text-sm text-gray-500">
            {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* Student List */}
        <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => handleStudentToggle(student.id)}
            >
              <Checkbox
                checked={selectedStudents.includes(student.id)}
                onChange={() => handleStudentToggle(student.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                <p className="text-xs text-gray-500 truncate">{student.email}</p>
                <p className="text-xs text-gray-400">{student.studentId}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No students found matching your search.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
