-- Create alumni table
CREATE TABLE public.alumni (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  batch TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT,
  photo_url TEXT,
  current_position TEXT,
  company TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create faculty table
CREATE TABLE public.faculty (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gallery_images table
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Public read policies (anyone can view alumni, faculty, gallery)
CREATE POLICY "Anyone can view alumni" ON public.alumni FOR SELECT USING (true);
CREATE POLICY "Anyone can view faculty" ON public.faculty FOR SELECT USING (true);
CREATE POLICY "Anyone can view gallery" ON public.gallery_images FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Admins can insert alumni" ON public.alumni FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update alumni" ON public.alumni FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete alumni" ON public.alumni FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert faculty" ON public.faculty FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update faculty" ON public.faculty FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete faculty" ON public.faculty FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert gallery" ON public.gallery_images FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update gallery" ON public.gallery_images FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete gallery" ON public.gallery_images FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('alumni-photos', 'alumni-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('faculty-photos', 'faculty-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-images', 'gallery-images', true);

-- Storage policies for public read
CREATE POLICY "Public can view alumni photos" ON storage.objects FOR SELECT USING (bucket_id = 'alumni-photos');
CREATE POLICY "Public can view faculty photos" ON storage.objects FOR SELECT USING (bucket_id = 'faculty-photos');
CREATE POLICY "Public can view gallery images" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-images');

-- Storage policies for admin uploads
CREATE POLICY "Admins can upload alumni photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'alumni-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can upload faculty photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'faculty-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can upload gallery images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete alumni photos" ON storage.objects FOR DELETE USING (bucket_id = 'alumni-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete faculty photos" ON storage.objects FOR DELETE USING (bucket_id = 'faculty-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete gallery images" ON storage.objects FOR DELETE USING (bucket_id = 'gallery-images' AND public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers
CREATE TRIGGER update_alumni_updated_at BEFORE UPDATE ON public.alumni FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON public.faculty FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();