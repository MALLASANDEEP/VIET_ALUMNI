import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
const PROFILE_TIMEOUT_MS = 9000;
const withTimeout = (promise, timeoutMs, message) => {
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error(message)), timeoutMs);
        promise
            .then((value) => resolve(value))
            .catch((error) => reject(error))
            .finally(() => window.clearTimeout(timer));
    });
};
export const useProfile = () => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ["profile", user?.id],
        queryFn: async () => {
            if (!user)
                return null;
            const { data, error } = await withTimeout(supabase
                .from("profiles")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle(), PROFILE_TIMEOUT_MS, "Profile request timed out");
            if (error)
                throw error;
            return data;
        },
        enabled: !!user,
        retry: 1,
        refetchOnWindowFocus: false,
    });
};
export const useCreateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (profile) => {
            const { data, error } = await supabase
                .from("profiles")
                .insert(profile)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
};
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }) => {
            const { data, error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["pending-registrations"] });
            queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
        },
    });
};
export const usePendingRegistrations = () => {
    return useQuery({
        queryKey: ["pending-registrations"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("status", "pending")
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            return data;
        },
    });
};
export const useAllProfiles = () => {
    return useQuery({
        queryKey: ["all-profiles"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            return data;
        },
    });
};
