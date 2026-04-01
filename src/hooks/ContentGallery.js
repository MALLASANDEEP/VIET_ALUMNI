import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export const useContentGallery = () => {
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ["content_gallery"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("content_gallery")
                .select("*")
                .single();
            if (error)
                throw error;
            return data;
        },
    });
    const updateContent = useMutation({
        mutationFn: async (payload) => {
            const { error } = await supabase
                .from("content_gallery")
                .update(payload)
                .eq("id", payload.id);
            if (error)
                throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["content_gallery"] });
        },
    });
    return {
        data: query.data ?? null,
        isLoading: query.isLoading,
        updateContent,
    };
};
