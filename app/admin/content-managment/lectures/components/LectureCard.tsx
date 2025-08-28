"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Play } from "lucide-react"

interface LectureCardProps {
  title: string
  description?: string
  duration?: string
  category: string
  onEdit?: () => void
  onDelete?: () => void
  onPlay?: () => void
}

export default function LectureCard({
  title,
  description,
  duration,
  category,
  onEdit,
  onDelete,
  onPlay,
}: LectureCardProps) {
  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-inter text-lg font-semibold text-primary-purple">{title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{category}</p>
          </div>
          <div className="flex items-center gap-2">
            {onPlay && (
              <Button variant="outline" size="sm" onClick={onPlay}>
                <Play className="w-4 h-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
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
      {(description || duration) && (
        <CardContent>
          {description && <p className="text-gray-600 text-sm mb-2">{description}</p>}
          {duration && <p className="text-gray-500 text-xs">Duration: {duration}</p>}
        </CardContent>
      )}
    </Card>
  )
}
