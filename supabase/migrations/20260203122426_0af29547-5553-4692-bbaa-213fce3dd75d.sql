-- Create job_postings table
CREATE TABLE public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumni_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  apply_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on job_postings
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- Job postings RLS policies
CREATE POLICY "Anyone approved can view active jobs" ON public.job_postings
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.status = 'approved'
    )
  );

CREATE POLICY "Alumni can insert own jobs" ON public.job_postings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = alumni_id 
        AND p.user_id = auth.uid() 
        AND p.status = 'approved'
    ) AND
    public.has_role(auth.uid(), 'alumni')
  );

CREATE POLICY "Alumni can update own jobs" ON public.job_postings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = alumni_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Alumni can delete own jobs" ON public.job_postings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = alumni_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all jobs" ON public.job_postings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger for job_postings
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create mentorship_offers table
CREATE TABLE public.mentorship_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumni_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  expertise_areas TEXT[],
  contact_email TEXT,
  contact_phone TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on mentorship_offers
ALTER TABLE public.mentorship_offers ENABLE ROW LEVEL SECURITY;

-- Mentorship offers RLS policies
CREATE POLICY "Approved users can view available mentorships" ON public.mentorship_offers
  FOR SELECT USING (
    is_available = true AND
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.status = 'approved'
    )
  );

CREATE POLICY "Alumni can insert own mentorship" ON public.mentorship_offers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = alumni_id 
        AND p.user_id = auth.uid() 
        AND p.status = 'approved'
    ) AND
    public.has_role(auth.uid(), 'alumni')
  );

CREATE POLICY "Alumni can update own mentorship" ON public.mentorship_offers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = alumni_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Alumni can delete own mentorship" ON public.mentorship_offers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = alumni_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all mentorships" ON public.mentorship_offers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger for mentorship_offers
CREATE TRIGGER update_mentorship_offers_updated_at
  BEFORE UPDATE ON public.mentorship_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();