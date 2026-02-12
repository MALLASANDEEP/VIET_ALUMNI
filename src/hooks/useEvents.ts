import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventItem } from "@/types/event";

export const useEvents = () => {
  const queryClient = useQueryClient();

  // Fetch section + only future events
  const fetchEvents = async (): Promise<EventItem[]> => {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("events" as any)
      .select("*")
      .or(`type.eq.section,and(type.eq.event,event_date.gte.${today})`)
      .order("event_date", { ascending: true });

    if (error) throw error;
    return data as unknown as EventItem[];
  };

  const { data = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  // Add Event
  const addEvent = useMutation({
    mutationFn: async (event: Partial<EventItem>) => {
      const { error } = await supabase
        .from("events" as any)
        .insert(event);

      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  // Delete Event
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("events" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  // Update Section
  const updateSection = useMutation({
    mutationFn: async (data: Partial<EventItem>) => {
      const { error } = await supabase
        .from("events" as any)
        .update(data)
        .eq("type", "section");

      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  // Update Event
  const updateEvent = useMutation({
    mutationFn: async (event: Partial<EventItem>) => {
      if (!event.id) throw new Error("Event ID is required");

      const { id, ...rest } = event;

      const { error } = await supabase
        .from("events" as any)
        .update(rest)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  return {
    data,
    isLoading,
    addEvent,
    deleteEvent,
    updateSection,
    updateEvent,
  };
};

export default useEvents;
