import DashboardOverview from "@/components/admin/dashboard-overview"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-montserrat text-3xl font-extrabold text-primary-purple">Dashboard Overview</h1>
      </div>
      <DashboardOverview />
    </div>
  )
}
