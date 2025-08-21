"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  BarChart3,
  GraduationCap,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

// --- CORRECTED IMPORTS ---
import { ExamOverview } from "@/components/admin/exam-overview";
import { CreateExam } from "@/components/admin/create-exam";
import DashboardOverview from "@/components/admin/dashboard-overview";
import ContentManagement from "@/components/admin/content-management";
import StudentManagement from "@/components/admin/student-management";
import { GradeManagement } from "@/components/admin/grade-management"; // Named import

type DashboardStats = {
  totalExams: number;
  activeExams: number;
  totalSubmissions: number;
  totalStudents: number;
  totalVideos: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    activeExams: 0,
    totalSubmissions: 0,
    totalStudents: 0,
    totalVideos: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    const supabase = createClient();

    try {
      // Fetch exam stats
      const { data: examStats } = await supabase
        .from("exams")
        .select("id, is_active");

      const totalExams = examStats?.length || 0;
      // Corrected 'any' type error
      const activeExams =
        examStats?.filter((exam: any) => exam.is_active).length || 0;

      // Fetch submission stats
      const { data: submissionStats } = await supabase
        .from("submissions")
        .select("id")
        .eq("is_submitted", true);

      const totalSubmissions = submissionStats?.length || 0;

      // Fetch student stats
      const { data: studentStats } = await supabase
        .from("profiles")
        .select("id")
        .eq("is_admin", false);

      const totalStudents = studentStats?.length || 0;

      // Fetch video stats
      const { data: videoStats } = await supabase
        .from("content_items")
        .select("id");

      const totalVideos = videoStats?.length || 0;

      setStats({
        totalExams,
        activeExams,
        totalSubmissions,
        totalStudents,
        totalVideos,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = () => {
    fetchDashboardStats();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-teal-600 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage content, exams, students, and view performance analytics
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalVideos}
            </div>
            <p className="text-xs text-muted-foreground">Learning content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {stats.totalExams}
            </div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {stats.activeExams} active
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalSubmissions}
            </div>
            <p className="text-xs text-muted-foreground">Completed exams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">85%</div>
            <p className="text-xs text-muted-foreground">Across all exams</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentManagement />
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <StudentManagement />
        </TabsContent>

        <TabsContent value="exams" className="space-y-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Exam Management</h2>
                <p className="text-muted-foreground">
                  Create and manage exams for your students
                </p>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Exam Overview</TabsTrigger>
                <TabsTrigger value="create">Create Exam</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <ExamOverview onStatsChange={refreshStats} />
              </TabsContent>

              <TabsContent value="create">
                <CreateExam onExamCreated={refreshStats} />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="grades" className="space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Grade Management</h2>
              <p className="text-muted-foreground">
                Review and grade student submissions
              </p>
            </div>
            <GradeManagement />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
