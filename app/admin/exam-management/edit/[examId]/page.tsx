import { notFound } from "next/navigation"

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
    <div className="space-y-6">
      <h2 className="font-montserrat text-2xl font-bold text-primary-purple">Edit Exam</h2>
      <p className="text-gray-600">Edit exam with ID: {examId}</p>
      {/* TODO: Add edit exam form component */}
    </div>
  )
}
