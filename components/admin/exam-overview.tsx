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
import { Edit, Trash2, Users, Clock, Calendar, Eye } from "lucide-react";
import { toast } from "sonner";

type Exam = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  submission_count?: number;
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
      const { data: examsData, error } = await supabase
        .from("exams")
        .select(
          `
          *,
          submissions(count)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const examsWithCounts =
        examsData?.map((exam: any) => ({
          ...exam,
          submission_count: exam.submissions?.[0]?.count || 0,
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
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
          <Users className="h-5 w-5" />
          Exam Management
        </CardTitle>
        <CardDescription>
          Manage all exams, view statistics, and control availability
        </CardDescription>
      </CardHeader>
      <CardContent>
        {exams.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No exams created yet</p>
            <Button>Create Your First Exam</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Status</TableHead>
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
                        <span>{exam.duration_minutes} min</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>Start: {formatDate(exam.start_date)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>End: {formatDate(exam.end_date)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {exam.submission_count} submissions
                      </Badge>
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
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteExam(exam.id)}
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
