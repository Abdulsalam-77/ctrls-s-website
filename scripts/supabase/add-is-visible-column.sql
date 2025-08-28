-- Add is_visible column to exam_questions table
ALTER TABLE public.exam_questions 
ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;

-- Update RLS policies to consider visibility for students
DROP POLICY IF EXISTS "Students can view questions for active exams." ON public.exam_questions;

CREATE POLICY "Students can view visible questions for active exams." ON public.exam_questions
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    is_visible = TRUE AND
    EXISTS (SELECT 1 FROM public.exams WHERE id = exam_id AND status = 'active')
  );
