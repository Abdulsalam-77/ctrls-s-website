"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  Eye,
} from "lucide-react";
import Link from "next/link";

type Exam = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  allow_review: boolean;
};

type Submission = {
  id: string;
  exam_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  submitted_at: string;
  exam: {
    title: string;
    allow_review: boolean;
  };
};

type Stats = {
  averageGrade: number;
  highestScore: number;
  completedExams: number;
  totalExams: number;
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [recentGrades, setRecentGrades] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats>({
    averageGrade: 0,
    highestScore: 0,
    completedExams: 0,
    totalExams: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (error || profile?.is_admin) {
        router.push("/dashboard/admin");
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
      fetchDashboardData(user.id);
    };
    checkAuth();
  }, [router]);

  const fetchDashboardData = async (userId: string) => {
    const supabase = createClient();

    // Fetch available exams
    const { data: examsData } = await supabase
      .from("exams")
      .select("*")
      .eq("is_active", true)
      .or(`visibility_type.eq.all,exam_visibility.student_id.eq.${userId}`)
      .order("start_date", { ascending: true });

    // Fetch submissions
    const { data: submissionsData } = await supabase
      .from("submissions")
      .select(
        `
        *,
        exams!inner(title, allow_review)
      `
      )
      .eq("student_id", userId)
      .eq("is_submitted", true)
      .order("submitted_at", { ascending: false })
      .limit(5);

    if (examsData) {
      // Filter out exams that student has already submitted
      const submittedExamIds = submissionsData?.map((s) => s.exam_id) || [];
      const availableExams = examsData.filter(
        (exam) => !submittedExamIds.includes(exam.id)
      );
      setUpcomingExams(availableExams);
    }

    if (submissionsData) {
      setRecentGrades(submissionsData);

      // Calculate stats
      const totalSubmissions = submissionsData.length;
      const totalExams = (examsData?.length || 0) + totalSubmissions;
      const averageGrade =
        totalSubmissions > 0
          ? submissionsData.reduce((sum, sub) => sum + sub.percentage, 0) /
            totalSubmissions
          : 0;
      const highestScore =
        totalSubmissions > 0
          ? Math.max(...submissionsData.map((sub) => sub.percentage))
          : 0;

      setStats({
        averageGrade: Math.round(averageGrade),
        highestScore: Math.round(highestScore),
        completedExams: totalSubmissions,
        totalExams,
      });
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date set";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const startDate = exam.start_date ? new Date(exam.start_date) : null;
    const endDate = exam.end_date ? new Date(exam.end_date) : null;

    if (startDate && now < startDate) return "upcoming";
    if (endDate && now > endDate) return "expired";
    return "available";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500">Available</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-teal-600">
          Student Dashboard
        </h1>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="bg-red-500 text-white hover:bg-red-600"
        >
          Sign Out
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {stats.averageGrade}%
            </div>
            <Progress value={stats.averageGrade} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.highestScore}%
            </div>
            <Progress value={stats.highestScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Exams
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {stats.completedExams}
            </div>
            <p className="text-xs text-muted-foreground">
              out of {stats.totalExams} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalExams > 0
                ? Math.round((stats.completedExams / stats.totalExams) * 100)
                : 0}
              %
            </div>
            <Progress
              value={
                stats.totalExams > 0
                  ? (stats.completedExams / stats.totalExams) * 100
                  : 0
              }
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
            <CardDescription>Exams available for you to take</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingExams.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No upcoming exams
                </p>
              ) : (
                upcomingExams.map((exam) => {
                  const status = getExamStatus(exam);
                  return (
                    <div
                      key={exam.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{exam.title}</h3>
                        {getStatusBadge(status)}
                      </div>
                      {exam.description && (
                        <p className="text-sm text-muted-foreground">
                          {exam.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {exam.duration_minutes} min
                        </div>
                        {exam.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(exam.start_date)}
                          </div>
                        )}
                      </div>
                      {status === "available" && (
                        <Link href={`/dashboard/student/exam/${exam.id}`}>
                          <Button className="w-full bg-teal-600 hover:bg-teal-700">
                            Start Exam
                          </Button>
                        </Link>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Grades</CardTitle>
            <CardDescription>Your latest exam results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGrades.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No grades yet
                </p>
              ) : (
                recentGrades.map((submission) => (
                  <div
                    key={submission.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{submission.exam.title}</h3>
                      <Badge
                        variant={
                          submission.percentage >= 70
                            ? "default"
                            : "destructive"
                        }
                        className={
                          submission.percentage >= 70 ? "bg-green-500" : ""
                        }
                      >
                        {submission.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        Score: {submission.total_score}/{submission.max_score}
                      </span>
                      <span>{formatDateTime(submission.submitted_at)}</span>
                    </div>
                    <Progress value={submission.percentage} className="h-2" />
                    {submission.exam.allow_review && (
                      <Link href={`/dashboard/student/review/${submission.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review Exam
                        </Button>
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
