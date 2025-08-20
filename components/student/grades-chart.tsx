"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"

export type GradeData = {
  examTitle: string
  score: number
  totalQuestions: number
  percentage: number
  type: "theoretical" | "practical"
}

interface GradesChartProps {
  grades: GradeData[]
  studentName: string
}

export default function GradesChart({ grades, studentName }: GradesChartProps) {
  const chartData = grades.map((grade) => ({
    name: grade.examTitle,
    score: grade.score,
    total: grade.totalQuestions,
    percentage: grade.percentage,
    type: grade.type,
  }))

  const averagePercentage =
    grades.length > 0 ? grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length : 0

  const pieData = [
    { name: "Completed", value: averagePercentage, color: "#10b981" },
    { name: "Remaining", value: 100 - averagePercentage, color: "#e5e7eb" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Grades Overview - {studentName}</span>
            <span className="text-lg font-bold text-purple-600">{averagePercentage.toFixed(1)}% Average</span>
          </CardTitle>
          <CardDescription>Your exam performance across all assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div>
              <h3 className="text-sm font-medium mb-4">Exam Scores</h3>
              <ChartContainer
                config={{
                  score: {
                    label: "Score",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="percentage" fill="var(--color-score)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Pie Chart */}
            <div>
              <h3 className="text-sm font-medium mb-4">Overall Progress</h3>
              <ChartContainer
                config={{
                  completed: {
                    label: "Completed",
                    color: "#10b981",
                  },
                  remaining: {
                    label: "Remaining",
                    color: "#e5e7eb",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="text-center mt-2">
                <p className="text-2xl font-bold text-purple-600">{averagePercentage.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Exam Results */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {grades.map((grade, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{grade.examTitle}</h4>
                  <p className="text-sm text-gray-600 capitalize">{grade.type} Exam</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {grade.score}/{grade.totalQuestions}
                  </p>
                  <p className="text-sm text-purple-600 font-medium">{grade.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
