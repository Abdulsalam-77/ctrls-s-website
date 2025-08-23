"use client"; // This page MUST be a client component to use hooks like useState and useEffect.

import { createClient } from "@/lib/supabase/client"; // Use the CLIENT-side Supabase client
import { useRouter } from "next/navigation"; // Use useRouter for client-side navigation
import { signOutAdmin } from "@/app/dashboard/admin/actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/components/language-context";
import { useEffect, useState } from "react";

// Import the admin components
import DashboardOverview from "@/components/admin/dashboard-overview";
import ContentManagement from "@/components/admin/content-management";
import StudentManagement from "@/components/admin/student-management";
import ExamOverview from "@/components/admin/exam-overview";
import CreateExamForm from "@/components/admin/create-exam-form";
import GradeManagement from "@/components/admin/grade-management";

export default function AdminDashboardPage() {
  const { currentContent } = useLanguage();
  const router = useRouter(); // Use the router for client-side redirects

  // --- FIX 1: ADD A LOADING STATE ---
  // We will show a loading message until the security check is complete.
  // This prevents the dashboard from flashing on the screen before the redirect.
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // --- FIX 2: CORRECTED SECURITY CHECK INSIDE useEffect ---
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // If no user is logged in, redirect immediately.
      if (!user) {
        router.push("/auth/login");
        return; // Stop execution
      }

      // If a user is logged in, check if they are an admin.
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      // If they are NOT an admin, redirect to the homepage.
      if (error || !profile?.is_admin) {
        router.push("/");
        return; // Stop execution
      }

      // If the checks pass, the user is authorized.
      setIsAuthorized(true);
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  // --- FIX 3: CONDITIONAL RENDERING ---
  // Do not render the dashboard until the security check is complete and successful.
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p>Verifying access...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    // This is a fallback, the redirect should have already happened.
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-montserrat text-3xl font-extrabold text-purple">
          {currentContent.auth.adminDashboard.title}
        </h1>
        <form action={signOutAdmin}>
          <Button
            variant="outline"
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {currentContent.auth.adminDashboard.signOut}
          </Button>
        </form>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">
            {currentContent.auth.adminDashboard.tabs.dashboard}
          </TabsTrigger>
          <TabsTrigger value="content-management">
            {currentContent.auth.adminDashboard.tabs.contentManagement}
          </TabsTrigger>
          <TabsTrigger value="student-management">
            {currentContent.auth.adminDashboard.tabs.studentManagement}
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
