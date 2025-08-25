-- Creating comprehensive exam management system database schema

-- Enable RLS on all tables
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table if it doesn't exist (for user management)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create exams table
CREATE TABLE exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  allow_review BOOLEAN DEFAULT TRUE,
  show_results BOOLEAN DEFAULT TRUE,
  visibility TEXT DEFAULT 'all' CHECK (visibility IN ('all', 'specific', 'hidden')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on exams
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Create policies for exams
CREATE POLICY "Admins can manage all exams" ON exams FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Students can view active exams" ON exams FOR SELECT USING (
  status = 'active' AND 
  (visibility = 'all' OR 
   EXISTS (SELECT 1 FROM exam_visibility WHERE exam_id = id AND student_id = auth.uid()))
);

-- Create questions table
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'true_false', 'short_answer', 'essay', 'file_upload')),
  options JSONB, -- For MCQ options: {"A": "Option 1", "B": "Option 2", ...}
  correct_answer TEXT, -- For MCQ: "A", for true/false: "true"/"false"
  points INTEGER DEFAULT 1,
  file_url TEXT, -- For question attachments
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policies for questions
CREATE POLICY "Admins can manage all questions" ON questions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Students can view questions of active exams" ON questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM exams 
    WHERE id = exam_id 
    AND status = 'active'
    AND (visibility = 'all' OR 
         EXISTS (SELECT 1 FROM exam_visibility WHERE exam_id = exams.id AND student_id = auth.uid()))
  )
);

-- Create exam_visibility table (for specific student access)
CREATE TABLE exam_visibility (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- Enable RLS on exam_visibility
ALTER TABLE exam_visibility ENABLE ROW LEVEL SECURITY;

-- Create policies for exam_visibility
CREATE POLICY "Admins can manage exam visibility" ON exam_visibility FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Create submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  total_score DECIMAL(5,2) DEFAULT 0,
  max_score DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded', 'late')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- Enable RLS on submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for submissions
CREATE POLICY "Admins can view all submissions" ON submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Students can view own submissions" ON submissions FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can create own submissions" ON submissions FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can update own submissions" ON submissions FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "Admins can update all submissions" ON submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Create answers table
CREATE TABLE answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  student_answer TEXT,
  student_file_url TEXT, -- For file upload answers
  score DECIMAL(5,2) DEFAULT 0,
  feedback TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(submission_id, question_id)
);

-- Enable RLS on answers
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create policies for answers
CREATE POLICY "Admins can manage all answers" ON answers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Students can view own answers" ON answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM submissions WHERE id = submission_id AND student_id = auth.uid())
);
CREATE POLICY "Students can create own answers" ON answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM submissions WHERE id = submission_id AND student_id = auth.uid())
);
CREATE POLICY "Students can update own answers" ON answers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM submissions WHERE id = submission_id AND student_id = auth.uid())
);

-- Create indexes for better performance
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_created_by ON exams(created_by);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_questions_order ON questions(exam_id, order_index);
CREATE INDEX idx_submissions_exam_id ON submissions(exam_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_answers_submission_id ON answers(submission_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
