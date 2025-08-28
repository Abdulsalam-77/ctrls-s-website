import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ExamOverview from "@/components/admin/exam-overview"
import CreateExamForm from "@/components/admin/create-exam-form"
import GradeManagement from "@/components/admin/grade-management"

export default function ExamManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-montserrat text-3xl font-extrabold text-primary-purple">Exam Management</h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Exam Overview</TabsTrigger>
          <TabsTrigger value="create">Create Exam</TabsTrigger>
          <TabsTrigger value="grades">Grade Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ExamOverview />
        </TabsContent>
        <TabsContent value="create" className="mt-6">
          <CreateExamForm />
        </TabsContent>
        <TabsContent value="grades" className="mt-6">
          <GradeManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
