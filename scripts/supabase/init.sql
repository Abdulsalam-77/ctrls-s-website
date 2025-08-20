-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exams table
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    allow_review BOOLEAN DEFAULT TRUE,
    visibility_type TEXT DEFAULT 'all' CHECK (visibility_type IN ('all', 'selected')),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'true_false', 'open_ended')),
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create question_options table
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    option_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exam_visibility table (for selective student access)
CREATE TABLE IF NOT EXISTS public.exam_visibility (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, student_id)
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    is_submitted BOOLEAN DEFAULT FALSE,
    time_taken_minutes INTEGER,
    total_score INTEGER DEFAULT 0,
    max_possible_score INTEGER DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, student_id)
);

-- Create answers table
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.question_options(id),
    answer_text TEXT,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    instructor_feedback TEXT,
    is_graded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_submissions_exam_id ON public.submissions(exam_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_answers_submission_id ON public.answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_exam_visibility_exam_id ON public.exam_visibility(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_visibility_student_id ON public.exam_visibility(student_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for exams
CREATE POLICY "Exams are viewable by authenticated users" ON public.exams FOR SELECT TO authenticated USING (
    -- Admins can see all exams
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR
    -- Students can see active exams they have access to
    (
        is_active = true AND
        (
            visibility_type = 'all' 
            OR 
            EXISTS (SELECT 1 FROM public.exam_visibility WHERE exam_visibility.exam_id = exams.id AND exam_visibility.student_id = auth.uid())
        )
    )
);

CREATE POLICY "Only admins can modify exams" ON public.exams FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- RLS Policies for questions
CREATE POLICY "Questions are viewable by authenticated users" ON public.questions FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.exams 
        WHERE exams.id = questions.exam_id 
        AND (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
            OR
            (
                exams.is_active = true AND
                (
                    exams.visibility_type = 'all' 
                    OR 
                    EXISTS (SELECT 1 FROM public.exam_visibility WHERE exam_visibility.exam_id = exams.id AND exam_visibility.student_id = auth.uid())
                )
            )
        )
    )
);

CREATE POLICY "Only admins can modify questions" ON public.questions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- RLS Policies for question_options
CREATE POLICY "Question options are viewable by authenticated users" ON public.question_options FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.questions 
        JOIN public.exams ON exams.id = questions.exam_id
        WHERE questions.id = question_options.question_id 
        AND (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
            OR
            (
                exams.is_active = true AND
                (
                    exams.visibility_type = 'all' 
                    OR 
                    EXISTS (SELECT 1 FROM public.exam_visibility WHERE exam_visibility.exam_id = exams.id AND exam_visibility.student_id = auth.uid())
                )
            )
        )
    )
);

CREATE POLICY "Only admins can modify question options" ON public.question_options FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- RLS Policies for exam_visibility
CREATE POLICY "Exam visibility is viewable by admins and affected students" ON public.exam_visibility FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR
    student_id = auth.uid()
);

CREATE POLICY "Only admins can modify exam visibility" ON public.exam_visibility FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- RLS Policies for submissions
CREATE POLICY "Students can view their own submissions, admins can view all" ON public.submissions FOR SELECT USING (
    student_id = auth.uid() 
    OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

CREATE POLICY "Students can insert their own submissions" ON public.submissions FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can update their own submissions, admins can update all" ON public.submissions FOR UPDATE USING (
    student_id = auth.uid() 
    OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- RLS Policies for answers
CREATE POLICY "Students can view their own answers, admins can view all" ON public.answers FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.submissions WHERE submissions.id = answers.submission_id AND submissions.student_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

CREATE POLICY "Students can insert their own answers" ON public.answers FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.submissions WHERE submissions.id = answers.submission_id AND submissions.student_id = auth.uid())
);

CREATE POLICY "Students can update their own answers, admins can update all" ON public.answers FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.submissions WHERE submissions.id = answers.submission_id AND submissions.student_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-grade MCQ and True/False questions
CREATE OR REPLACE FUNCTION public.auto_grade_submission(submission_id_param UUID)
RETURNS VOID AS $$
DECLARE
    answer_record RECORD;
    total_score INTEGER := 0;
    max_score INTEGER := 0;
