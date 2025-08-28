"use client"

import { useLanguage } from "@/components/language-context"
import { useEffect, useState } from "react"
import { fetchAdminDashboardStats } from "@/app/dashboard/admin/actions"
import StatCard from "@/app/admin/dashboard/components/StatCard"
import { Users, Video, UserPlus } from "lucide-react"

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

  if (stats.error) {
    return <div className="text-red-500">Error loading dashboard stats: {stats.error}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title={currentContent.auth.adminDashboard.stats.totalStudents}
        number={stats.totalStudents}
        icon={Users}
        loading={loading}
      />
      <StatCard
        title={currentContent.auth.adminDashboard.stats.totalVideos}
        number={stats.totalVideos}
        icon={Video}
        loading={loading}
      />
      <StatCard
        title={currentContent.auth.adminDashboard.stats.newSignups30Days}
        number={stats.newSignups30Days}
        icon={UserPlus}
        loading={loading}
      />
    </div>
  )
}
