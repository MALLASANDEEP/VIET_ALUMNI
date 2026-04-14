// src/hooks/useAlumniHero.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const ALUMNI_HERO_TIMEOUT_MS = 9000;
const withTimeout = (promise, timeoutMs, message) => {
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error(message)), timeoutMs);
        promise
            .then((value) => resolve(value))
            .catch((error) => reject(error))
            .finally(() => window.clearTimeout(timer));
    });
};
export const useAlumniHero = () => {
    return useQuery({
        queryKey: ["alumniHero"],
        queryFn: async () => {
            const { data, error } = await withTimeout(supabase
                .from("alumni_hero")
                .select("id, title, subtitle, bg_image, created_at, updated_at")
                .single(), ALUMNI_HERO_TIMEOUT_MS, "Alumni hero request timed out");
            if (error)
                throw new Error(error.message);
            if (!data)
                throw new Error("No hero found");
            return data;
        },
        staleTime: 1000 * 60, // 1 min caching
        refetchOnWindowFocus: false,
        retry: 1,
    });
};
