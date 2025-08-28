import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import ExamTabs from "./components/ExamTabs"
import GradeManagement from "@/components/admin/grade-management"

export default function ExamManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-montserrat text-3xl font-extrabold text-primary-purple">Exam Management</h1>
      </div>

      <div className="flex justify-center">
        <Link href="/admin/exam-management/create">
          <Button size="lg" className="bg-accent-teal hover:bg-primary-purple text-white font-semibold px-8 py-3">
            <Plus className="w-5 h-5 mr-2" />
            Create New Exam
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="grading">Grading</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ExamTabs />
        </TabsContent>
        <TabsContent value="grading" className="mt-6">
          <GradeManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