BEGIN
    -- Loop through all answers for this submission
    FOR answer_record IN 
        SELECT a.id, a.question_id, a.selected_option_id, q.points, q.question_type
        FROM public.answers a
        JOIN public.questions q ON q.id = a.question_id
        WHERE a.submission_id = submission_id_param
    LOOP
        max_score := max_score + answer_record.points;
        
        -- Auto-grade MCQ and True/False questions
        IF answer_record.question_type IN ('mcq', 'true_false') AND answer_record.selected_option_id IS NOT NULL THEN
            IF EXISTS (
                SELECT 1 FROM public.question_options 
                WHERE id = answer_record.selected_option_id AND is_correct = true
            ) THEN
                total_score := total_score + answer_record.points;
                UPDATE public.answers 
                SET points_earned = answer_record.points, is_graded = true, is_correct = true
                WHERE id = answer_record.id;
            ELSE
                UPDATE public.answers 
                SET points_earned = 0, is_graded = true, is_correct = false
                WHERE id = answer_record.id;
            END IF;
        END IF;
    END LOOP;
    
    -- Update submission with calculated scores
    UPDATE public.submissions 
    SET 
        total_score = total_score,
        max_possible_score = max_score,
        percentage = CASE WHEN max_score > 0 THEN (total_score::DECIMAL / max_score::DECIMAL) * 100 ELSE 0 END
    WHERE id = submission_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data for testing
INSERT INTO public.exams (title, description, duration_minutes, is_active, allow_review, visibility_type) VALUES
('JavaScript Fundamentals', 'Test your knowledge of JavaScript basics', 45, true, true, 'all'),
('React Components', 'Assessment on React component development', 60, true, true, 'all'),
('Database Design', 'Evaluate your database design skills', 90, false, true, 'all')
ON CONFLICT DO NOTHING;

-- Insert sample questions (only if exams exist)
DO $$
DECLARE
    js_exam_id UUID;
    react_exam_id UUID;
    q1_id UUID;
    q2_id UUID;
    q3_id UUID;
BEGIN
    -- Get exam IDs
    SELECT id INTO js_exam_id FROM public.exams WHERE title = 'JavaScript Fundamentals' LIMIT 1;
    SELECT id INTO react_exam_id FROM public.exams WHERE title = 'React Components' LIMIT 1;
    
    IF js_exam_id IS NOT NULL THEN
        -- Insert sample questions for JavaScript exam
        INSERT INTO public.questions (exam_id, question_text, question_type, points, order_index) VALUES
        (js_exam_id, 'What is the correct way to declare a variable in JavaScript?', 'mcq', 2, 1),
        (js_exam_id, 'JavaScript is a compiled language.', 'true_false', 1, 2),
        (js_exam_id, 'Explain the concept of closures in JavaScript.', 'open_ended', 5, 3)
        ON CONFLICT DO NOTHING;
        
        -- Get question IDs for options
        SELECT id INTO q1_id FROM public.questions WHERE exam_id = js_exam_id AND order_index = 1 LIMIT 1;
        SELECT id INTO q2_id FROM public.questions WHERE exam_id = js_exam_id AND order_index = 2 LIMIT 1;
        
        IF q1_id IS NOT NULL THEN
            -- Insert options for MCQ question
            INSERT INTO public.question_options (question_id, option_text, is_correct, option_order) VALUES
            (q1_id, 'var myVar = 5;', true, 1),
            (q1_id, 'variable myVar = 5;', false, 2),
            (q1_id, 'v myVar = 5;', false, 3),
            (q1_id, 'declare myVar = 5;', false, 4)
            ON CONFLICT DO NOTHING;
        END IF;
        
        IF q2_id IS NOT NULL THEN
            -- Insert options for True/False question
            INSERT INTO public.question_options (question_id, option_text, is_correct, option_order) VALUES
            (q2_id, 'True', false, 1),
            (q2_id, 'False', true, 2)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    
    IF react_exam_id IS NOT NULL THEN
        -- Insert sample questions for React exam
        INSERT INTO public.questions (exam_id, question_text, question_type, points, order_index) VALUES
        (react_exam_id, 'What is JSX?', 'mcq', 2, 1),
        (react_exam_id, 'React components must return a single parent element.', 'true_false', 1, 2)
        ON CONFLICT DO NOTHING;
        
        -- Get React question IDs
        SELECT id INTO q1_id FROM public.questions WHERE exam_id = react_exam_id AND order_index = 1 LIMIT 1;
        SELECT id INTO q2_id FROM public.questions WHERE exam_id = react_exam_id AND order_index = 2 LIMIT 1;
        
        IF q1_id IS NOT NULL THEN
            -- Insert options for React MCQ
            INSERT INTO public.question_options (question_id, option_text, is_correct, option_order) VALUES
            (q1_id, 'A JavaScript extension', true, 1),
            (q1_id, 'A CSS framework', false, 2),
            (q1_id, 'A database query language', false, 3),
            (q1_id, 'A server technology', false, 4)
            ON CONFLICT DO NOTHING;
        END IF;
        
        IF q2_id IS NOT NULL THEN
            -- Insert options for React True/False
            INSERT INTO public.question_options (question_id, option_text, is_correct, option_order) VALUES
            (q2_id, 'True', false, 1),
            (q2_id, 'False', true, 2)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;
