import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const HERO_TIMEOUT_MS = 8000;

const withTimeout = (promise, timeoutMs, message) => {
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error(message)), timeoutMs);
        promise
            .then((value) => resolve(value))
            .catch((error) => reject(error))
            .finally(() => window.clearTimeout(timer));
    });
};

const fallbackHero = {
    id: "fallback",
    badge_text: "VIET Alumni Network",
    title: "Welcome to VIET Alumni",
    subtitle: "Connecting students and alumni through opportunities and mentorship.",
    primary_btn: "Explore Alumni",
    secondary_btn: "Learn More",
    bg_type: "gradient",
    bg_images: [],
    stats: {
        alumniCount: "1000+",
        yearsOfExcellence: "10+",
        achievements: "500+",
        departments: "8+",
    },
};
export const useHero = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["hero"],
        queryFn: async () => {
            const { data, error } = await withTimeout(
                supabase
                    .from("hero_content")
                    .select("id, badge_text, title, subtitle, primary_btn, secondary_btn, bg_type, bg_images, stats")
                    .single(),
                HERO_TIMEOUT_MS,
                "Hero request timed out"
            );
            if (error) throw error;
            return data || fallbackHero;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 1,
    });

    const updateHero = useMutation({
        mutationFn: async (updates) => {
            const { data, error } = await supabase
                .from("hero_content")
                .update(updates)
                .eq("id", query.data?.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hero"] });
        },
    });

    return {
        hero: query.data,
        loading: query.isLoading,
        error: query.error,
        updateHero: updateHero.mutate,
    };
};
