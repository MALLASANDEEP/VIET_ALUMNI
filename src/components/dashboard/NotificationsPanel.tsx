import { Bell, Check, Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/hooks/useProfile";
import {
  useIncomingConnectionRequests,
  useOutgoingConnectionRequests,
  useRespondConnectionRequest,
} from "@/hooks/useConnections";

interface NotificationsPanelProps {
  profile: Profile;
}

const NotificationsPanel = ({ profile }: NotificationsPanelProps) => {
  const { data: incoming = [], isLoading: incomingLoading } = useIncomingConnectionRequests(profile.id);
  const { data: outgoing = [], isLoading: outgoingLoading } = useOutgoingConnectionRequests(profile.id);
  const respond = useRespondConnectionRequest();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Bell className="w-5 h-5 text-gold" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <h3 className="font-semibold">Incoming Requests</h3>
          {incomingLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gold" />
            </div>
          ) : incoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No incoming notifications.</p>
          ) : (
            <div className="space-y-3">
              {incoming.map((request) => (
                <div key={request.id} className="rounded-xl border p-4 bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{request.sender?.full_name || "User"} sent you a connection request</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(request.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant={request.status === "pending" ? "outline" : request.status === "accepted" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {request.status}
                    </Badge>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="gap-1"
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
                        <Check className="w-4 h-4" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
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
                        <X className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Sent Requests</h3>
          {outgoingLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gold" />
            </div>
          ) : outgoing.length === 0 ? (
            <p className="text-sm text-muted-foreground">You have not sent any requests.</p>
          ) : (
            <div className="space-y-3">
              {outgoing.map((request) => (
                <div key={request.id} className="rounded-xl border p-4 bg-muted/20 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">Request to {request.receiver?.full_name || "Alumni"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={request.status === "pending" ? "outline" : request.status === "accepted" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;
