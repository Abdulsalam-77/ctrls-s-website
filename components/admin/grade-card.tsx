import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface GradeCardProps {
  title: string
  score: number
  total: number
  colorClass: string
}

export default function GradeCard({ title, score, total, colorClass }: GradeCardProps) {
  const percentage = Math.round((score / total) * 100)

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg">
      <CardContent className="p-0">
        <div className={cn("h-2 w-full", colorClass)} />
        <div className="p-4">
          <h3 className="font-semibold text-sm text-gray-800 mb-2">{title}</h3>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">{score}</span>
              <span className="text-sm text-gray-500">/ {total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">{percentage}%</span>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-600 transition-all duration-300" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
