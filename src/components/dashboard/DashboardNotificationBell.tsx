import { useEffect, useRef } from "react";
import { Bell, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Profile } from "@/hooks/useProfile";
import {
  useIncomingConnectionRequests,
  useOutgoingConnectionRequests,
  useRespondConnectionRequest,
} from "@/hooks/useConnections";

interface DashboardNotificationBellProps {
  profile: Profile;
}

const DashboardNotificationBell = ({ profile }: DashboardNotificationBellProps) => {
  const { data: incoming = [], isLoading: incomingLoading } = useIncomingConnectionRequests(profile.id);
  const { data: outgoing = [], isLoading: outgoingLoading } = useOutgoingConnectionRequests(profile.id);
  const respond = useRespondConnectionRequest();
  const previousOutgoingStatusRef = useRef<Record<string, string>>({});

  const pendingIncoming = incoming.filter((request) => request.status === "pending");
  const responseUpdates = outgoing.filter((request) => request.status !== "pending");
  const recentOutgoing = outgoing.slice(0, 5);
  
  // Only count responses from last 10 minutes in badge to avoid stale notifications
  const TEN_MINUTES = 10 * 60 * 1000;
  const recentResponses = responseUpdates.filter((request) => {
    if (!request.responded_at) return false;
    const respondedTime = new Date(request.responded_at).getTime();
    const timeSinceResponse = Date.now() - respondedTime;
    return timeSinceResponse < TEN_MINUTES;
  });
  const badgeCount = pendingIncoming.length + recentResponses.length;

  useEffect(() => {
    const previousStatus = previousOutgoingStatusRef.current;

    for (const request of outgoing) {
      const before = previousStatus[request.id];
      const now = request.status;

      if (before === "pending" && (now === "accepted" || now === "rejected")) {
        toast({
          title: now === "accepted" ? "Connection accepted" : "Connection rejected",
          description:
            now === "accepted"
              ? `${request.receiver?.full_name || "Alumni"} accepted your request.`
              : `${request.receiver?.full_name || "Alumni"} rejected your request.`,
        });
      }
    }

    previousOutgoingStatusRef.current = Object.fromEntries(
      outgoing.map((request) => [request.id, request.status])
    );
  }, [outgoing]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:text-gold">
          <Bell className="w-5 h-5" />
          {badgeCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 min-w-5 h-5 px-1 rounded-full bg-destructive text-white text-[10px] font-semibold flex items-center justify-center">
              {badgeCount > 9 ? "9+" : badgeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={10} className="w-[360px] p-0">
        <div className="border-b px-4 py-3">
          <p className="font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">Connection requests and updates</p>
        </div>

        <ScrollArea className="h-[380px]">
          <div className="p-4 space-y-5">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Incoming Requests</p>
                <Badge variant="outline">{pendingIncoming.length}</Badge>
              </div>

              {incomingLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gold" />
                </div>
              ) : pendingIncoming.length === 0 ? (
                <p className="text-xs text-muted-foreground">No pending requests.</p>
              ) : (
                pendingIncoming.map((request) => (
                  <div key={request.id} className="rounded-lg border p-3 bg-muted/30">
                    <p className="text-sm font-medium">{request.sender?.full_name || "User"}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      wants to connect with you
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="h-8 px-3 text-xs gap-1"
                        disabled={respond.isPending}
                        onClick={() =>
                          respond.mutate({
                            requestId: request.id,
                            senderProfileId: request.sender_profile_id,
                            receiverProfileId: request.receiver_profile_id,
                            status: "accepted",
                          })
                        }
                      >
                        <Check className="w-3.5 h-3.5" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs gap-1"
                        disabled={respond.isPending}
                        onClick={() =>
                          respond.mutate({
                            requestId: request.id,
                            senderProfileId: request.sender_profile_id,
                            receiverProfileId: request.receiver_profile_id,
                            status: "rejected",
                          })
                        }
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Request Responses</p>
                <Badge variant="outline">{recentResponses.length}</Badge>
              </div>

              {outgoingLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gold" />
                </div>
              ) : responseUpdates.length === 0 ? (
                <p className="text-xs text-muted-foreground">No responses yet.</p>
              ) : (
                responseUpdates.slice(0, 6).map((request) => (
                  <div key={request.id} className="rounded-lg border p-3 bg-muted/20 flex items-center justify-between gap-3">
                    <p className="text-sm leading-tight">
                      {request.receiver?.full_name || "Alumni"} {request.status === "accepted" ? "accepted" : "rejected"} your request
                    </p>
                    <Badge
                      variant={request.status === "accepted" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {request.status}
                    </Badge>
                  </div>
                ))
              )}
            </section>

            <section className="space-y-3">
              <p className="text-sm font-medium">Recent Sent</p>
              {outgoingLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gold" />
                </div>
              ) : recentOutgoing.length === 0 ? (
                <p className="text-xs text-muted-foreground">No sent requests yet.</p>
              ) : (
                recentOutgoing.map((request) => (
                  <div key={request.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium truncate">{request.receiver?.full_name || "Alumni"}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={request.status === "pending" ? "outline" : request.status === "accepted" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {request.status}
                    </Badge>
                  </div>
                ))
              )}
            </section>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default DashboardNotificationBell;
