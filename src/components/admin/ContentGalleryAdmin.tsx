import { useState, useEffect } from "react";
import { Save, Image as ImageIcon, Upload, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

import { useContentGallery } from "@/hooks/ContentGallery";
import type { ContentGallery } from "@/types/contentgalleryinterface";

const MAX_IMAGES = 5;

const ContentGalleryAdmin = () => {
  const { data, isLoading, updateContent } = useContentGallery();

  const [form, setForm] = useState<ContentGallery | null>(null);
  const [images, setImages] = useState<(string | null)[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!data) return;

    setForm(data);
    setImages([
      data.image_1,
      data.image_2,
      data.image_3,
      data.image_4,
      data.image_5,
    ]);
  }, [data]);

  if (isLoading || !form) {
    return <div className="p-10">Loading content...</div>;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================
  // IMAGE UPLOAD
  // =========================
  const handleImageUpload = async (index: number, file: File) => {
    try {
      setUploadingIndex(index);

      const fileExt = file.name.split(".").pop();
      const fileName = `image-${index + 1}-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("content-gallery")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("content-gallery")
        .getPublicUrl(fileName);

      const updated = [...images];
      updated[index] = data.publicUrl;
      setImages(updated);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Image upload failed");
    } finally {
      setUploadingIndex(null);
    }
  };

  // =========================
  // IMAGE DELETE
  // =========================
  const handleImageDelete = async (index: number) => {
    const imageUrl = images[index];
    if (!imageUrl) return;

    try {
      const filePath = imageUrl.split("/content-gallery/")[1];

      const { error } = await supabase.storage
        .from("content-gallery")
        .remove([filePath]);

      if (error) throw error;

      const updated = [...images];
      updated[index] = null;
      setImages(updated);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete image");
    }
  };

  // =========================
  // SAVE CONTENT
  // =========================
  const handleSave = () => {
    updateContent.mutate({
      id: form.id,
      tag: form.tag,
      title: form.title,
      description: form.description,
      button_text: form.button_text,
      button_link: form.button_link,

      image_1: images[0] ?? null,
      image_2: images[1] ?? null,
      image_3: images[2] ?? null,
      image_4: images[3] ?? null,
      image_5: images[4] ?? null,
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Content Gallery – Admin</h1>

      {/* TEXT CONTENT */}
      <div className="grid gap-4">
        <Input name="tag" value={form.tag} onChange={handleChange} />
        <Input name="title" value={form.title} onChange={handleChange} />
        <Textarea
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="button_text"
            value={form.button_text}
            onChange={handleChange}
          />
          <Input
            name="button_link"
            value={form.button_link}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* IMAGES */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ImageIcon size={20} /> Images (max {MAX_IMAGES})
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: MAX_IMAGES }).map((_, index) => (
            <div key={index} className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <Upload size={16} />
                Choose Image {index + 1}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageUpload(index, e.target.files[0]);
                    }
                  }}
                />
              </label>

              {uploadingIndex === index && (
                <p className="text-sm text-gray-500">Uploading...</p>
              )}

              {images[index] && (
                <div className="relative">
                  <img
                    src={images[index]!}
                    alt={`Preview ${index + 1}`}
                    className="h-32 w-full object-cover rounded"
                  />

                  <button
                    type="button"
                    onClick={() => handleImageDelete(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={updateContent.isPending}
        className="flex gap-2"
      >
        <Save size={18} />
        Save Changes
      </Button>
    </div>
  );
};

export default ContentGalleryAdmin;
