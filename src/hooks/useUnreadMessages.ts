import { useEffect, useState } from "react";
import { useConnectionMessages } from "./useChat";

interface UnreadStatus {
  [connectionId: string]: number;
}

const UNREAD_KEY_PREFIX = "chat_last_viewed_";

export const useUnreadMessages = (connectionId: string | null, profileId: string | undefined) => {
  const [unreadCounts, setUnreadCounts] = useState<UnreadStatus>({});
  const { data: messages = [] } = useConnectionMessages(connectionId || undefined);

  // Calculate unread messages for current connection
  useEffect(() => {
    if (!connectionId || !profileId) return;

    const lastViewedKey = `${UNREAD_KEY_PREFIX}${connectionId}`;
    const lastViewed = localStorage.getItem(lastViewedKey);
    const lastViewedTime = lastViewed ? new Date(lastViewed).getTime() : 0;

    const unreadCount = messages.filter((msg) => {
      const msgTime = new Date(msg.created_at).getTime();
      return msgTime > lastViewedTime && msg.sender_profile_id !== profileId;
    }).length;

    setUnreadCounts((prev) => ({
      ...prev,
      [connectionId]: unreadCount,
    }));
  }, [messages, connectionId, profileId]);

  // Mark messages as read when viewing a connection
  const markAsRead = (connId: string) => {
    const lastViewedKey = `${UNREAD_KEY_PREFIX}${connId}`;
    localStorage.setItem(lastViewedKey, new Date().toISOString());
    setUnreadCounts((prev) => ({
      ...prev,
      [connId]: 0,
    }));
  };

  // Get total unread count
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return { unreadCounts, markAsRead, totalUnread };
};

// Hook to track unread messages across all connections
export const useAllConnectionsUnreadMessages = (
  connections: any[] = [],
  profileId: string | undefined
) => {
  const [allUnreadCounts, setAllUnreadCounts] = useState<UnreadStatus>({});

  useEffect(() => {
    if (!profileId) return;

    const newCounts: UnreadStatus = {};

    connections.forEach((connection) => {
      // This is a simplified approach - in practice, you'd need to fetch all messages
      // For now, we'll rely on the local storage tracking
      const lastViewedKey = `${UNREAD_KEY_PREFIX}${connection.id}`;
      const lastViewed = localStorage.getItem(lastViewedKey);
      
      // This will be updated when useUnreadMessages is called for each connection
      newCounts[connection.id] = 0;
    });

    setAllUnreadCounts(newCounts);
  }, [connections, profileId]);

  const getTotalUnread = () => {
    return Object.values(allUnreadCounts).reduce((sum, count) => sum + count, 0);
  };

  const syncUnreadCount = (connectionId: string, count: number) => {
    setAllUnreadCounts((prev) => ({
      ...prev,
      [connectionId]: count,
    }));
  };

  return { allUnreadCounts, getTotalUnread, syncUnreadCount };
};
