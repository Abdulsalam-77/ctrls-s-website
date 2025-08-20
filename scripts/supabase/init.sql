-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'true_false', 'open_ended')),
  points INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create question_options table
CREATE TABLE IF NOT EXISTS question_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  option_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  is_submitted BOOLEAN DEFAULT FALSE,
  time_taken_minutes INTEGER,
  total_score DECIMAL(5,2),
  max_score DECIMAL(5,2),
  is_graded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
  score DECIMAL(5,2),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(submission_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exams_created_by ON exams(created_by);
CREATE INDEX IF NOT EXISTS idx_exams_is_published ON exams(is_published);
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_submissions_exam_id ON submissions(exam_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_answers_submission_id ON answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for exams
CREATE POLICY "Anyone can view published exams" ON exams
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all exams" ON exams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Creators can manage their own exams" ON exams
  FOR ALL USING (created_by = auth.uid());

-- RLS Policies for questions
CREATE POLICY "Users can view questions of accessible exams" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exams 
      WHERE id = questions.exam_id 
      AND (is_published = true OR created_by = auth.uid())
    )
  );

CREATE POLICY "Admins can manage all questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Exam creators can manage questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM exams 
      WHERE id = questions.exam_id AND created_by = auth.uid()
    )
  );

-- RLS Policies for question_options
CREATE POLICY "Users can view options of accessible questions" ON question_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questions q
      JOIN exams e ON e.id = q.exam_id
      WHERE q.id = question_options.question_id 
      AND (e.is_published = true OR e.created_by = auth.uid())
    )
  );

CREATE POLICY "Admins can manage all question options" ON question_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Question creators can manage options" ON question_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM questions q
      JOIN exams e ON e.id = q.exam_id
      WHERE q.id = question_options.question_id AND e.created_by = auth.uid()
    )
  );

-- RLS Policies for submissions
CREATE POLICY "Students can view their own submissions" ON submissions
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create their own submissions" ON submissions
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own submissions" ON submissions
  FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "Admins can view all submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Exam creators can view submissions for their exams" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exams 
      WHERE id = submissions.exam_id AND created_by = auth.uid()
    )
  );

-- RLS Policies for answers
CREATE POLICY "Students can manage their own answers" ON answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM submissions 
      WHERE id = answers.submission_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all answers" ON answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Exam creators can manage answers for their exams" ON answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM submissions s
      JOIN exams e ON e.id = s.exam_id
      WHERE s.id = answers.submission_id AND e.created_by = auth.uid()
    )
  );

-- Function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to auto-grade objective questions
CREATE OR REPLACE FUNCTION auto_grade_submission(submission_id_param UUID)
RETURNS VOID AS $$
DECLARE
  answer_record RECORD;
  correct_option_id UUID;
  question_points INTEGER;
BEGIN
  -- Loop through all answers for this submission
  FOR answer_record IN 
    SELECT a.id, a.question_id, a.selected_option_id, q.points, q.question_type
    FROM answers a
    JOIN questions q ON q.id = a.question_id
    WHERE a.submission_id = submission_id_param
    AND q.question_type IN ('mcq', 'true_false')
  LOOP
    -- Get the correct option for this question
    SELECT id INTO correct_option_id
    FROM question_options
    WHERE question_id = answer_record.question_id
    AND is_correct = true
    LIMIT 1;

    -- Assign score based on whether the selected option is correct
    IF answer_record.selected_option_id = correct_option_id THEN
      question_points := answer_record.points;
    ELSE
      question_points := 0;
    END IF;

    -- Update the answer with the score
    UPDATE answers
    SET score = question_points
    WHERE id = answer_record.id;
  END LOOP;

  -- Update submission totals for objective questions only
  UPDATE submissions
  SET 
    total_score = (
      SELECT COALESCE(SUM(a.score), 0)
      FROM answers a
      JOIN questions q ON q.id = a.question_id
      WHERE a.submission_id = submission_id_param
      AND q.question_type IN ('mcq', 'true_false')
    ),
    max_score = (
      SELECT COALESCE(SUM(q.points), 0)
      FROM answers a
      JOIN questions q ON q.id = a.question_id
      WHERE a.submission_id = submission_id_param
    ),
    is_graded = (
      -- Only mark as graded if there are no open-ended questions
      NOT EXISTS (
        SELECT 1
        FROM answers a
        JOIN questions q ON q.id = a.question_id
        WHERE a.submission_id = submission_id_param
        AND q.question_type = 'open_ended'
      )
    )
  WHERE id = submission_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-grade when submission is marked as submitted
CREATE OR REPLACE FUNCTION trigger_auto_grade()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_submitted = true AND OLD.is_submitted = false THEN
    PERFORM auto_grade_submission(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_grade_on_submit ON submissions;
CREATE TRIGGER auto_grade_on_submit
  AFTER UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION trigger_auto_grade();

-- Insert sample data
INSERT INTO profiles (id, email, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@ctrls-s.com', 'Admin User', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'student@example.com', 'John Doe', 'student')
ON CONFLICT (id) DO NOTHING;

-- Insert sample exam
INSERT INTO exams (id, title, description, duration_minutes, is_published, created_by) VALUES
  ('11111111-1111-1111-1111-111111111111', 'JavaScript Fundamentals', 'Test your knowledge of JavaScript basics', 45, true, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample questions
INSERT INTO questions (id, exam_id, question_text, question_type, points, order_index) VALUES
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'What is the correct way to declare a variable in JavaScript?', 'mcq', 2, 0),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'JavaScript is a compiled language.', 'true_false', 1, 1),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Explain the difference between let, const, and var in JavaScript.', 'open_ended', 5, 2)
ON CONFLICT (id) DO NOTHING;

-- Insert sample question options
INSERT INTO question_options (question_id, option_text, is_correct, option_order) VALUES
  ('22222222-2222-2222-2222-222222222221', 'var myVar = 5;', true, 0),
  ('22222222-2222-2222-2222-222222222221', 'variable myVar = 5;', false, 1),
  ('22222222-2222-2222-2222-222222222221', 'v myVar = 5;', false, 2),
  ('22222222-2222-2222-2222-222222222221', 'declare myVar = 5;', false, 3),
  ('22222222-2222-2222-2222-222222222222', 'True', false, 0),
  ('22222222-2222-2222-2222-222222222222', 'False', true, 1)
ON CONFLICT DO NOTHING;
