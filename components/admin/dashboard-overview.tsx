"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-context"
import { useEffect, useState } from "react"
import { fetchAdminDashboardStats } from "@/app/dashboard/admin/actions"

interface DashboardStats {
  totalStudents: number
  totalVideos: number
  newSignups30Days: number
  error: string | null
}

export default function DashboardOverview() {
  const { currentContent } = useLanguage()
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalVideos: 0,
    newSignups30Days: 0,
    error: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getStats = async () => {
      setLoading(true)
      const result = await fetchAdminDashboardStats()
      setStats(result)
      setLoading(false)
    }
    getStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-inter text-sm font-medium text-neutral-dark">
              {currentContent.auth.adminDashboard.stats.totalStudents}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-inter text-2xl font-bold text-neutral-dark">Loading...</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-inter text-sm font-medium text-neutral-dark">
              {currentContent.auth.adminDashboard.stats.totalVideos}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-inter text-2xl font-bold text-neutral-dark">Loading...</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-inter text-sm font-medium text-neutral-dark">
              {currentContent.auth.adminDashboard.stats.newSignups30Days}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-inter text-2xl font-bold text-neutral-dark">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (stats.error) {
    return <div className="text-red-500">Error loading dashboard stats: {stats.error}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-inter text-sm font-medium text-neutral-dark">
            {currentContent.auth.adminDashboard.stats.totalStudents}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-inter text-2xl font-bold text-neutral-dark">{stats.totalStudents}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-inter text-sm font-medium text-neutral-dark">
            {currentContent.auth.adminDashboard.stats.totalVideos}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-inter text-2xl font-bold text-neutral-dark">{stats.totalVideos}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-inter text-sm font-medium text-neutral-dark">
            {currentContent.auth.adminDashboard.stats.newSignups30Days}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-inter text-2xl font-bold text-neutral-dark">{stats.newSignups30Days}</div>
        </CardContent>
      </Card>
    </div>
  )
}
