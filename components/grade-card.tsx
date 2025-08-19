// components/grade-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GradeCardProps {
  title: string;
  score: number;
  total: number;
  colorClass: string; // e.g., "bg-pink-200"
}

// Helper to convert percentage to a letter grade
const getLetterGrade = (percentage: number) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 85) return "A";
  if (percentage >= 80) return "B+";
  if (percentage >= 75) return "B";
  if (percentage >= 70) return "C+";
  if (percentage >= 65) return "C";
  if (percentage >= 60) return "D+";
  return "D";
};

export default function GradeCard({ title, score, total, colorClass }: GradeCardProps) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const letterGrade = getLetterGrade(percentage);

  return (
    <Card className={cn("w-full text-gray-800", colorClass)}>
      <CardHeader>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center justify-center border-2 border-gray-600/20 rounded-full w-12 h-12">
          <span className="text-xl font-bold">{letterGrade}</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{percentage}%</p>
          <p className="text-sm">
            {score}/{total}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}