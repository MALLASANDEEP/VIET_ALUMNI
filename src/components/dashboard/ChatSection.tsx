import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/hooks/useProfile";
import { useAcceptedConnections } from "@/hooks/useConnections";
import { useConnectionMessages, useSendChatMessage, useDeleteChatMessage } from "@/hooks/useChat";
import { useAllConnectionsUnread } from "@/hooks/useAllConnectionsUnread";
import { toast } from "@/hooks/use-toast";

interface ChatSectionProps {
  profile: Profile;
  unreadBadge?: number;
}

const ChatSection = ({ profile, unreadBadge = 0 }: ChatSectionProps) => {
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const { data: connections = [], isLoading: connectionsLoading } = useAcceptedConnections(profile.id);
  
  // Track unread messages across ALL connections
  const { unreadCounts, markAsRead, totalUnread } = useAllConnectionsUnread(connections, profile.id);

  useEffect(() => {
    if (!selectedConnectionId && connections.length > 0) {
      setSelectedConnectionId(connections[0].id);
    }
  }, [connections, selectedConnectionId]);

  // Mark as read when viewing a connection
  useEffect(() => {
    if (selectedConnectionId) {
      markAsRead(selectedConnectionId);
    }
  }, [selectedConnectionId, markAsRead]);

  const activeConnection = useMemo(
    () => connections.find((item) => item.id === selectedConnectionId) || null,
    [connections, selectedConnectionId]
  );

  const { data: messages = [], isLoading: messagesLoading } = useConnectionMessages(selectedConnectionId || undefined);
  const sendMessage = useSendChatMessage();
  const deleteMessage = useDeleteChatMessage();

  const handleSend = async () => {
    if (!selectedConnectionId || !draft.trim()) return;
    await sendMessage.mutateAsync({
      connectionId: selectedConnectionId,
      senderProfileId: profile.id,
      content: draft,
    });
    setDraft("");
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConnectionId) return;
    try {
      console.log("Delete handler called for:", messageId);
      await deleteMessage.mutateAsync({
        messageId,
        connectionId: selectedConnectionId,
      });
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete error in handler:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete message. Make sure you're the sender.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gold" />
          Chat
          {unreadBadge > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {unreadBadge}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {connectionsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : connections.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">
            No active connections yet. Accept a connection request to start chatting.
          </p>
        ) : (
          <div className="grid md:grid-cols-[260px_1fr] gap-4">
            <div className="space-y-2">
              {connections.map((connection) => {
                const hasUnread = unreadCounts[connection.id] > 0;
                return (
                  <button
                    key={connection.id}
                    className={`w-full text-left rounded-lg border px-3 py-2 transition-all ${
                      selectedConnectionId === connection.id
                        ? "bg-gold/10 border-gold/40"
                        : hasUnread
                        ? "bg-destructive/5 border-destructive/30 hover:bg-destructive/10"
                        : "bg-background hover:bg-muted/40"
                    }`}
                    onClick={() => setSelectedConnectionId(connection.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium truncate ${hasUnread ? "text-destructive font-semibold" : ""}`}>
                            {connection.other_profile.full_name}
                          </p>
                          {hasUnread && <div className="w-2 h-2 rounded-full bg-destructive shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {connection.other_profile.current_position || connection.other_profile.company || "Connection"}
                        </p>
                      </div>
                      {hasUnread && (
                        <Badge variant="destructive" className="ml-2 shrink-0 text-xs">
                          {unreadCounts[connection.id]}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border rounded-xl p-3 flex flex-col h-[460px]">
              <div className="pb-2 border-b mb-3">
                <p className="font-semibold">{activeConnection?.other_profile.full_name || "Select connection"}</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-gold" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Say hello and start the conversation.
                  </p>
                ) : (
                  messages.map((message) => {
                    const mine = message.sender_profile_id === profile.id;
                    return (
                      <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"} group`}>
                        <div className="flex items-end gap-2">
                          <div
                            className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                              mine ? "bg-gold text-black" : "bg-muted"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-[10px] mt-1 ${mine ? "text-black/70" : "text-muted-foreground"}`}>
                              {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          {mine && (
                            <button
                              onClick={() => handleDeleteMessage(message.id)}
                              disabled={deleteMessage.isPending}
                              className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                                deleteMessage.isPending 
                                  ? "bg-destructive/20 cursor-not-allowed" 
                                  : "hover:bg-destructive/20"
                              }`}
                              title="Delete message"
                            >
                              {deleteMessage.isPending ? (
                                <Loader2 className="w-4 h-4 text-destructive animate-spin" />
                              ) : (
                                <X className="w-4 h-4 text-destructive" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-3 border-t mt-3 flex gap-2">
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type your message"
                  disabled={!selectedConnectionId || sendMessage.isPending}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                />
                <Button onClick={() => void handleSend()} disabled={!selectedConnectionId || sendMessage.isPending}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatSection;
