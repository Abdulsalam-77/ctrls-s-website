"use client";

import type React from "react";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, X, GripVertical, Upload, FileText } from "lucide-react";
import { put } from "@vercel/blob";

interface Question {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  options: string[];
  correct_answer: string;
  points: number;
  order_index: number;
  attachment_url?: string;
  attachment_name?: string;
}

interface ExamForm {
  title: string;
  description: string;
  duration_minutes: number;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "inactive";
}

interface CreateExamFormProps {
  examId?: string;
  onSuccess?: () => void;
}

export default function CreateExamForm({
  examId,
  onSuccess,
}: CreateExamFormProps) {
  const [examForm, setExamForm] = useState<ExamForm>({
    title: "",
    description: "",
    duration_minutes: 60,
    start_date: "",
    end_date: "",
    status: "draft",
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>(
    {}
  );
  const { toast } = useToast();

  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    if (examId) {
      loadExamData();
    }
  }, [examId]);

  const loadExamData = async () => {
    try {
      const supabase = createClient();

      const { data: exam, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();

      if (examError) throw examError;

      setExamForm({
        title: exam.title,
        description: exam.description || "",
        duration_minutes: exam.duration_minutes,
        start_date: exam.start_date,
        end_date: exam.end_date,
        status: exam.status,
      });

      const { data: questionsData, error: questionsError } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("exam_id", examId)
        .order("order_index");

      if (questionsError) throw questionsError;

      const loadedQuestions: Question[] = questionsData.map((q) => ({
        id: q.id.toString(),
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || [],
        correct_answer: q.correct_answer || "",
        points: q.points,
        order_index: q.order_index,
        attachment_url: q.attachment_url,
        attachment_name: q.attachment_name,
      }));

      setQuestions(loadedQuestions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exam data",
        variant: "destructive",
      });
    }
  };

  const addQuestion = (type: Question["question_type"]) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      question_text: "",
      question_type: type,
      options:
        type === "multiple_choice"
          ? ["", ""]
          : type === "true_false"
          ? ["True", "False"]
          : [],
      correct_answer: "",
      points: 1,
      order_index: questions.length,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateOption = (
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const newOptions = [...question.options, ""];
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options.length > 2) {
      const newOptions = question.options.filter(
        (_, index) => index !== optionIndex
      );
      updateQuestion(questionId, { options: newOptions });
      if (question.correct_answer === question.options[optionIndex]) {
        updateQuestion(questionId, { correct_answer: "" });
      }
    }
  };

  const handleFileUpload = async (questionId: string, file: File) => {
    setUploadingFiles((prev) => ({ ...prev, [questionId]: true }));

    try {
      const blob = await put(`exam-files/${Date.now()}-${file.name}`, file, {
        access: "public",
      });

      updateQuestion(questionId, {
        attachment_url: blob.url,
        attachment_name: file.name,
      });

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const removeAttachment = (questionId: string) => {
    updateQuestion(questionId, {
      attachment_url: undefined,
      attachment_name: undefined,
    });
  };

  const handleDragStart = (e: React.DragEvent, questionId: string) => {
    setDraggedItem(questionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetQuestionId: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetQuestionId) return;

    const draggedIndex = questions.findIndex((q) => q.id === draggedItem);
    const targetIndex = questions.findIndex((q) => q.id === targetQuestionId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newQuestions = [...questions];
    const [draggedQuestion] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, draggedQuestion);

    // Update order indices
    const updatedQuestions = newQuestions.map((q, index) => ({
      ...q,
      order_index: index,
    }));

    setQuestions(updatedQuestions);
    setDraggedItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      if (examId) {
        const { error: examError } = await supabase
          .from("exams")
          .update(examForm)
          .eq("id", examId);

        if (examError) throw examError;

        await supabase.from("exam_questions").delete().eq("exam_id", examId);
      } else {
        const { data: exam, error: examError } = await supabase
          .from("exams")
          .insert([examForm])
          .select()
          .single();

        if (examError) throw examError;

        examId = exam.id;
      }

      if (questions.length > 0) {
        const questionsToInsert = questions.map((q) => ({
          exam_id: examId,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          correct_answer: q.correct_answer,
          points: q.points,
          order_index: q.order_index,
          attachment_url: q.attachment_url,
          attachment_name: q.attachment_name,
        }));

        const { error: questionsError } = await supabase
          .from("exam_questions")
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      toast({
        title: "Success",
        description: examId
          ? "Exam updated successfully"
          : "Exam created successfully",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        setExamForm({
          title: "",
          description: "",
          duration_minutes: 60,
          start_date: "",
          end_date: "",
          status: "draft",
        });
        setQuestions([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: examId ? "Failed to update exam" : "Failed to create exam",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{examId ? "Edit Exam" : "Create New Exam"}</CardTitle>
          <CardDescription>
            {examId
              ? "Update exam details and questions"
              : "Set up a new exam with questions and settings"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input
                  id="title"
                  value={examForm.title}
                  onChange={(e) =>
                    setExamForm({ ...examForm, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={examForm.duration_minutes}
                  onChange={(e) =>
                    setExamForm({
                      ...examForm,
                      duration_minutes: Number.parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={examForm.description}
                onChange={(e) =>
                  setExamForm({ ...examForm, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={examForm.start_date}
                  onChange={(e) =>
                    setExamForm({ ...examForm, start_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={examForm.end_date}
                  onChange={(e) =>
                    setExamForm({ ...examForm, end_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={examForm.status === "active"}
                onCheckedChange={(checked) =>
                  setExamForm({
                    ...examForm,
                    status: checked ? "active" : "draft",
                  })
                }
              />
              <Label htmlFor="active">Make exam active immediately</Label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion("multiple_choice")}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    MCQ
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion("true_false")}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    True/False
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion("short_answer")}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Short Answer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion("essay")}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Essay
                  </Button>
                </div>
              </div>

              {questions.length > 0 && (
                <div className="text-sm text-muted-foreground mb-2">
                  💡 Drag questions by the grip handle to reorder them
                </div>
              )}

              {questions.map((question, index) => (
                <Card
                  key={question.id}
                  className={`transition-all duration-200 ${
                    draggedItem === question.id
                      ? "opacity-50 scale-95"
                      : "hover:shadow-md"
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, question.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, question.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="cursor-grab active:cursor-grabbing p-1">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-base">
                          Question {index + 1}
                        </CardTitle>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.question_text}
                        onChange={(e) =>
                          updateQuestion(question.id, {
                            question_text: e.target.value,
                          })
                        }
                        placeholder="Enter your question..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Attachment (Optional)</Label>
                      {question.attachment_url ? (
                        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm flex-1">
                            {question.attachment_name}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(question.attachment_url, "_blank")
                            }
                          >
                            View File
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(question.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <div className="text-center">
                              <p className="text-sm font-medium">
                                Upload any file type
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Images, PDFs, documents, etc.
                              </p>
                            </div>
                            <Input
                              type="file"
                              accept="*/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(question.id, file);
                                }
                              }}
                              disabled={uploadingFiles[question.id]}
                              className="max-w-xs"
                            />
                            {uploadingFiles[question.id] && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                Uploading file...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Question Type</Label>
                        <Select
                          value={question.question_type}
                          onValueChange={(value) =>
                            updateQuestion(question.id, {
                              question_type: value as Question["question_type"],
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">
                              Multiple Choice
                            </SelectItem>
                            <SelectItem value="true_false">
                              True/False
                            </SelectItem>
                            <SelectItem value="short_answer">
                              Short Answer
                            </SelectItem>
                            <SelectItem value="essay">Essay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Points</Label>
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              points: Number.parseInt(e.target.value),
                            })
                          }
                          min="1"
                        />
                      </div>
                    </div>

                    {question.question_type === "multiple_choice" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Options</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(question.id)}
                            className="text-primary hover:text-primary"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Option ({question.options.length + 1})
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          💡 Click the radio button to mark the correct answer
                        </div>
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center gap-2 p-2 border rounded-lg"
                          >
                            <span className="text-sm font-medium text-muted-foreground min-w-[20px]">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <Input
                              value={option}
                              onChange={(e) =>
                                updateOption(
                                  question.id,
                                  optionIndex,
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${String.fromCharCode(
                                65 + optionIndex
                              )}`}
                              className="flex-1"
                            />
                            <div className="flex items-center gap-1">
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={question.correct_answer === option}
                                onChange={() =>
                                  updateQuestion(question.id, {
                                    correct_answer: option,
                                  })
                                }
                                className="w-4 h-4"
                              />
                              <span className="text-xs text-muted-foreground">
                                Correct
                              </span>
                            </div>
                            {question.options.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeOption(question.id, optionIndex)
                                }
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {question.question_type === "true_false" && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center gap-2"
                          >
                            <Input
                              value={option}
                              onChange={(e) =>
                                updateOption(
                                  question.id,
                                  optionIndex,
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${optionIndex + 1}`}
                              disabled={question.question_type === "true_false"}
                            />
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correct_answer === option}
                              onChange={() =>
                                updateQuestion(question.id, {
                                  correct_answer: option,
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {question.question_type === "short_answer" && (
                      <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        <Input
                          value={question.correct_answer}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              correct_answer: e.target.value,
                            })
                          }
                          placeholder="Enter the correct answer..."
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? examId
                  ? "Updating Exam..."
                  : "Creating Exam..."
                : examId
                ? "Update Exam"
                : "Create Exam"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
