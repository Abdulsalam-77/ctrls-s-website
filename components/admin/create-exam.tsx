"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";
import { toast } from "sonner";

type Question = {
  id: string;
  question_text: string;
  question_type: "mcq" | "true_false" | "open_ended";
  points: number;
  options: QuestionOption[];
};

type QuestionOption = {
  id: string;
  option_text: string;
  is_correct: boolean;
};

interface CreateExamProps {
  onExamCreated: () => void;
}

export function CreateExam({ onExamCreated }: CreateExamProps) {
  const [examData, setExamData] = useState({
    title: "",
    description: "",
    duration_minutes: 60,
    start_date: "",
    end_date: "",
    allow_review: true,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      question_text: "",
      question_type: "mcq",
      points: 1,
      options: [
        { id: `temp-opt-${Date.now()}-1`, option_text: "", is_correct: false },
        { id: `temp-opt-${Date.now()}-2`, option_text: "", is_correct: false },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (questionId: string, field: string, value: any) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          if (field === "question_type" && value === "true_false") {
            return {
              ...q,
              [field]: value,
              options: [
                {
                  id: `temp-opt-${Date.now()}-1`,
                  option_text: "True",
                  is_correct: false,
                },
                {
                  id: `temp-opt-${Date.now()}-2`,
                  option_text: "False",
                  is_correct: false,
                },
              ],
            };
          } else if (field === "question_type" && value === "open_ended") {
            return {
              ...q,
              [field]: value,
              options: [],
            };
          }
          return { ...q, [field]: value };
        }
        return q;
      })
    );
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [
              ...q.options,
              {
                id: `temp-opt-${Date.now()}`,
                option_text: "",
                is_correct: false,
              },
            ],
          };
        }
        return q;
      })
    );
  };

  const updateOption = (
    questionId: string,
    optionId: string,
    field: string,
    value: any
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((opt) => {
              if (opt.id === optionId) {
                if (field === "is_correct" && value) {
                  // For MCQ and True/False, only one option can be correct
                  const updatedOptions = q.options.map((o) => ({
                    ...o,
                    is_correct: false,
                  }));
                  return {
                    ...updatedOptions.find((o) => o.id === optionId)!,
                    is_correct: true,
                  };
                }
                return { ...opt, [field]: value };
              }
              return field === "is_correct" && value
                ? { ...opt, is_correct: false }
                : opt;
            }),
          };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.filter((opt) => opt.id !== optionId),
          };
        }
        return q;
      })
    );
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const saveExam = async () => {
    if (!examData.title.trim()) {
      toast.error("Please enter an exam title");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Create exam
      const { data: examResult, error: examError } = await supabase
        .from("exams")
        .insert({
          ...examData,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (examError) throw examError;

      // Create questions and options
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const { data: questionResult, error: questionError } = await supabase
          .from("questions")
          .insert({
            exam_id: examResult.id,
            question_text: question.question_text,
            question_type: question.question_type,
            points: question.points,
            order_index: i,
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Create options for MCQ and True/False questions
        if (question.options.length > 0) {
          const optionsToInsert = question.options.map((option, optIndex) => ({
            question_id: questionResult.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            option_order: optIndex,
          }));

          const { error: optionsError } = await supabase
            .from("question_options")
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }
      }

      toast.success("Exam created successfully!");

      // Reset form
      setExamData({
        title: "",
        description: "",
        duration_minutes: 60,
        start_date: "",
        end_date: "",
        allow_review: true,
      });
      setQuestions([]);
      onExamCreated();
    } catch (error) {
      console.error("Error saving exam:", error);
      toast.error("Failed to save exam");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Exam Details */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
          <CardDescription>
            Configure the basic settings for your exam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Exam Title *</Label>
              <Input
                id="title"
                value={examData.title}
                onChange={(e) =>
                  setExamData({ ...examData, title: e.target.value })
                }
                placeholder="Enter exam title"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={examData.duration_minutes}
                onChange={(e) =>
                  setExamData({
                    ...examData,
                    duration_minutes: Number.parseInt(e.target.value),
                  })
                }
                min="1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={examData.description}
              onChange={(e) =>
                setExamData({ ...examData, description: e.target.value })
              }
              placeholder="Enter exam description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date & Time</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={examData.start_date}
                onChange={(e) =>
                  setExamData({ ...examData, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date & Time</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={examData.end_date}
                onChange={(e) =>
                  setExamData({ ...examData, end_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allow_review"
              checked={examData.allow_review}
              onCheckedChange={(checked) =>
                setExamData({ ...examData, allow_review: checked })
              }
            />
            <Label htmlFor="allow_review">
              Allow students to review their answers after submission
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardDescription>
            Add and configure questions for your exam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, questionIndex) => (
            <div key={question.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">Question {questionIndex + 1}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeQuestion(question.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Question Text *</Label>
                  <Textarea
                    value={question.question_text}
                    onChange={(e) =>
                      updateQuestion(
                        question.id,
                        "question_text",
                        e.target.value
                      )
                    }
                    placeholder="Enter your question"
                    rows={3}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Question Type</Label>
                    <Select
                      value={question.question_type}
                      onValueChange={(value) =>
                        updateQuestion(question.id, "question_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                        <SelectItem value="open_ended">Open Ended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Points</Label>
                    <Input
                      type="number"
                      value={question.points}
                      onChange={(e) =>
                        updateQuestion(
                          question.id,
                          "points",
                          Number.parseInt(e.target.value)
                        )
                      }
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Options for MCQ and True/False */}
              {(question.question_type === "mcq" ||
                question.question_type === "true_false") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options</Label>
                    {question.question_type === "mcq" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(question.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                      </Button>
                    )}
                  </div>
                  {question.options.map((option, optionIndex) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={option.is_correct}
                        onChange={() =>
                          updateOption(
                            question.id,
                            option.id,
                            "is_correct",
                            true
                          )
                        }
                        className="mt-1"
                      />
                      <Input
                        value={option.option_text}
                        onChange={(e) =>
                          updateOption(
                            question.id,
                            option.id,
                            "option_text",
                            e.target.value
                          )
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        className="flex-1"
                      />
                      {question.question_type === "mcq" &&
                        question.options.length > 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(question.id, option.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  ))}
                </div>
              )}

              {question.question_type === "open_ended" && (
                <div className="text-sm text-muted-foreground">
                  This question will require manual grading after students
                  submit their answers.
                </div>
              )}
            </div>
          ))}

          <Button
            onClick={addQuestion}
            variant="outline"
            className="w-full bg-transparent"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={saveExam}
          disabled={isLoading}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Creating..." : "Create Exam"}
        </Button>
      </div>
    </div>
  );
}
