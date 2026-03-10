import { useEffect, useState, useCallback } from "react";
import { useQueries } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UnreadStatus {
  [connectionId: string]: number;
}

const UNREAD_KEY_PREFIX = "chat_last_viewed_";

export const useAllConnectionsUnread = (
  connections: any[] = [],
  profileId: string | undefined
) => {
  const [unreadCounts, setUnreadCounts] = useState<UnreadStatus>({});

  // Query messages for all connections in parallel
  const messageQueries = useQueries({
    queries: connections.map((connection) => ({
      queryKey: ["chat", "unread", connection.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("chat_messages" as any)
          .select("id, sender_profile_id, created_at")
          .eq("connection_id", connection.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        return { connectionId: connection.id, messages: data || [] };
      },
      enabled: !!connection.id && !!profileId,
      refetchInterval: 3000, // Poll every 3 seconds
      staleTime: 0,
    })),
  });

  // Calculate unread counts whenever messages update
  useEffect(() => {
    if (!profileId) return;

    const newCounts: UnreadStatus = {};

    messageQueries.forEach((query) => {
      if (query.data) {
        const { connectionId, messages } = query.data;
        const lastViewedKey = `${UNREAD_KEY_PREFIX}${connectionId}`;
        const lastViewed = localStorage.getItem(lastViewedKey);
        const lastViewedTime = lastViewed ? new Date(lastViewed).getTime() : 0;

        const unreadCount = messages.filter((msg: any) => {
          const msgTime = new Date(msg.created_at).getTime();
          return msgTime > lastViewedTime && msg.sender_profile_id !== profileId;
        }).length;

        newCounts[connectionId] = unreadCount;
      }
    });

    setUnreadCounts(newCounts);
  }, [messageQueries, profileId]);

  // Mark messages as read when viewing a connection
  const markAsRead = useCallback((connId: string) => {
    const lastViewedKey = `${UNREAD_KEY_PREFIX}${connId}`;
    localStorage.setItem(lastViewedKey, new Date().toISOString());
    setUnreadCounts((prev) => ({
      ...prev,
      [connId]: 0,
    }));
  }, []);

  // Get total unread count
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  const isLoading = messageQueries.some((q) => q.isLoading);

  return { unreadCounts, markAsRead, totalUnread, isLoading };
};
