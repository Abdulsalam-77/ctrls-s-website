import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  number: string | number
  icon?: LucideIcon
  loading?: boolean
  className?: string
}

export default function StatCard({ title, number, icon: Icon, loading = false, className = "" }: StatCardProps) {
  return (
    <Card className={`border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-inter text-sm font-medium text-neutral-dark">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="font-inter text-2xl font-bold text-primary-purple">{loading ? "Loading..." : number}</div>
      </CardContent>
    </Card>
  )
}
