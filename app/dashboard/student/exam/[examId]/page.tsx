"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

type Question = {
  id: string;
  question_text: string;
  question_type: "mcq" | "true_false" | "open_ended";
  points: number;
  order_index: number;
  options: QuestionOption[];
};

type QuestionOption = {
  id: string;
  option_text: string;
  option_order: number;
};

type Exam = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  start_date: string | null;
  end_date: string | null;
};

type Answer = {
  question_id: string;
  answer_text?: string;
  selected_option_id?: string;
};

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExamData();
  }, [examId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && exam && submissionId) {
      handleSubmitExam(true); // Auto-submit when time runs out
    }
  }, [timeLeft, exam, submissionId]);

  // Auto-save effect
  useEffect(() => {
    if (submissionId && Object.keys(answers).length > 0) {
      const autoSaveTimer = setTimeout(() => {
        saveAnswers();
      }, 2000); // Auto-save every 2 seconds after changes

      return () => clearTimeout(autoSaveTimer);
    }
  }, [answers, submissionId]);

  const fetchExamData = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Check if user already submitted this exam
    const { data: existingSubmission } = await supabase
      .from("submissions")
      .select("id")
      .eq("exam_id", examId)
      .eq("student_id", user.id)
      .eq("is_submitted", true)
      .single();

    if (existingSubmission) {
      toast.error("You have already submitted this exam");
      router.push("/dashboard/student");
      return;
    }

    // Fetch exam details
    const { data: examData, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();

    if (examError || !examData) {
      toast.error("Exam not found");
      router.push("/dashboard/student");
      return;
    }

    // Check exam availability
    const now = new Date();
    if (examData.start_date && now < new Date(examData.start_date)) {
      toast.error("This exam is not yet available");
      router.push("/dashboard/student");
      return;
    }

    if (examData.end_date && now > new Date(examData.end_date)) {
      toast.error("This exam has expired");
      router.push("/dashboard/student");
      return;
    }

    setExam(examData);
    setTimeLeft(examData.duration_minutes * 60); // Convert to seconds

    // Fetch questions
    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .select(
        `
        *,
        question_options(*)
      `
      )
      .eq("exam_id", examId)
      .order("order_index", { ascending: true });

    if (questionsError || !questionsData) {
      toast.error("Failed to load exam questions");
      router.push("/dashboard/student");
      return;
    }

    // Sort options by order - Fixed TypeScript error by adding proper types
    const sortedQuestions = questionsData.map((q: any) => ({
      ...q,
      options: q.question_options.sort(
        (a: any, b: any) => a.option_order - b.option_order
      ),
    }));

    setQuestions(sortedQuestions);

    // Create or get existing submission
    const { data: submissionData, error: submissionError } = await supabase
      .from("submissions")
      .upsert({
        exam_id: examId,
        student_id: user.id,
        started_at: new Date().toISOString(),
        is_submitted: false,
      })
      .select()
      .single();

    if (submissionError || !submissionData) {
      toast.error("Failed to start exam");
      router.push("/dashboard/student");
      return;
    }

    setSubmissionId(submissionData.id);

    // Load existing answers if any
    const { data: existingAnswers } = await supabase
      .from("answers")
      .select("*")
      .eq("submission_id", submissionData.id);

    if (existingAnswers) {
      const answersMap: Record<string, Answer> = {};
      // Fixed TypeScript error by adding proper type
      existingAnswers.forEach((answer: any) => {
        answersMap[answer.question_id] = {
          question_id: answer.question_id,
          answer_text: answer.answer_text,
          selected_option_id: answer.selected_option_id,
        };
      });
      setAnswers(answersMap);
    }

    setIsLoading(false);
  };

  const saveAnswers = async () => {
    if (!submissionId) return;

    const supabase = createClient();
    const answersToSave = Object.values(answers).map((answer) => ({
      submission_id: submissionId,
      question_id: answer.question_id,
      answer_text: answer.answer_text,
      selected_option_id: answer.selected_option_id,
    }));

    await supabase.from("answers").upsert(answersToSave);
  };

  const handleAnswerChange = (
    questionId: string,
    type: "text" | "option",
    value: string
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        ...(type === "text"
          ? { answer_text: value }
          : { selected_option_id: value }),
      },
    }));
  };

  const handleSubmitExam = async (autoSubmit = false) => {
    if (!submissionId || !exam) return;

    if (!autoSubmit) {
      const unansweredQuestions = questions.filter((q) => !answers[q.id]);
      if (unansweredQuestions.length > 0) {
        const confirm = window.confirm(
          `You have ${unansweredQuestions.length} unanswered questions. Are you sure you want to submit?`
        );
        if (!confirm) return;
      }
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Save final answers
      await saveAnswers();

      // Calculate time taken
      const timeTaken = exam.duration_minutes - Math.floor(timeLeft / 60);

      // Update submission as completed
      const { error: updateError } = await supabase
        .from("submissions")
        .update({
          submitted_at: new Date().toISOString(),
          is_submitted: true,
          time_taken_minutes: timeTaken,
        })
        .eq("id", submissionId);

      if (updateError) throw updateError;

      // Auto-grade the submission
      const { error: gradeError } = await supabase.rpc(
        "auto_grade_submission",
        {
          submission_id_param: submissionId,
        }
      );

      if (gradeError) console.error("Auto-grading error:", gradeError);

      toast.success(
        autoSubmit
          ? "Exam auto-submitted due to time limit"
          : "Exam submitted successfully!"
      );
      router.push("/dashboard/student");
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const isQuestionAnswered = (questionId: string) => {
    return !!answers[questionId];
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <p>Loading exam...</p>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <p>Exam not found</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-teal-600">{exam.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span
                  className={`text-lg font-semibold ${
                    timeLeft < 300 ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
              {timeLeft < 300 && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Time Running Out
                </Badge>
              )}
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-sm">Question Navigation</CardTitle>
                <CardDescription>
                  {getAnsweredCount()}/{questions.length} answered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {questions.map((question, index) => (
                    <Button
                      key={question.id}
                      variant={
                        index === currentQuestionIndex ? "default" : "outline"
                      }
                      size="sm"
                      className={`h-8 w-8 p-0 ${
                        isQuestionAnswered(question.id)
                          ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                          : ""
                      }`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                    <span>Not answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Current</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Question {currentQuestionIndex + 1}
                    </Badge>
                    <Badge variant="secondary">
                      {currentQuestion.points} point
                      {currentQuestion.points !== 1 ? "s" : ""}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {currentQuestion.question_type.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium mb-4">
                    {currentQuestion.question_text}
                  </h2>

                  {/* MCQ and True/False Questions */}
                  {(currentQuestion.question_type === "mcq" ||
                    currentQuestion.question_type === "true_false") && (
                    <RadioGroup
                      value={
                        answers[currentQuestion.id]?.selected_option_id || ""
                      }
                      onValueChange={(value) =>
                        handleAnswerChange(currentQuestion.id, "option", value)
                      }
                    >
                      {currentQuestion.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label
                            htmlFor={option.id}
                            className="flex-1 cursor-pointer"
                          >
                            {option.option_text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {/* Open-ended Questions */}
                  {currentQuestion.question_type === "open_ended" && (
                    <Textarea
                      value={answers[currentQuestion.id]?.answer_text || ""}
                      onChange={(e) =>
                        handleAnswerChange(
                          currentQuestion.id,
                          "text",
                          e.target.value
                        )
                      }
                      placeholder="Type your answer here..."
                      rows={6}
                      className="w-full"
                    />
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentQuestionIndex(
                        Math.max(0, currentQuestionIndex - 1)
                      )
                    }
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {currentQuestionIndex === questions.length - 1 ? (
                      <Button
                        onClick={() => handleSubmitExam()}
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Submitting..." : "Submit Exam"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          setCurrentQuestionIndex(
                            Math.min(
                              questions.length - 1,
                              currentQuestionIndex + 1
                            )
                          )
                        }
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
