// src/hooks/useAlumniHero.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ALUMNI_HERO_TIMEOUT_MS = 9000;

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    promise
      .then((value) => resolve(value))
      .catch((error) => reject(error))
      .finally(() => window.clearTimeout(timer));
  });
};

export interface AlumniHero {
  id: string;
  title: string;
  subtitle: string;
  apply_text: string;
  apply_url: string;
  bg_type: "image" | "video" | "gradient";
  bg_images: string[];
  bg_video?: string;
}

export const useAlumniHero = () => {
  return useQuery<AlumniHero, Error>({
    queryKey: ["alumniHero"],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase
          .from("alumni_hero" as any)
          .select("*")
          .single(),
        ALUMNI_HERO_TIMEOUT_MS,
        "Alumni hero request timed out"
      );

      if (error) throw new Error(error.message);
      if (!data) throw new Error("No hero found");

      return data as unknown as AlumniHero;
    },
    staleTime: 1000 * 60, // 1 min caching
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
