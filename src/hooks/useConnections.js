import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
export const useApprovedAlumniDirectory = (currentProfileId) => {
    return useQuery({
        queryKey: ["connections", "directory", "alumni", currentProfileId],
        queryFn: async () => {
            let query = supabase
                .from("profiles")
                .select("id, user_id, full_name, department, company, current_position, photo_url, requested_role")
                .eq("status", "approved")
                .eq("requested_role", "alumni")
                .order("full_name", { ascending: true });
            if (currentProfileId) {
                query = query.neq("id", currentProfileId);
            }
            const { data, error } = await query;
            if (error)
                throw error;
            const { data: adminRoles, error: adminRolesError } = await supabase
                .from("user_roles")
                .select("user_id")
                .eq("role", "admin");
            if (adminRolesError)
                throw adminRolesError;
            const adminUserIds = new Set((adminRoles || []).map((row) => row.user_id));
            return (data || []).filter((profile) => !adminUserIds.has(profile.user_id));
        },
        enabled: !!currentProfileId,
    });
};
export const useIncomingConnectionRequests = (profileId) => {
    return useQuery({
        queryKey: ["connections", "incoming", profileId],
        queryFn: async () => {
            if (!profileId)
                return [];
            const { data, error } = await supabase
                .from("connection_requests")
                .select(`
          id,
          sender_profile_id,
          receiver_profile_id,
          status,
          message,
          created_at,
          updated_at,
          responded_at,
          sender:profiles!connection_requests_sender_profile_id_fkey (
            id,
            full_name,
            photo_url,
            requested_role
          )
        `)
                .eq("receiver_profile_id", profileId)
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            return (data || []);
        },
        enabled: !!profileId,
    });
};
export const useOutgoingConnectionRequests = (profileId) => {
    return useQuery({
        queryKey: ["connections", "outgoing", profileId],
        queryFn: async () => {
            if (!profileId)
                return [];
            const { data, error } = await supabase
                .from("connection_requests")
                .select(`
          id,
          sender_profile_id,
          receiver_profile_id,
          status,
          message,
          created_at,
          updated_at,
          responded_at,
          receiver:profiles!connection_requests_receiver_profile_id_fkey (
            id,
            full_name,
            photo_url,
            requested_role
          )
        `)
                .eq("sender_profile_id", profileId)
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            return (data || []);
        },
        enabled: !!profileId,
    });
};
export const useAcceptedConnections = (profileId) => {
    return useQuery({
        queryKey: ["connections", "accepted", profileId],
        queryFn: async () => {
            if (!profileId)
                return [];
            const { data, error } = await supabase
                .from("connections")
                .select(`
          id,
          profile_one_id,
          profile_two_id,
          status,
          created_at,
          profile_one:profiles!connections_profile_one_id_fkey (
            id,
            full_name,
            photo_url,
            requested_role,
            department,
            company,
            current_position
          ),
          profile_two:profiles!connections_profile_two_id_fkey (
            id,
            full_name,
            photo_url,
            requested_role,
            department,
            company,
            current_position
          )
        `)
                .eq("status", "active")
                .or(`profile_one_id.eq.${profileId},profile_two_id.eq.${profileId}`)
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            return (data || [])
                .map((item) => {
                const other = item.profile_one_id === profileId ? item.profile_two : item.profile_one;
                if (!other)
                    return null;
                return {
                    id: item.id,
                    profile_one_id: item.profile_one_id,
                    profile_two_id: item.profile_two_id,
                    status: item.status,
                    created_at: item.created_at,
                    other_profile: {
                        id: other.id,
                        full_name: other.full_name,
                        photo_url: other.photo_url,
                        requested_role: other.requested_role,
                        department: other.department,
                        company: other.company,
                        current_position: other.current_position,
                    },
                };
            })
                .filter(Boolean);
        },
        enabled: !!profileId,
    });
};
export const useSendConnectionRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ senderProfileId, receiverProfileId, message, }) => {
            if (senderProfileId === receiverProfileId) {
                throw new Error("You cannot connect with yourself.");
            }
            const { data, error } = await supabase
                .from("connection_requests")
                .insert({
                sender_profile_id: senderProfileId,
                receiver_profile_id: receiverProfileId,
                status: "pending",
                message: message?.trim() || null,
            })
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["connections"] });
            toast({ title: "Request sent", description: "The alumni has been notified." });
        },
    });
};
export const useRespondConnectionRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ requestId, senderProfileId, receiverProfileId, status, }) => {
            const { error: updateError } = await supabase
                .from("connection_requests")
                .update({
                status,
                responded_at: new Date().toISOString(),
            })
                .eq("id", requestId);
            if (updateError)
                throw updateError;
            if (status === "accepted") {
                const ordered = [senderProfileId, receiverProfileId].sort();
                const [profileOneId, profileTwoId] = ordered;
                const { error: connectionError } = await supabase
                    .from("connections")
                    .upsert({
                    profile_one_id: profileOneId,
                    profile_two_id: profileTwoId,
                    status: "active",
                }, { onConflict: "profile_one_id,profile_two_id", ignoreDuplicates: true });
                if (connectionError)
                    throw connectionError;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["connections"] });
            toast({
                title: variables.status === "accepted" ? "Request accepted" : "Request rejected",
                description: variables.status === "accepted"
                    ? "You can now chat in the Chat tab."
                    : "The sender has been notified.",
            });
        },
    });
};
