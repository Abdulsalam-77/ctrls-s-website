import CreateExamForm from "@/components/admin/create-exam-form"

export default function CreateExamPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-montserrat text-2xl font-bold text-primary-purple">Create New Exam</h2>
      <CreateExamForm />
    </div>
  )
}
