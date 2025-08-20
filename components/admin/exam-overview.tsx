"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Eye, Edit, Trash2, Users, Clock, BarChart3 } from "lucide-react";
import { toast } from "sonner";

type Exam = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  is_active: boolean;
  allow_review: boolean;
  visibility_type: string;
  created_at: string;
  _count?: {
    questions: number;
    submissions: number;
  };
};

interface ExamOverviewProps {
  onStatsChange: () => void;
}

export function ExamOverview({ onStatsChange }: ExamOverviewProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const supabase = createClient();

    try {
      // Fetch exams with question and submission counts
      const { data: examsData, error } = await supabase
        .from("exams")
        .select(
          `
          *,
          questions(count),
          submissions(count)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to include counts
      const examsWithCounts =
        examsData?.map((exam) => ({
          ...exam,
          _count: {
            questions: exam.questions?.length || 0,
            submissions: exam.submissions?.length || 0,
          },
        })) || [];

      setExams(examsWithCounts);
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to load exams");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExamStatus = async (examId: string, isActive: boolean) => {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("exams")
        .update({ is_active: isActive })
        .eq("id", examId);

      if (error) throw error;

      setExams((prev) =>
        prev.map((exam) =>
          exam.id === examId ? { ...exam, is_active: isActive } : exam
        )
      );

      toast.success(
        `Exam ${isActive ? "activated" : "deactivated"} successfully`
      );
      onStatsChange();
    } catch (error) {
      console.error("Error updating exam status:", error);
      toast.error("Failed to update exam status");
    }
  };

  const deleteExam = async (examId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this exam? This action cannot be undone."
      )
    ) {
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase.from("exams").delete().eq("id", examId);

      if (error) throw error;

      setExams((prev) => prev.filter((exam) => exam.id !== examId));
      toast.success("Exam deleted successfully");
      onStatsChange();
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Failed to delete exam");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p>Loading exams...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Exam Overview
        </CardTitle>
        <CardDescription>
          Manage all your exams, view statistics, and control access
        </CardDescription>
      </CardHeader>
      <CardContent>
        {exams.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No exams created yet</p>
            <p className="text-sm text-muted-foreground">
              Switch to the "Create Exam" tab to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{exam.title}</p>
                        {exam.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {exam.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {exam.duration_minutes}m
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {exam._count?.questions || 0} questions
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {exam._count?.submissions || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={exam.is_active}
                          onCheckedChange={(checked) =>
                            toggleExamStatus(exam.id, checked)
                          }
                        />
                        <Badge
                          variant={exam.is_active ? "default" : "secondary"}
                        >
                          {exam.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {exam.visibility_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteExam(exam.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
