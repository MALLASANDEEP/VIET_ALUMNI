// src/hooks/useAlumniHero.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase
        .from("alumni_hero" as any)
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error("No hero found");

      return data as unknown as AlumniHero;
    },
    staleTime: 1000 * 60, // 1 min caching
    refetchOnWindowFocus: false,
  });
};
