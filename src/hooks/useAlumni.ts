import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// ---------------- INTERFACES ----------------
export interface Alumni {
  id: string;
  name: string;
  batch: string;
  department: string;
  email: string | null;
  photo_url: string | null;
  current_position: string | null;
  company: string | null;
  linkedin: string | null;
  lpa: number | null;
  message: string | null;
  created_at: string;
  updated_at?: string;
  status?: string;
  roll_no?: string;
}

export interface AlumniInsert {
  name: string;
  batch: string;
  department: string;
  email?: string | null;
  photo_url?: string | null;
  current_position?: string | null;
  company?: string | null;
  linkedin?: string | null;
  lpa?: number | null;
  message?: string | null;
}

// ---------------- FETCH ALUMNI ----------------
export const useAlumni = () => {
  return useQuery({
    queryKey: ["alumni", "settings"],
    queryFn: async () => {
      const [alumniRes, settingsRes] = await Promise.all([
        supabase
          .from("alumni")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("site_settings" as any)
          .select("value")
          .eq("id", "alumni_section_title")
          .maybeSingle()
      ]);

      if (alumniRes.error) throw alumniRes.error;

      const formattedAlumni: Alumni[] = (alumniRes.data as any[]).map(item => ({
        id: item.id,
        name: item.name,
        batch: item.batch,
        department: item.department,
        email: item.email,
        photo_url: item.photo_url,
        current_position: item.current_position,
        company: item.company,
        linkedin: item.linkedin || item.linkedin_url || null,
        lpa: item.lpa ?? null,
        message: item.message ?? null,
        created_at: item.created_at,
        updated_at: item.updated_at,
        status: item.status ?? null,
        roll_no: item.roll_no ?? null
      }));

      return {
        alumni: formattedAlumni,
        sectionTitle: (settingsRes?.data as any)?.value || "Distinguished Alumni"
      };
    }
  });
};

// ---------------- ADD ----------------
export const useAddAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alumni: AlumniInsert) => {
      const { data, error } = await supabase
        .from("alumni")
        .insert(alumni)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni"] });
      toast({ title: "Success", description: "Alumni added successfully" });
    }
  });
};

// ---------------- UPDATE ----------------
export const useUpdateAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Alumni> & { id: string }) => {
      const { data, error } = await supabase
        .from("alumni")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni"] });
      toast({ title: "Success", description: "Alumni updated successfully" });
    }
  });
};

// ---------------- DELETE ----------------
export const useDeleteAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alumni").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni"] });
      toast({ title: "Deleted", description: "Record removed successfully" });
    }
  });
};

// ---------------- UPDATE TITLE ----------------
export const useUpdateAlumniTitle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTitle: string) => {
      const { error } = await supabase
        .from("site_settings" as any)
        .upsert({ id: "alumni_section_title", value: newTitle });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni", "settings"] });
      toast({ title: "Updated", description: "Section title saved." });
    }
  });
};

// ---------------- UPLOAD PHOTO ----------------
export const uploadAlumniPhoto = async (file: File): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const { error: uploadError } = await supabase.storage
    .from("alumni-photos")
    .upload(fileName, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("alumni-photos").getPublicUrl(fileName);
  return data.publicUrl;
};
