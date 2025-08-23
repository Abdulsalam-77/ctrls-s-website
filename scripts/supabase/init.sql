-- Drop existing trigger and function if they exist to allow recreation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Drop existing tables if they exist to allow recreation with new schema
DROP TABLE IF EXISTS public.student_content_assignments CASCADE;
DROP TABLE IF EXISTS public.content_items CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.exam_questions CASCADE;
DROP TABLE IF EXISTS public.exam_submissions CASCADE;

-- Create a public.profiles table to store user metadata, linked to auth.users
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE, -- Add this line for the email
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security (RLS) for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for profiles: Users can view and update their own profile
CREATE POLICY "Users can view their own profile." ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create a public.content_items table for course content
CREATE TABLE public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- e.g., 'video', 'text', 'quiz'
  section TEXT NOT NULL, -- e.g., 'theoretical', 'practical'
  url TEXT, -- For videos or external links
  text_content TEXT, -- For general text content
  thumbnail_image TEXT, -- NEW: Add this column for thumbnail URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for content_items
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- Policy for content_items: All authenticated users can view content
CREATE POLICY "Authenticated users can view content_items." ON public.content_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for content_items: Admins can insert, update, delete content
CREATE POLICY "Admins can manage content_items." ON public.content_items
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Create a public.student_content_assignments table to link students to specific content
CREATE TABLE public.student_content_assignments (
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_item_id uuid REFERENCES public.content_items(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (student_id, content_item_id)
);

-- Enable RLS for student_content_assignments
ALTER TABLE public.student_content_assignments ENABLE ROW LEVEL SECURITY;

-- Policy for student_content_assignments: Students can view their own assigned content
CREATE POLICY "Students can view their own assigned content." ON public.student_content_assignments
  FOR SELECT USING (auth.uid() = student_id);

-- Policy for student_content_assignments: Admins can manage assignments
CREATE POLICY "Admins can manage student_content_assignments." ON public.student_content_assignments
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Function to create a profile for new users
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin) -- Add email here
  VALUES (NEW.id, NEW.email, FALSE); -- And here, using NEW.email
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user function on new auth.users inserts
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create exams table
CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'inactive', 'completed'
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Policy for exams: All authenticated users can view active exams
CREATE POLICY "Authenticated users can view active exams." ON public.exams
  FOR SELECT USING (auth.role() = 'authenticated' AND status = 'active');

-- Policy for exams: Admins can manage all exams
CREATE POLICY "Admins can manage exams." ON public.exams
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Create exam_questions table
CREATE TABLE public.exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'short_answer'
  options JSONB, -- For multiple choice options
  correct_answer TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for exam_questions
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

-- Policy for exam_questions: Students can view questions for active exams
CREATE POLICY "Students can view questions for active exams." ON public.exam_questions
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    EXISTS (SELECT 1 FROM public.exams WHERE id = exam_id AND status = 'active')
  );

-- Policy for exam_questions: Admins can manage all exam questions
CREATE POLICY "Admins can manage exam_questions." ON public.exam_questions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Create exam_submissions table
CREATE TABLE public.exam_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- Store student answers as JSON
  score DECIMAL(5,2), -- Score out of total points
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_taken INTEGER, -- Time taken in minutes
  UNIQUE(exam_id, student_id) -- One submission per student per exam
);

-- Enable RLS for exam_submissions
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for exam_submissions: Students can view their own submissions
CREATE POLICY "Students can view their own submissions." ON public.exam_submissions
  FOR SELECT USING (auth.uid() = student_id);

-- Policy for exam_submissions: Students can insert their own submissions
CREATE POLICY "Students can submit exams." ON public.exam_submissions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Policy for exam_submissions: Admins can view and manage all submissions
CREATE POLICY "Admins can manage exam_submissions." ON public.exam_submissions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));
