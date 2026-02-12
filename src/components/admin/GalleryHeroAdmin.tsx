import { useState, useEffect } from "react";
import { Save, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  useGalleryHero,
  useUpdateGalleryHero,
} from "@/hooks/useGalleryHero";
import type { GalleryHero } from "@/types/galleryHero";

const GalleryHeroAdmin = () => {
  const { data: hero, isLoading } = useGalleryHero();
  const updateHero = useUpdateGalleryHero();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bgImage, setBgImage] = useState("");
  const [uploading, setUploading] = useState(false);

  // Populate state when hero data loads
  useEffect(() => {
    if (hero) {
      setTitle(hero.title || "");
      setSubtitle(hero.subtitle || "");
      setBgImage(hero.bg_image || "");
    }
  }, [hero]);

  if (isLoading) return null;

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);

      // Validate file extension
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
      const allowedExts = ["png", "jpg", "jpeg", "webp", "gif"];
      if (!allowedExts.includes(fileExt)) throw new Error("Invalid file type");

      // Generate unique filename WITHOUT double folder names
      const filePath = `hero-${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("gallery-hero")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("gallery-hero")
        .getPublicUrl(filePath);
      if (!publicData.publicUrl) throw new Error("Failed to get public URL");

      setBgImage(publicData.publicUrl);

      // Update or insert hero
      if (hero) {
        updateHero.mutate({
          id: hero.id,
          title,
          subtitle,
          bg_image: publicData.publicUrl,
        } as GalleryHero);
      } else {
        await supabase.from("gallery_hero" as any).insert({
          title,
          subtitle,
          bg_image: publicData.publicUrl,
          created_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveText = async () => {
    try {
      if (hero) {
        updateHero.mutate({
          id: hero.id,
          title,
          subtitle,
          bg_image: bgImage,
        } as GalleryHero);
      } else {
        await supabase.from("gallery_hero" as any).insert({
          title,
          subtitle,
          bg_image: bgImage,
          created_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Save failed");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-4">
      <h2 className="text-xl font-bold">Edit Gallery Hero</h2>

      <input
        className="w-full p-3 bg-slate-100 rounded-xl"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />

      <textarea
        className="w-full p-3 bg-slate-100 rounded-xl"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        placeholder="Subtitle"
        rows={3}
      />

      <label className="flex items-center gap-3 cursor-pointer">
        <Upload />
        <span>{uploading ? "Uploading..." : "Upload Background Image"}</span>
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) uploadImage(e.target.files[0]);
          }}
        />
      </label>

    

      <button
        onClick={saveText}
        className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-xl"
      >
        <Save size={16} />
        Save
      </button>
    </div>
  );
};

export default GalleryHeroAdmin;
