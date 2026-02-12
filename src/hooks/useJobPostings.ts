import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface JobPosting {
  id: string;
  alumni_id: string;
  title: string;
  company: string;
  description: string;
  location: string | null;
  apply_link: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  alumni?: {
    full_name: string;
    photo_url: string | null;
  };
}

export const useJobPostings = () => {
  return useQuery({
    queryKey: ["job-postings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_postings")
        .select(`
          *,
          alumni:profiles!job_postings_alumni_id_fkey (
            full_name,
            photo_url
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as JobPosting[];
    },
  });
};

export const useMyJobPostings = (profileId: string | undefined) => {
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

export const useCreateJobPosting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (job: {
      alumni_id: string;
      title: string;
      company: string;
      description: string;
      location?: string;
      apply_link?: string;
    }) => {
      const { data, error } = await supabase
        .from("job_postings")
        .insert(job)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
      queryClient.invalidateQueries({ queryKey: ["my-job-postings"] });
    },
  });
};

export const useUpdateJobPosting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobPosting> & { id: string }) => {
      const { data, error } = await supabase
        .from("job_postings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
      queryClient.invalidateQueries({ queryKey: ["my-job-postings"] });
    },
  });
};

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
