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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type Submission = {
  id: string;
  student_id: string;
  exam_id: string;
  submitted_at: string;
  total_score: number;
  max_possible_score: number;
  percentage: number;
  time_taken_minutes: number;
  student_name: string;
  exam_title: string;
  is_graded: boolean;
};

type Answer = {
  id: string;
  question_id: string;
  answer_text: string | null;
  selected_option_id: string | null;
  points_earned: number;
  instructor_feedback: string | null;
  is_graded: boolean;
  is_correct: boolean | null;
  question_text: string;
  question_type: string;
  max_points: number;
  correct_option_text?: string;
  selected_option_text?: string;
};

export function GradeManagement() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("submissions")
        .select(
          `
          *,
          profiles!submissions_student_id_fkey(full_name),
          exams(title)
        `
        )
        .eq("is_submitted", true)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      const formattedSubmissions =
        data?.map((sub) => ({
          ...sub,
          student_name: sub.profiles?.full_name || sub.student_id,
          exam_title: sub.exams?.title || "Unknown Exam",
          is_graded: sub.total_score > 0 || sub.max_possible_score === 0,
        })) || [];

      setSubmissions(formattedSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissionAnswers = async (submissionId: string) => {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("answers")
        .select(
          `
          *,
          questions(
            question_text,
            question_type,
            points
          ),
          question_options!answers_selected_option_id_fkey(
            option_text
          )
        `
        )
        .eq("submission_id", submissionId);

      if (error) throw error;

      // Get correct answers for comparison
      const questionIds = data?.map((a) => a.question_id) || [];
      const { data: correctOptions } = await supabase
        .from("question_options")
        .select("question_id, option_text")
        .in("question_id", questionIds)
        .eq("is_correct", true);

      const correctAnswersMap = new Map(
        correctOptions?.map((opt) => [opt.question_id, opt.option_text]) || []
      );

      const formattedAnswers =
        data?.map((answer) => ({
          ...answer,
          question_text: answer.questions?.question_text || "",
          question_type: answer.questions?.question_type || "",
          max_points: answer.questions?.points || 0,
          selected_option_text: answer.question_options?.option_text || null,
          correct_option_text:
            correctAnswersMap.get(answer.question_id) || null,
        })) || [];

      setAnswers(formattedAnswers);
    } catch (error) {
      console.error("Error fetching answers:", error);
      toast.error("Failed to load submission details");
    }
  };

  const selectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    fetchSubmissionAnswers(submission.id);
  };

  const updateAnswerGrade = async (
    answerId: string,
    points: number,
    feedback: string
  ) => {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("answers")
        .update({
          points_earned: points,
          instructor_feedback: feedback,
          is_graded: true,
        })
        .eq("id", answerId);

      if (error) throw error;

      // Update local state
      setAnswers((prev) =>
        prev.map((answer) =>
          answer.id === answerId
            ? {
                ...answer,
                points_earned: points,
                instructor_feedback: feedback,
                is_graded: true,
              }
            : answer
        )
      );

      // Recalculate submission total
      await recalculateSubmissionScore();

      toast.success("Grade updated successfully");
    } catch (error) {
      console.error("Error updating grade:", error);
      toast.error("Failed to update grade");
    }
  };

  const recalculateSubmissionScore = async () => {
    if (!selectedSubmission) return;

    const totalScore = answers.reduce(
      (sum, answer) => sum + (answer.points_earned || 0),
      0
    );
    const maxScore = answers.reduce(
      (sum, answer) => sum + answer.max_points,
      0
    );
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          total_score: totalScore,
          max_possible_score: maxScore,
          percentage: percentage,
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      // Update local state
      setSelectedSubmission((prev) =>
        prev
          ? {
              ...prev,
              total_score: totalScore,
              max_possible_score: maxScore,
              percentage: percentage,
            }
          : null
      );

      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === selectedSubmission.id
            ? {
                ...sub,
                total_score: totalScore,
                max_possible_score: maxScore,
                percentage: percentage,
              }
            : sub
        )
      );
    } catch (error) {
      console.error("Error updating submission score:", error);
    }
  };

  const autoGradeSubmission = async (submissionId: string) => {
    const supabase = createClient();

    try {
      // Call the auto-grade function
      const { error } = await supabase.rpc("auto_grade_submission", {
        submission_id_param: submissionId,
      });

      if (error) throw error;

      toast.success("Auto-grading completed");
      fetchSubmissions();
      if (selectedSubmission?.id === submissionId) {
        fetchSubmissionAnswers(submissionId);
      }
    } catch (error) {
      console.error("Error auto-grading:", error);
      toast.error("Failed to auto-grade submission");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p>Loading submissions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Grade Management
          </CardTitle>
          <CardDescription>
            Review and grade student submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="submissions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="submissions">All Submissions</TabsTrigger>
              <TabsTrigger value="grading">Grade Submission</TabsTrigger>
            </TabsList>

            <TabsContent value="submissions" className="space-y-4">
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No submissions yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {submission.student_name}
                          </div>
                        </TableCell>
                        <TableCell>{submission.exam_title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {submission.total_score}/
                              {submission.max_possible_score}
                            </span>
                            <Badge
                              variant={
                                submission.percentage >= 70
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {submission.percentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(
                              submission.submitted_at
                            ).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              submission.is_graded ? "default" : "secondary"
                            }
                          >
                            {submission.is_graded ? "Graded" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => selectSubmission(submission)}
                            >
                              Review
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => autoGradeSubmission(submission.id)}
                            >
                              Auto-Grade
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="grading" className="space-y-4">
              {!selectedSubmission ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Select a submission from the "All Submissions" tab to start
                    grading
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Submission Header */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{selectedSubmission.exam_title}</span>
                        <Badge
                          variant={
                            selectedSubmission.percentage >= 70
                              ? "default"
                              : "destructive"
                          }
                        >
                          {selectedSubmission.total_score}/
                          {selectedSubmission.max_possible_score}(
                          {selectedSubmission.percentage.toFixed(1)}%)
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Student: {selectedSubmission.student_name} • Submitted:{" "}
                        {new Date(
                          selectedSubmission.submitted_at
                        ).toLocaleString()}{" "}
                        • Time taken: {selectedSubmission.time_taken_minutes}{" "}
                        minutes
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* Questions and Answers */}
                  <div className="space-y-4">
                    {answers.map((answer, index) => (
                      <Card key={answer.id}>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>Question {index + 1}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {answer.question_type.replace("_", " ")}
                              </Badge>
                              <Badge variant="secondary">
                                {answer.max_points} point
                                {answer.max_points !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                          </CardTitle>
                          <CardDescription>
                            {answer.question_text}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Student Answer */}
                          <div>
                            <Label className="text-sm font-medium">
                              Student Answer
                            </Label>
                            <div className="mt-1 p-3 bg-muted/50 rounded-md">
                              {answer.question_type === "open_ended" ? (
                                <p className="whitespace-pre-wrap">
                                  {answer.answer_text || "No answer provided"}
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  <p>
                                    <span className="font-medium">
                                      Selected:{" "}
                                    </span>
                                    {answer.selected_option_text ||
                                      "No answer selected"}
                                  </p>
                                  {answer.correct_option_text && (
                                    <p>
                                      <span className="font-medium">
                                        Correct Answer:{" "}
                                      </span>
                                      {answer.correct_option_text}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2">
                                    {answer.is_correct === true && (
                                      <Badge
                                        variant="default"
                                        className="flex items-center gap-1"
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                        Correct
                                      </Badge>
                                    )}
                                    {answer.is_correct === false && (
                                      <Badge
                                        variant="destructive"
                                        className="flex items-center gap-1"
                                      >
                                        <XCircle className="h-3 w-3" />
                                        Incorrect
                                      </Badge>
                                    )}
                                    {answer.is_correct === null && (
                                      <Badge
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                      >
                                        <AlertCircle className="h-3 w-3" />
                                        Not Graded
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Grading Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            <div className="space-y-2">
                              <Label htmlFor={`points-${answer.id}`}>
                                Points Earned
                              </Label>
                              <Input
                                id={`points-${answer.id}`}
                                type="number"
                                min="0"
                                max={answer.max_points}
                                value={answer.points_earned || 0}
                                onChange={(e) => {
                                  const points =
                                    Number.parseInt(e.target.value) || 0;
                                  setAnswers((prev) =>
                                    prev.map((a) =>
                                      a.id === answer.id
                                        ? { ...a, points_earned: points }
                                        : a
                                    )
                                  );
                                }}
                              />
                              <p className="text-xs text-muted-foreground">
                                Max: {answer.max_points} points
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`feedback-${answer.id}`}>
                                Instructor Feedback
                              </Label>
                              <Textarea
                                id={`feedback-${answer.id}`}
                                value={answer.instructor_feedback || ""}
                                onChange={(e) => {
                                  const feedback = e.target.value;
                                  setAnswers((prev) =>
                                    prev.map((a) =>
                                      a.id === answer.id
                                        ? {
                                            ...a,
                                            instructor_feedback: feedback,
                                          }
                                        : a
                                    )
                                  );
                                }}
                                placeholder="Optional feedback for the student"
                                rows={2}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button
                              onClick={() =>
                                updateAnswerGrade(
                                  answer.id,
                                  answer.points_earned || 0,
                                  answer.instructor_feedback || ""
                                )
                              }
                              size="sm"
                            >
                              Save Grade
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
