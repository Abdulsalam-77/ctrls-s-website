import { Suspense } from "react"
import { notFound } from "next/navigation"
import EditExamContent from "./components/EditExamContent"

interface EditExamPageProps {
  params: {
    examId: string
  }
}

export default async function EditExamPage({ params }: EditExamPageProps) {
  const { examId } = await params

  if (!examId) {
    notFound()
  }

  return (
    <div className="space-y-8 p-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Edit Exam</h1>
        <p className="text-gray-600 mt-2">Modify exam settings, cover image, and manage questions</p>
      </div>

      <Suspense
        fallback={
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        }
      >
        <EditExamContent examId={examId} />
      </Suspense>
    </div>
  )
}
