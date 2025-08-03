-- Drop existing trigger and function if they exist to allow recreation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Drop existing tables if they exist to allow recreation with new schema
DROP TABLE IF EXISTS public.student_content_assignments CASCADE;
DROP TABLE IF EXISTS public.content_items CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

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
