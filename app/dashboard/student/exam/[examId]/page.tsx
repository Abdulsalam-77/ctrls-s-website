"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Question = {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "open_ended";
  options?: string[];
  correct_answer?: string;
  points: number;
};

type Exam = {
  id: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  total_points: number;
  questions: Question[];
};

type Answer = {
  questionId: string;
  answer: string;
};

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (examId) {
      fetchExam();
    }
  }, [examId]);

  useEffect(() => {
    if (exam?.duration_minutes && timeRemaining === null) {
      setTimeRemaining(exam.duration_minutes * 60); // Convert to seconds
    }
  }, [exam]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev && prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const fetchExam = async () => {
    const supabase = createClient();

    try {
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();

      if (examError) throw examError;

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("exam_id", examId)
        .order("created_at");

      if (questionsError) throw questionsError;

      const formattedQuestions =
        questionsData?.map((q: any) => ({
          ...q,
          options: q.options ? JSON.parse(q.options) : null,
        })) || [];

      setExam({
        ...examData,
        questions: formattedQuestions,
      });

      // Initialize answers array
      setAnswers(
        formattedQuestions.map((q: any) => ({
          questionId: q.id,
          answer: "",
        }))
      );
    } catch (error) {
      console.error("Error fetching exam:", error);
      toast.error("Failed to load exam");
      router.push("/dashboard/student");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) =>
      prev.map((a) => (a.questionId === questionId ? { ...a, answer } : a))
    );
  };

  const handleSubmitExam = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate score
      let totalScore = 0;
      const gradedAnswers =
        exam?.questions.map((q: any) => {
          const userAnswer =
            answers.find((a: any) => a.questionId === q.id)?.answer || "";
          let isCorrect = false;
          let points = 0;

          if (q.question_type !== "open_ended" && q.correct_answer) {
            isCorrect =
              userAnswer.toLowerCase() === q.correct_answer.toLowerCase();
            points = isCorrect ? q.points : 0;
            totalScore += points;
          }

          return {
            question_id: q.id,
            user_answer: userAnswer,
            is_correct: isCorrect,
            points_earned: points,
          };
        }) || [];

      // Submit exam
      const { error: submissionError } = await supabase
        .from("submissions")
        .insert({
          exam_id: examId,
          student_id: user.id,
          answers: JSON.stringify(gradedAnswers),
          score: totalScore,
          total_possible: exam?.total_points || 0,
          submitted_at: new Date().toISOString(),
          is_submitted: true,
        });

      if (submissionError) throw submissionError;

      toast.success("Exam submitted successfully!");
      router.push("/dashboard/student");
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    const answeredQuestions = answers.filter(
      (a: any) => a.answer.trim() !== ""
    ).length;
    return (answeredQuestions / (exam?.questions.length || 1)) * 100;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading exam...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Exam Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The exam you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/dashboard/student")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer =
    answers.find((a: any) => a.questionId === currentQuestion?.id)?.answer ||
    "";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-teal-600">{exam.title}</h1>
            {exam.description && (
              <p className="text-muted-foreground">{exam.description}</p>
            )}
          </div>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              <span
                className={
                  timeRemaining < 300 ? "text-red-500" : "text-teal-600"
                }
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Progress:{" "}
              {answers.filter((a: any) => a.answer.trim() !== "").length} of{" "}
              {exam.questions.length} answered
            </span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
      </div>

      {/* Question Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question List Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                {exam.questions.map((q: any, index: number) => {
                  const isAnswered =
                    answers
                      .find((a: any) => a.questionId === q.id)
                      ?.answer.trim() !== "";
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <Button
                      key={q.id}
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      className={`relative ${
                        isAnswered ? "bg-green-100 border-green-300" : ""
                      }`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                      {isAnswered && (
                        <CheckCircle className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Question */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  Question {currentQuestionIndex + 1} of {exam.questions.length}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {currentQuestion?.points} points
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg font-medium">
                {currentQuestion?.question_text}
              </div>

              {/* Answer Input */}
              <div className="space-y-4">
                {currentQuestion?.question_type === "multiple_choice" && (
                  <RadioGroup
                    value={currentAnswer}
                    onValueChange={(value) =>
                      handleAnswerChange(currentQuestion.id, value)
                    }
                  >
                    {currentQuestion.options?.map(
                      (option: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={option}
                            id={`option-${index}`}
                          />
                          <Label
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                )}

                {currentQuestion?.question_type === "true_false" && (
                  <RadioGroup
                    value={currentAnswer}
                    onValueChange={(value) =>
                      handleAnswerChange(currentQuestion.id, value)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true" className="cursor-pointer">
                        True
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false" className="cursor-pointer">
                        False
                      </Label>
                    </div>
                  </RadioGroup>
                )}

                {currentQuestion?.question_type === "open_ended" && (
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    placeholder="Type your answer here..."
                    className="min-h-[120px]"
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestionIndex(
                      Math.max(0, currentQuestionIndex - 1)
                    )
                  }
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentQuestionIndex < exam.questions.length - 1 ? (
                    <Button
                      onClick={() =>
                        setCurrentQuestionIndex(currentQuestionIndex + 1)
                      }
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitExam}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Exam"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
