"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CreateExamForm from "@/components/admin/create-exam-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface EditExamPageProps {
  params: Promise<{ Id: string }>
}

export default function EditExamPage({ params }: EditExamPageProps) {
  const [examId, setExamId] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setExamId(resolvedParams.Id)
    }
    getParams()


  }, [params])

  const handleSuccess = () => {
    router.push("/dashboard/admin")
  }


  if (!examId) {
    return (

      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exams
            </Button>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading exam...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exams
          </Button>
        </div>

        <CreateExamForm examId={examId} onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
