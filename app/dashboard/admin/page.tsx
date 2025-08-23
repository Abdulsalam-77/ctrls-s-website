import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOutAdmin } from "@/app/dashboard/admin/actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import the admin components
import DashboardOverview from "@/components/admin/dashboard-overview";
import ContentManagement from "@/components/admin/content-management";
import StudentManagement from "@/components/admin/student-management";
import ExamOverview from "@/components/admin/exam-overview";
import CreateExamForm from "@/components/admin/create-exam-form";
import GradeManagement from "@/components/admin/grade-management";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Server-side authentication check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user is admin
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_admin) {
    redirect("/dashboard/student");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-montserrat text-3xl font-extrabold text-purple">
          Admin Dashboard
        </h1>
        <form action={signOutAdmin}>
          <Button
            variant="outline"
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Sign Out
          </Button>
        </form>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="content-management">
            Content Management
          </TabsTrigger>
          <TabsTrigger value="student-management">
            Student Management
          </TabsTrigger>
          <TabsTrigger value="exam-overview">Exam Overview</TabsTrigger>
          <TabsTrigger value="create-exam">Create Exam</TabsTrigger>
          <TabsTrigger value="grade-management">Grade Management</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardOverview />
        </TabsContent>
        <TabsContent value="content-management" className="mt-6">
          <ContentManagement />
        </TabsContent>
        <TabsContent value="student-management" className="mt-6">
          <StudentManagement />
        </TabsContent>
        <TabsContent value="exam-overview" className="mt-6">
          <ExamOverview />
        </TabsContent>
        <TabsContent value="create-exam" className="mt-6">
          <CreateExamForm />
        </TabsContent>
        <TabsContent value="grade-management" className="mt-6">
          <GradeManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
