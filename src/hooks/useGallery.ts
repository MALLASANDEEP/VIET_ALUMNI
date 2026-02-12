import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

export interface GalleryImage {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  category: string | null;
  created_at: string;
}

export interface GalleryImageInsert {
  image_url: string;
  title?: string;
  description?: string;
  category?: string;
}

/* ---------------- FETCH GALLERY ---------------- */
export const useGallery = () => {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, title, category, description, image_url, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as GalleryImage[];
    },
    staleTime: 1000 * 60, // 1 min cache
  });
};

/* ---------------- ADD IMAGE ROW ---------------- */
export const useAddGalleryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: GalleryImageInsert) => {
      const { data, error } = await supabase
        .from("gallery_images")
        .insert(image)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast({ title: "Success", description: "Image added to gallery" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/* ---------------- DELETE DB ROW ---------------- */
export const useDeleteGalleryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast({ title: "Deleted", description: "Image removed" });
    },
  });
};

/* ---------------- UPLOAD TO STORAGE ---------------- */
export const uploadGalleryImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("gallery-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("gallery-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
};

/* ---------------- DELETE FROM STORAGE ---------------- */
export const deleteGalleryImageFromStorage = async (imageUrl: string) => {
  const fileName = imageUrl.split("/").pop()?.split("?")[0];
  if (!fileName) return;

  const { error } = await supabase.storage
    .from("gallery-images")
    .remove([fileName]);

  if (error) throw error;
};