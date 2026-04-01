import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
/* ======================================================
   GET ALL ACTIVE + OPEN JOBS (Student Feed)
====================================================== */
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
                .eq("is_closed", false)
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            return data;
        },
    });
};
/* ======================================================
   GET MY JOB POSTINGS (Alumni Dashboard)
====================================================== */
export const useMyJobPostings = (profileId) => {
    return useQuery({
        queryKey: ["my-job-postings", profileId],
        queryFn: async () => {
            if (!profileId)
                return [];
            const { data, error } = await supabase
                .from("job_postings")
                .select("*")
                .eq("alumni_id", profileId)
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            return data;
        },
        enabled: !!profileId,
    });
};
export const useCreateJobPosting = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (job) => {
            const { data, error } = await supabase
                .from("job_postings")
                .insert({
                ...job,
                is_active: true,
                is_closed: false,
            })
                .select()
                .single();
            if (error)
                throw error;
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
        mutationFn: async ({ id, ...updates }) => {
            const { data, error } = await supabase
                .from("job_postings")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error)
                throw error;
            return data;
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
        mutationFn: async (id) => {
            const { error } = await supabase
                .from("job_postings")
                .update({ is_closed: true })
                .eq("id", id);
            if (error)
                throw error;
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
        mutationFn: async (id) => {
            const { error } = await supabase
                .from("job_postings")
                .delete()
                .eq("id", id);
            if (error)
                throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["job-postings"] });
            queryClient.invalidateQueries({ queryKey: ["my-job-postings"] });
        },
    });
};
