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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

type QuestionType = "mcq" | "true_false" | "open_ended";

type QuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  options: QuestionOption[];
};

interface CreateExamProps {
  onExamCreated: () => void;
}

export function CreateExam({ onExamCreated }: CreateExamProps) {
  const [examData, setExamData] = useState({
    title: "",
    description: "",
    duration: 60,
    allowReview: true,
    visibilityType: "all" as "all" | "selected",
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: "",
      type: "mcq",
      points: 1,
      options: [
        { id: crypto.randomUUID(), text: "", isCorrect: true },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
  };

  const updateQuestionType = (questionId: string, type: QuestionType) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    let newOptions: QuestionOption[] = [];

    if (type === "mcq") {
      newOptions = [
        { id: crypto.randomUUID(), text: "", isCorrect: true },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ];
    } else if (type === "true_false") {
      newOptions = [
        { id: crypto.randomUUID(), text: "True", isCorrect: true },
        { id: crypto.randomUUID(), text: "False", isCorrect: false },
      ];
    } else {
      newOptions = [];
    }

    updateQuestion(questionId, { type, options: newOptions });
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const newOptions = question.options.map((opt) =>
      opt.id === optionId ? { ...opt, text } : opt
    );
    updateQuestion(questionId, { options: newOptions });
  };

  const setCorrectOption = (questionId: string, optionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const newOptions = question.options.map((opt) => ({
      ...opt,
      isCorrect: opt.id === optionId,
    }));
    updateQuestion(questionId, { options: newOptions });
  };

  const createExam = async () => {
    if (!examData.title.trim()) {
      toast.error("Please enter an exam title");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    // Validate questions
    for (const question of questions) {
      if (!question.text.trim()) {
        toast.error("All questions must have text");
        return;
      }

      if (question.type !== "open_ended") {
        const hasCorrectAnswer = question.options.some((opt) => opt.isCorrect);
        if (!hasCorrectAnswer) {
          toast.error(
            "All MCQ and True/False questions must have a correct answer"
          );
          return;
        }

        const hasEmptyOption = question.options.some((opt) => !opt.text.trim());
        if (hasEmptyOption) {
          toast.error("All answer options must have text");
          return;
        }
      }
    }

    setIsCreating(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to create an exam");
        return;
      }

      // Create exam
      const { data: examResult, error: examError } = await supabase
        .from("exams")
        .insert({
          title: examData.title,
          description: examData.description || null,
          duration_minutes: examData.duration,
          allow_review: examData.allowReview,
          visibility_type: examData.visibilityType,
          created_by: user.id,
        })
        .select()
        .single();

      if (examError) throw examError;

      // Create questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];

        const { data: questionResult, error: questionError } = await supabase
          .from("questions")
          .insert({
            exam_id: examResult.id,
            question_text: question.text,
            question_type: question.type,
            points: question.points,
            order_index: i + 1,
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Create options for MCQ and True/False questions
        if (question.type !== "open_ended" && question.options.length > 0) {
          const optionsToInsert = question.options.map((option, index) => ({
            question_id: questionResult.id,
            option_text: option.text,
            is_correct: option.isCorrect,
            option_order: index + 1,
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
        duration: 60,
        allowReview: true,
        visibilityType: "all",
      });
      setQuestions([]);

      onExamCreated();
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Failed to create exam");
    } finally {
      setIsCreating(false);
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
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={examData.duration}
                onChange={(e) =>
                  setExamData({
                    ...examData,
                    duration: Number.parseInt(e.target.value) || 60,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={examData.description}
              onChange={(e) =>
                setExamData({ ...examData, description: e.target.value })
              }
              placeholder="Enter exam description (optional)"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Allow Review</Label>
              <p className="text-sm text-muted-foreground">
                Students can review their answers after submission
              </p>
            </div>
            <Switch
              checked={examData.allowReview}
              onCheckedChange={(checked) =>
                setExamData({ ...examData, allowReview: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select
              value={examData.visibilityType}
              onValueChange={(value: "all" | "selected") =>
                setExamData({ ...examData, visibilityType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="selected">Selected Students Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions</CardTitle>
              <CardDescription>
                Add questions to your exam. You can create MCQ, True/False, or
                open-ended questions.
              </CardDescription>
            </div>
            <Button onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No questions added yet
              </p>
              <Button onClick={addQuestion} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">Question {index + 1}</Badge>
                      <Badge variant="secondary" className="capitalize">
                        {question.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Question Text *</Label>
                      <Textarea
                        value={question.text}
                        onChange={(e) =>
                          updateQuestion(question.id, { text: e.target.value })
                        }
                        placeholder="Enter your question"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Question Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value: QuestionType) =>
                            updateQuestionType(question.id, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">Multiple Choice</SelectItem>
                            <SelectItem value="true_false">
                              True/False
                            </SelectItem>
                            <SelectItem value="open_ended">
                              Open Ended
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Points</Label>
                        <Input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              points: Number.parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Answer Options */}
                  {question.type !== "open_ended" && (
                    <div className="space-y-2">
                      <Label>Answer Options</Label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={option.id}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={option.isCorrect}
                              onChange={() =>
                                setCorrectOption(question.id, option.id)
                              }
                              className="mt-1"
                            />
                            <Input
                              value={option.text}
                              onChange={(e) =>
                                updateOption(
                                  question.id,
                                  option.id,
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${optionIndex + 1}`}
                              disabled={question.type === "true_false"}
                            />
                            {option.isCorrect && (
                              <Badge variant="default" className="text-xs">
                                Correct
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select the radio button next to the correct answer
                      </p>
                    </div>
                  )}

                  {question.type === "open_ended" && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        This is an open-ended question. Students will provide a
                        text response that will need to be graded manually.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Button */}
      <div className="flex justify-end">
        <Button
          onClick={createExam}
          disabled={
            isCreating || !examData.title.trim() || questions.length === 0
          }
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {isCreating ? "Creating Exam..." : "Create Exam"}
        </Button>
      </div>
    </div>
  );
}
