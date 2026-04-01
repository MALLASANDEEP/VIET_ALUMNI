import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
const HERO_TIMEOUT_MS = 8000;
const HERO_CACHE_KEY = "hero-content-cache-v1";
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
    const [hero, setHero] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let isMounted = true;
        let hasCachedHero = false;
        try {
            const cached = localStorage.getItem(HERO_CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                setHero(parsed);
                setLoading(false);
                hasCachedHero = true;
            }
        }
        catch {
            // Ignore cache parse issues and continue with network fetch.
        }
        const fetchHero = async () => {
            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), HERO_TIMEOUT_MS);
            try {
                const { data, error } = await supabase
                    .from("hero_content")
                    .select("*")
                    .single()
                    .abortSignal(controller.signal);
                if (error) {
                    throw error;
                }
                if (data && isMounted) {
                    const nextHero = data;
                    setHero(nextHero);
                    localStorage.setItem(HERO_CACHE_KEY, JSON.stringify(nextHero));
                }
            }
            catch (error) {
                console.warn("Hero fetch fallback triggered:", error);
                if (isMounted && !hasCachedHero) {
                    setHero(fallbackHero);
                }
            }
            finally {
                window.clearTimeout(timeoutId);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        void fetchHero();
        return () => {
            isMounted = false;
        };
    }, []);
    const updateHero = async (updates) => {
        if (!hero)
            return;
        const { error } = await supabase
            .from("hero_content")
            .update(updates)
            .eq("id", hero.id);
        if (!error) {
            setHero({ ...hero, ...updates });
            localStorage.setItem(HERO_CACHE_KEY, JSON.stringify({ ...hero, ...updates }));
        }
    };
    return { hero, loading, updateHero };
};
