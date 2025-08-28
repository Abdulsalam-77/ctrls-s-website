"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, FileText } from "lucide-react"

interface NoteCardProps {
  title: string
  content?: string
  category: string
  lastModified?: string
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
}

export default function NoteCard({ title, content, category, lastModified, onEdit, onDelete, onView }: NoteCardProps) {
  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-inter text-lg font-semibold text-primary-purple">{title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{category}</p>
          </div>
          <div className="flex items-center gap-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={onView}>
                <FileText className="w-4 h-4" />
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
      {(content || lastModified) && (
        <CardContent>
          {content && <p className="text-gray-600 text-sm mb-2 line-clamp-2">{content}</p>}
          {lastModified && <p className="text-gray-500 text-xs">Last modified: {lastModified}</p>}
        </CardContent>
      )}
    </Card>
  )
}
