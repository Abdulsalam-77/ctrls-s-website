"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, BarChart3, Power } from "lucide-react"

interface ExamCardProps {
  title: string
  description?: string
  status: "draft" | "active" | "completed"
  duration?: number
  startDate?: string
  endDate?: string
  submissions?: number
  onEdit?: () => void
  onDelete?: () => void
  onToggleStatus?: () => void
  onViewResults?: () => void
}

export default function ExamCard({
  title,
  description,
  status,
  duration,
  startDate,
  endDate,
  submissions = 0,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewResults,
}: ExamCardProps) {
  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-inter text-lg font-semibold text-primary-purple flex items-center gap-2">
              {title}
              <Badge
                variant={status === "active" ? "default" : "secondary"}
                className={status === "active" ? "bg-accent-teal text-white" : "bg-gray-100 text-gray-700"}
              >
                {status}
              </Badge>
            </CardTitle>
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {onToggleStatus && (
              <Button variant="outline" size="sm" onClick={onToggleStatus}>
                <Power className="w-4 h-4" />
              </Button>
            )}
            {onViewResults && status !== "draft" && (
              <Button variant="outline" size="sm" onClick={onViewResults}>
                <BarChart3 className="w-4 h-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && status === "draft" && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 bg-transparent"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {duration && (
            <div>
              <p className="font-medium text-gray-700">Duration</p>
              <p className="text-gray-600">{duration} minutes</p>
            </div>
          )}
          {startDate && (
            <div>
              <p className="font-medium text-gray-700">Start Date</p>
              <p className="text-gray-600">{new Date(startDate).toLocaleDateString()}</p>
            </div>
          )}
          {endDate && (
            <div>
              <p className="font-medium text-gray-700">End Date</p>
              <p className="text-gray-600">{new Date(endDate).toLocaleDateString()}</p>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-700">Submissions</p>
            <p className="text-accent-teal font-medium">{submissions}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
