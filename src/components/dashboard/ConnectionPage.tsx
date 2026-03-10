import { UserPlus, Loader2, Building2, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/hooks/useProfile";
import {
  useAcceptedConnections,
  useApprovedAlumniDirectory,
  useIncomingConnectionRequests,
  useOutgoingConnectionRequests,
  useSendConnectionRequest,
} from "@/hooks/useConnections";

interface ConnectionPageProps {
  profile: Profile;
}

const ConnectionPage = ({ profile }: ConnectionPageProps) => {
  const { data: alumni = [], isLoading } = useApprovedAlumniDirectory(profile.id);
  const { data: outgoing = [] } = useOutgoingConnectionRequests(profile.id);
  const { data: incoming = [] } = useIncomingConnectionRequests(profile.id);
  const { data: acceptedConnections = [] } = useAcceptedConnections(profile.id);
  const sendRequest = useSendConnectionRequest();

  const pendingOutgoing = new Set(
    outgoing.filter((item) => item.status === "pending").map((item) => item.receiver_profile_id)
  );

  const pendingIncoming = new Set(
    incoming.filter((item) => item.status === "pending").map((item) => item.sender_profile_id)
  );

  const connected = new Set(acceptedConnections.map((item) => item.other_profile.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-gold" />
          Connect With Alumni
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : alumni.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No alumni profiles available right now.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {alumni.map((alumniProfile) => {
              const isConnected = connected.has(alumniProfile.id);
              const isPending = pendingOutgoing.has(alumniProfile.id);
              const needsResponse = pendingIncoming.has(alumniProfile.id);

              return (
                <div key={alumniProfile.id} className="rounded-xl border bg-muted/40 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gold/10 overflow-hidden flex items-center justify-center shrink-0">
                      {alumniProfile.photo_url ? (
                        <img src={alumniProfile.photo_url} alt={alumniProfile.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gold font-bold">{alumniProfile.full_name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{alumniProfile.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {alumniProfile.current_position || "Alumni"}
                        {alumniProfile.company ? ` @ ${alumniProfile.company}` : ""}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">{alumniProfile.requested_role}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {alumniProfile.department && (
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {alumniProfile.department}
                      </span>
                    )}
                    {alumniProfile.company && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {alumniProfile.company}
                      </span>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    variant={isConnected ? "secondary" : "default"}
                    disabled={isConnected || isPending || needsResponse || sendRequest.isPending}
                    onClick={() =>
                      sendRequest.mutate({
                        senderProfileId: profile.id,
                        receiverProfileId: alumniProfile.id,
                      })
                    }
                  >
                    {isConnected
                      ? "Connected"
                      : isPending
                        ? "Request Sent"
                        : needsResponse
                          ? "Check Notifications"
                          : "Connect"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionPage;
