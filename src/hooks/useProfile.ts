import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  department: string | null;
  batch: string | null;
  company: string | null;
  current_position: string | null;
  linkedin_url: string | null;
  photo_url: string | null;
  bio: string | null;
  status: "pending" | "approved" | "rejected";
  requested_role: "student" | "alumni";
  created_at: string;
  updated_at: string;
  roll_no: string | null;
  lpa: number | null;
}

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
  });
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: {
      user_id: string;
      email: string;
      full_name: string;
      phone?: string;
      department?: string;
      batch?: string;
      company?: string;
      current_position?: string;
      linkedin_url?: string;
      requested_role: "student" | "alumni";
      roll_no?: string;
      lpa?: number;
    }) => {
      const { data, error } = await supabase
        .from("profiles")
        .insert(profile)
        .select()
        .single();
      
      if (error) throw error;
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
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["pending-registrations"] });
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
      
      if (error) throw error;
      return data as Profile[];
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
      
      if (error) throw error;
      return data as Profile[];
    },
  });
};
