import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
/* ---------------- FETCH HERO ---------------- */
export const useGalleryHero = () => {
    return useQuery({
        queryKey: ["gallery-hero"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("gallery_hero")
                .select("*")
                .limit(1);
            if (error)
                throw new Error(error.message);
            return data?.[0] ?? null;
        },
        staleTime: 1000 * 60 * 5,
    });
};
/* ---------------- UPDATE HERO (ADMIN) ---------------- */
export const useUpdateGalleryHero = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (hero) => {
            if (!hero.id)
                throw new Error("Hero ID is required");
            const { error } = await supabase
                .from("gallery_hero")
                .update({
                title: hero.title,
                subtitle: hero.subtitle,
                bg_image: hero.bg_image,
                updated_at: new Date().toISOString(),
            })
                .eq("id", hero.id);
            if (error)
                throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gallery-hero"] });
            toast({
                title: "Updated",
                description: "Gallery hero updated successfully",
            });
        },
        onError: (error) => {
            toast({
                title: "Update failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });
};
