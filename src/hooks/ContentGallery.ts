import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ContentGallery } from "@/types/contentgalleryinterface";

export const useContentGallery = () => {
  const queryClient = useQueryClient();

  const query = useQuery<ContentGallery>({
    queryKey: ["content_gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_gallery" as any)
        .select("*")
        .single();

      if (error) throw error;
      return data as unknown as ContentGallery;
    },
  });

  const updateContent = useMutation({
    mutationFn: async (payload: Partial<ContentGallery> & { id: string }) => {
      const { error } = await supabase
        .from("content_gallery" as any)
        .update(payload)
        .eq("id", payload.id);

      if (error) throw error;
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
