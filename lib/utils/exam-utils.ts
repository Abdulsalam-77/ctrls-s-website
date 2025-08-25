export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function calculateGrade(score: number, totalPoints: number): string {
  const percentage = (score / totalPoints) * 100

  if (percentage >= 90) return "A"
  if (percentage >= 80) return "B"
  if (percentage >= 70) return "C"
  if (percentage >= 60) return "D"
  return "F"
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case "A":
      return "text-green-600"
    case "B":
      return "text-blue-600"
    case "C":
      return "text-yellow-600"
    case "D":
      return "text-orange-600"
    case "F":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}
