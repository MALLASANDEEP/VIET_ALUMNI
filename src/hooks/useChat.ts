import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  connection_id: string;
  sender_profile_id: string;
  content: string;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    photo_url: string | null;
  };
}

export const useConnectionMessages = (connectionId?: string) => {
  return useQuery({
    queryKey: ["chat", "messages", connectionId],
    queryFn: async () => {
      if (!connectionId) return [];

      const { data, error } = await supabase
        .from("chat_messages" as any)
        .select(`
          id,
          connection_id,
          sender_profile_id,
          content,
          created_at,
          sender:profiles!chat_messages_sender_profile_id_fkey (
            id,
            full_name,
            photo_url
          )
        `)
        .eq("connection_id", connectionId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      return (data || []) as unknown as ChatMessage[];
    },
    enabled: !!connectionId,
    refetchInterval: 2000, // Poll every 2 seconds for new messages
    staleTime: 0, // Always consider data stale to trigger refetch
  });
};

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      connectionId,
      senderProfileId,
      content,
    }: {
      connectionId: string;
      senderProfileId: string;
      content: string;
    }) => {
      const trimmed = content.trim();
      if (!trimmed) {
        throw new Error("Message cannot be empty");
      }

      const { error } = await supabase.from("chat_messages" as any).insert({
        connection_id: connectionId,
        sender_profile_id: senderProfileId,
        content: trimmed,
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", variables.connectionId] });
    },
  });
};

export const useDeleteChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, connectionId }: { messageId: string; connectionId: string }) => {
      console.log("Attempting to delete message:", messageId);
      
      const { error, data } = await supabase
        .from("chat_messages" as any)
        .delete()
        .eq("id", messageId);

      if (error) {
        console.error("Delete error:", error);
        throw new Error(`Failed to delete message: ${error.message}`);
      }
      
      console.log("Message deleted successfully:", data);
      return data;
    },
    onSuccess: (_, variables) => {
      console.log("Invalidating query for connection:", variables.connectionId);
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", variables.connectionId] });
    },
    onError: (error) => {
      console.error("Delete mutation error:", error);
    }
  });
};
