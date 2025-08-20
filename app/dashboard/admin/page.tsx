"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, BookOpen, BarChart3 } from "lucide-react";
import { ExamOverview } from "@/components/admin/exam-overview";
import { CreateExam } from "@/components/admin/create-exam";
import { GradeManagement } from "@/components/admin/grade-management";
import { toast } from "sonner";

type DashboardStats = {
  totalExams: number;
  activeExams: number;
  totalSubmissions: number;
  totalStudents: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    activeExams: 0,
    totalSubmissions: 0,
    totalStudents: 0,
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
      const activeExams =
        examStats?.filter((exam) => exam.is_active).length || 0;

      // Fetch submission stats
      const { data: submissionStats } = await supabase
        .from("submissions")
        .select("id")
        .eq("is_submitted", true);

      const totalSubmissions = submissionStats?.length || 0;

      // Fetch student stats
      const { data: studentStats } = await supabase
        .from("auth.users")
        .select("id");

      const totalStudents = studentStats?.length || 0;

      setStats({
        totalExams,
        activeExams,
        totalSubmissions,
        totalStudents,
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
          Manage exams, students, and view performance analytics
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
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
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">85%</div>
            <p className="text-xs text-muted-foreground">Across all exams</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Exam Overview</TabsTrigger>
          <TabsTrigger value="create">Create Exam</TabsTrigger>
          <TabsTrigger value="grades">Grade Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ExamOverview onStatsChange={refreshStats} />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <CreateExam onExamCreated={refreshStats} />
        </TabsContent>

        <TabsContent value="grades" className="space-y-6">
          <GradeManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
