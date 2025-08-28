-- Complete database schema for the exam management system
-- This includes both the existing user/content tables and the new exam system tables

-- Drop existing tables and functions to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP TABLE IF EXISTS public.exam_answers CASCADE;
DROP TABLE IF EXISTS public.exam_submissions CASCADE;
DROP TABLE IF EXISTS public.exam_questions CASCADE;
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.student_content_assignments CASCADE;
DROP TABLE IF EXISTS public.content_items CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table (users)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create content_items table (existing content system)
CREATE TABLE public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  section TEXT NOT NULL,
  url TEXT,
  text_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_content_assignments table
CREATE TABLE public.student_content_assignments (
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_item_id uuid REFERENCES public.content_items(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (student_id, content_item_id)
);

-- Create exams table
CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  total_marks INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exam_questions table
CREATE TABLE public.exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'true_false', 'short_answer', 'essay', 'file_upload')),
  options JSONB, -- For MCQ options: ["Option A", "Option B", "Option C", "Option D"]
  correct_answer TEXT, -- For MCQ/True-False: the correct answer
  marks INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exam_submissions table
CREATE TABLE public.exam_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  total_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded')),
  time_taken_minutes INTEGER,
  UNIQUE(exam_id, student_id)
);

-- Create exam_answers table
CREATE TABLE public.exam_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES public.exam_submissions(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.exam_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  file_url TEXT, -- For file upload questions
  is_correct BOOLEAN,
  marks_awarded INTEGER DEFAULT 0,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(submission_id, question_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_content_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for content_items
CREATE POLICY "Authenticated users can view content_items" ON public.content_items
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage content_items" ON public.content_items
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- RLS Policies for student_content_assignments
CREATE POLICY "Students can view their own assigned content" ON public.student_content_assignments
  FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage student_content_assignments" ON public.student_content_assignments
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- RLS Policies for exams
CREATE POLICY "Authenticated users can view active exams" ON public.exams
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);
CREATE POLICY "Admins can manage all exams" ON public.exams
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- RLS Policies for exam_questions
CREATE POLICY "Authenticated users can view questions of active exams" ON public.exam_questions
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    EXISTS (SELECT 1 FROM public.exams WHERE id = exam_id AND is_active = TRUE)
  );
CREATE POLICY "Admins can manage exam_questions" ON public.exam_questions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- RLS Policies for exam_submissions
CREATE POLICY "Students can view their own submissions" ON public.exam_submissions
  FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can create their own submissions" ON public.exam_submissions
  FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update their own in-progress submissions" ON public.exam_submissions
  FOR UPDATE USING (auth.uid() = student_id AND status = 'in_progress');
CREATE POLICY "Admins can view all submissions" ON public.exam_submissions
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Admins can update all submissions" ON public.exam_submissions
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- RLS Policies for exam_answers
CREATE POLICY "Students can view their own answers" ON public.exam_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.exam_submissions WHERE id = submission_id AND student_id = auth.uid())
  );
CREATE POLICY "Students can create their own answers" ON public.exam_answers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.exam_submissions WHERE id = submission_id AND student_id = auth.uid())
  );
CREATE POLICY "Students can update their own answers for in-progress submissions" ON public.exam_answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.exam_submissions 
      WHERE id = submission_id AND student_id = auth.uid() AND status = 'in_progress'
    )
  );
CREATE POLICY "Admins can manage all answers" ON public.exam_answers
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Function to create a profile for new users
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (NEW.id, NEW.email, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user function on new auth.users inserts
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-grade MCQ and True/False questions
CREATE OR REPLACE FUNCTION public.auto_grade_submission(submission_uuid uuid)
RETURNS void AS $$
DECLARE
  answer_record RECORD;
  total_score INTEGER := 0;
  max_score INTEGER := 0;
BEGIN
  -- Auto-grade MCQ and True/False questions
  FOR answer_record IN 
    SELECT ea.id, ea.answer_text, eq.correct_answer, eq.marks, eq.question_type
    FROM public.exam_answers ea
    JOIN public.exam_questions eq ON ea.question_id = eq.id
    WHERE ea.submission_id = submission_uuid 
    AND eq.question_type IN ('mcq', 'true_false')
  LOOP
    max_score := max_score + answer_record.marks;
    
    IF LOWER(TRIM(answer_record.answer_text)) = LOWER(TRIM(answer_record.correct_answer)) THEN
      UPDATE public.exam_answers 
      SET is_correct = TRUE, marks_awarded = answer_record.marks
      WHERE id = answer_record.id;
      total_score := total_score + answer_record.marks;
    ELSE
      UPDATE public.exam_answers 
      SET is_correct = FALSE, marks_awarded = 0
      WHERE id = answer_record.id;
    END IF;
  END LOOP;

  -- Add marks for questions that need manual grading
  SELECT COALESCE(SUM(eq.marks), 0) INTO max_score
  FROM public.exam_answers ea
  JOIN public.exam_questions eq ON ea.question_id = eq.id
  WHERE ea.submission_id = submission_uuid;

  -- Update submission with scores
  UPDATE public.exam_submissions 
  SET total_score = total_score, max_score = max_score, status = 'graded'
  WHERE id = submission_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
