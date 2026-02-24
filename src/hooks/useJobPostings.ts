import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/* ======================================================
   TYPES
====================================================== */

export type ReferralType =
  | "direct_apply"
  | "resume_upload"
  | "internal_referral";

export interface JobPosting {
  id: string;
  alumni_id: string;

  title: string;
  company: string;
  description: string;

  location: string | null;
  apply_link: string | null;

  job_type: string | null;
  experience_required: string | null;
  salary_range: string | null;
  skills_required: string[] | null;

  responsibilities: string | null;
  eligibility: string | null;
  selection_process: string | null;
  application_deadline: string | null;

  referral_type: ReferralType;
  referral_slots: number | null;

  is_active: boolean;
  is_closed: boolean;

  created_at: string;
  updated_at: string;

  alumni?: {
    full_name: string;
    photo_url: string | null;
  };
}

/* ======================================================
   GET ALL ACTIVE + OPEN JOBS (Student Feed)
====================================================== */

export const useJobPostings = () => {
  return useQuery({
    queryKey: ["job-postings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_postings" as any)
        .select(`
          *,
          alumni:profiles!job_postings_alumni_id_fkey (
            full_name,
            photo_url
          )
        `)
        .eq("is_active", true)
        .eq("is_closed", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data as unknown as JobPosting[];
    },
  });
};

/* ======================================================
   GET MY JOB POSTINGS (Alumni Dashboard)
====================================================== */

export const useMyJobPostings = (profileId?: string) => {
  return useQuery({
    queryKey: ["my-job-postings", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .eq("alumni_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data as JobPosting[];
    },
    enabled: !!profileId,
  });
};

/* ======================================================
   CREATE JOB POSTING
====================================================== */

type CreateJobPostingInput = {
  alumni_id: string;
  title: string;
  company: string;
  description: string;

  location?: string | null;
  apply_link?: string | null;

  job_type?: string | null;
  experience_required?: string | null;
  salary_range?: string | null;
  skills_required?: string[] | null;

  responsibilities?: string | null;
  eligibility?: string | null;
  selection_process?: string | null;
  application_deadline?: string | null;

  referral_type: ReferralType;
  referral_slots?: number | null;
};

export const useCreateJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: CreateJobPostingInput) => {
      const { data, error } = await supabase
        .from("job_postings")
        .insert({
          ...job,
          is_active: true,
          is_closed: false,
        })
        .select()
        .single();

      if (error) throw error;

      return data as JobPosting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
      queryClient.invalidateQueries({ queryKey: ["my-job-postings"] });
    },
  });
};

/* ======================================================
   UPDATE JOB POSTING
====================================================== */

type UpdateJobPostingInput = Partial<
  Omit<JobPosting, "id" | "created_at" | "updated_at" | "alumni">
> & {
  id: string;
};

export const useUpdateJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateJobPostingInput) => {
      const { data, error } = await supabase
        .from("job_postings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return data as JobPosting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
      queryClient.invalidateQueries({ queryKey: ["my-job-postings"] });
    },
  });
};

/* ======================================================
   CLOSE JOB (Better than delete)
====================================================== */

export const useCloseJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_postings" as any)
        .update({ is_closed: true })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
      queryClient.invalidateQueries({ queryKey: ["my-job-postings"] });
    },
  });
};

/* ======================================================
   DELETE JOB (Hard Delete - Optional)
====================================================== */

export const useDeleteJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_postings")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
      queryClient.invalidateQueries({ queryKey: ["my-job-postings"] });
    },
  });
};