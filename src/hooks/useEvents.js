import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export const useEvents = () => {
    const queryClient = useQueryClient();
    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .order("event_date", { ascending: true });
        if (error)
            throw error;
        return data;
    };
    const { data = [], isLoading } = useQuery({
        queryKey: ["events"],
        queryFn: fetchEvents,
    });
    const addEvent = useMutation({
        mutationFn: async (event) => {
            const { error } = await supabase.from("events").insert(event);
            if (error)
                throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
    });
    const deleteEvent = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from("events").delete().eq("id", id);
            if (error)
                throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
    });
    const updateSection = useMutation({
        mutationFn: async (sectionData) => {
            // 1. Check if a section record already exists
            const { data } = await supabase
                .from("events")
                .select("id")
                .eq("type", "section")
                .maybeSingle();
            // ✅ FIX: Convert to unknown first, then to our desired type 
            // This satisfies the TS compiler when types don't overlap.
            const existing = data;
            if (existing && existing.id) {
                // 2. Update existing
                const { error } = await supabase
                    .from("events")
                    .update({
                    title: sectionData.title,
                    description: sectionData.description,
                })
                    .eq("id", existing.id);
                if (error)
                    throw error;
            }
            else {
                // 3. Create new if not found
                const { error } = await supabase.from("events").insert({
                    title: sectionData.title,
                    description: sectionData.description,
                    type: "section",
                    event_date: new Date().toISOString().split("T")[0],
                    venue: "Global",
                });
                if (error)
                    throw error;
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
    });
    const updateEvent = useMutation({
        mutationFn: async (event) => {
            if (!event.id)
                throw new Error("Event ID is required");
            const { id, ...rest } = event;
            const { error } = await supabase.from("events").update(rest).eq("id", id);
            if (error)
                throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
    });
    return { data, isLoading, addEvent, deleteEvent, updateSection, updateEvent };
};
export default useEvents;
