import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HeroStats {
  alumniCount: string;
  yearsOfExcellence: string;
  achievements: string;
  departments: string;
}

export interface HeroRow {
  id: string;
  badge_text: string;
  title: string;
  subtitle: string;
  primary_btn: string;
  secondary_btn: string;
  bg_type: "image" | "video" | "gradient";
  bg_images?: string[];
  bg_video?: string;
  stats: HeroStats;
}

export const useHero = () => {
  const [hero, setHero] = useState<HeroRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      const { data, error } = await (supabase as any)
        .from("hero_content")
        .select("*")
        .single();

      if (!error && data) {
        setHero(data as HeroRow);
      }
      setLoading(false);
    };

    fetchHero();
  }, []);

  const updateHero = async (updates: Partial<HeroRow>) => {
    if (!hero) return;

    const { error } = await (supabase as any)
      .from("hero_content")
      .update(updates)
      .eq("id", hero.id);

    if (!error) {
      setHero({ ...hero, ...updates });
    }
  };

  return { hero, loading, updateHero };
};
