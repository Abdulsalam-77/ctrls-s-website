"use client"

import { signOut } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface Exam {
  id: string
  title: string
  description: string
  duration_minutes: number
  start_date: string
  end_date: string
}

interface Grade {
  id: string
  score: number
  submitted_at: string
  exams: {
    id: string
    title: string
    description: string
  }
}

// Helper function to format date as DD/MM/YY HH:MM
function formatDateUTC(dateString: string) {
  const date = new Date(dateString)
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const year = String(date.getUTCFullYear()).slice(-2)
  const hours = String(date.getUTCHours()).padStart(2, "0")
  const minutes = String(date.getUTCMinutes()).padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}`
}


export default function StudentDashboardPage() {
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([])
  const [activeExams, setActiveExams] = useState<Exam[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const upcomingResponse = await fetch("/api/student-exams/upcoming")
        const upcomingData = await upcomingResponse.json()
        if (upcomingResponse.ok) setUpcomingExams(upcomingData.exams)

        const activeResponse = await fetch("/api/student-exams")
        const activeData = await activeResponse.json()
        if (activeResponse.ok) setActiveExams(activeData.exams)

        const gradesResponse = await fetch("/api/grades")
        const gradesData = await gradesResponse.json()
        if (gradesResponse.ok) setGrades(gradesData.grades)
      } catch (err) {
        setError("Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-montserrat text-3xl font-extrabold text-purple">Student Dashboard</h1>
        <form action={signOut}>
          <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600">
            Sign Out
          </Button>
        </form>
      </div>

      {/* Upcoming Exams */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Upcoming Exams</h2>
        {upcomingExams.length === 0 ? (
          <p className="text-gray-600">No upcoming exams scheduled.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingExams.map((exam) => {
              console.log("Exam start date:", exam.start_date) // <-- Log here
              console.log("Exam start date:", formatDateUTC(exam.start_date)) // <-- Log here
              return (
                <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                    <CardDescription>{exam.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Duration: {exam.duration_minutes} minutes</p>
                      <p>Starts: {formatDateUTC(exam.start_date)}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>


      {/* Active Exams */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Active Exams</h2>
        {activeExams.length === 0 ? (
          <p className="text-gray-600">No active exams available at the moment.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{exam.title}</CardTitle>
                  <CardDescription>{exam.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>Duration: {exam.duration_minutes} minutes</p>
                    <p>Ends: {formatDateUTC(exam.end_date)}</p>
                  </div>
                  <Button className="w-full">Start Exam</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Grades */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Recent Grades</h2>
        {grades.length === 0 ? (
          <p className="text-gray-600">No grades available yet.</p>
        ) : (
          <div className="space-y-4">
            {grades.map((grade) => (
              <Card key={grade.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{grade.exams.title}</h3>
                      <p className="text-sm text-gray-600">
                        Submitted: {formatDateUTC(grade.submitted_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{grade.score}%</p>
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
