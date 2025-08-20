"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Save, Clock, User, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Submission = {
  id: string;
  student_id: string;
  exam_id: string;
  started_at: string;
  submitted_at: string | null;
  is_submitted: boolean;
  time_taken_minutes: number | null;
  total_score: number | null;
  max_score: number | null;
  is_graded: boolean;
  student: {
    email: string;
    full_name: string | null;
  };
  exam: {
    title: string;
  };
  answers: Answer[];
};

type Answer = {
  id: string;
  question_id: string;
  answer_text: string | null;
  selected_option_id: string | null;
  score: number | null;
  feedback: string | null;
  question: {
    question_text: string;
    question_type: string;
    points: number;
    question_options: QuestionOption[];
  };
};

type QuestionOption = {
  id: string;
  option_text: string;
  is_correct: boolean;
};

export function GradeManagement() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("submissions")
        .select(
          `
          *,
          student:profiles(email, full_name),
          exam:exams(title),
          answers(
            *,
            question:questions(
              question_text,
              question_type,
              points,
              question_options(id, option_text, is_correct)
            )
          )
        `
        )
        .eq("is_submitted", true)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnswerScore = (
    answerId: string,
    score: number,
    feedback: string
  ) => {
    if (!selectedSubmission) return;

    const updatedAnswers = selectedSubmission.answers.map((answer) =>
      answer.id === answerId ? { ...answer, score, feedback } : answer
    );

    setSelectedSubmission({
      ...selectedSubmission,
      answers: updatedAnswers,
    });
  };

  const saveGrades = async () => {
    if (!selectedSubmission) return;

    setIsSaving(true);

    try {
      const supabase = createClient();

      // Update individual answer scores and feedback
      for (const answer of selectedSubmission.answers) {
        if (answer.question.question_type === "open_ended") {
          const { error } = await supabase
            .from("answers")
            .update({
              score: answer.score,
              feedback: answer.feedback,
            })
            .eq("id", answer.id);

          if (error) throw error;
        }
      }

      // Calculate total score
      const totalScore = selectedSubmission.answers.reduce((sum, answer) => {
        return sum + (answer.score || 0);
      }, 0);

      const maxScore = selectedSubmission.answers.reduce((sum, answer) => {
        return sum + answer.question.points;
      }, 0);

      // Update submission with total score
      const { error: submissionError } = await supabase
        .from("submissions")
        .update({
          total_score: totalScore,
          max_score: maxScore,
          is_graded: true,
        })
        .eq("id", selectedSubmission.id);

      if (submissionError) throw submissionError;

      toast.success("Grades saved successfully!");
      fetchSubmissions();
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Error saving grades:", error);
      toast.error("Failed to save grades");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not submitted";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number | null, maxScore: number | null) => {
    if (!score || !maxScore) return "text-gray-500";
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredSubmissions = submissions.filter((submission) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "graded") return submission.is_graded;
    if (filterStatus === "ungraded") return !submission.is_graded;
    return true;
  });

  if (isLoading) {
    return <div>Loading submissions...</div>;
  }

  if (selectedSubmission) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Grade Submission</h2>
            <p className="text-muted-foreground">
              {selectedSubmission.student.full_name ||
                selectedSubmission.student.email}{" "}
              - {selectedSubmission.exam.title}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setSelectedSubmission(null)}
            >
              Back to List
            </Button>
            <Button onClick={saveGrades} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Grades"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {selectedSubmission.answers.map((answer, index) => (
            <Card key={answer.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  Question {index + 1} ({answer.question.points} points)
                </CardTitle>
                <CardDescription>
                  {answer.question.question_text}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Student Answer:</h4>
                  {answer.question.question_type === "open_ended" ? (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {answer.answer_text || "No answer provided"}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {answer.selected_option_id
                        ? answer.question.question_options.find(
                            (opt) => opt.id === answer.selected_option_id
                          )?.option_text || "Unknown option"
                        : "No answer selected"}
                    </div>
                  )}
                </div>

                {answer.question.question_type !== "open_ended" && (
                  <div>
                    <h4 className="font-medium mb-2">Correct Answer:</h4>
                    <div className="p-3 bg-green-50 rounded-md">
                      {answer.question.question_options.find(
                        (opt) => opt.is_correct
                      )?.option_text || "No correct answer set"}
                    </div>
                  </div>
                )}

                {answer.question.question_type === "open_ended" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Score (out of {answer.question.points})
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max={answer.question.points}
                        value={answer.score || 0}
                        onChange={(e) =>
                          updateAnswerScore(
                            answer.id,
                            Number.parseInt(e.target.value) || 0,
                            answer.feedback || ""
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Feedback</label>
                      <Textarea
                        value={answer.feedback || ""}
                        onChange={(e) =>
                          updateAnswerScore(
                            answer.id,
                            answer.score || 0,
                            e.target.value
                          )
                        }
                        placeholder="Provide feedback for the student"
                      />
                    </div>
                  </div>
                )}

                {answer.question.question_type !== "open_ended" && (
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        answer.score === answer.question.points
                          ? "default"
                          : "destructive"
                      }
                    >
                      {answer.score === answer.question.points
                        ? "Correct"
                        : "Incorrect"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Score: {answer.score || 0}/{answer.question.points}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Grade Management</h2>
          <p className="text-muted-foreground">
            Review and grade student submissions
          </p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Submissions</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
            <SelectItem value="ungraded">Ungraded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter((s) => s.is_graded).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter((s) => !s.is_graded).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>Click on a submission to grade it</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Time Taken</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <div>
                        <div className="font-medium">
                          {submission.student.full_name || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {submission.student.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{submission.exam.title}</TableCell>
                  <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                  <TableCell>
                    {submission.time_taken_minutes
                      ? `${submission.time_taken_minutes} min`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {submission.total_score !== null &&
                    submission.max_score !== null ? (
                      <span
                        className={getScoreColor(
                          submission.total_score,
                          submission.max_score
                        )}
                      >
                        {submission.total_score}/{submission.max_score}
                      </span>
                    ) : (
                      "Not graded"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={submission.is_graded ? "default" : "secondary"}
                    >
                      {submission.is_graded ? "Graded" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Grade
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
