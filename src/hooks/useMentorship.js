import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export const useMentorshipOffers = () => {
    return useQuery({
        queryKey: ["mentorship-offers"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("mentorship_offers")
                .select(`
          *,
          alumni:profiles!mentorship_offers_alumni_id_fkey (
            full_name,
            photo_url,
            company,
            current_position
          )
        `)
                .eq("is_available", true)
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            return data;
        },
    });
};
export const useMyMentorshipOffers = (profileId) => {
    return useQuery({
        queryKey: ["my-mentorship-offers", profileId],
        queryFn: async () => {
            if (!profileId)
                return [];
            const { data, error } = await supabase
                .from("mentorship_offers")
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
export const useCreateMentorshipOffer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (offer) => {
            const { data, error } = await supabase
                .from("mentorship_offers")
                .insert(offer)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mentorship-offers"] });
            queryClient.invalidateQueries({ queryKey: ["my-mentorship-offers"] });
        },
    });
};
export const useUpdateMentorshipOffer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }) => {
            const { data, error } = await supabase
                .from("mentorship_offers")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mentorship-offers"] });
            queryClient.invalidateQueries({ queryKey: ["my-mentorship-offers"] });
        },
    });
};
export const useDeleteMentorshipOffer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from("mentorship_offers")
                .delete()
                .eq("id", id);
            if (error)
                throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mentorship-offers"] });
            queryClient.invalidateQueries({ queryKey: ["my-mentorship-offers"] });
        },
    });
};
