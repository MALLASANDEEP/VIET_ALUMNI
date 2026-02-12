import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Trash2, Loader2, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGallery,
  useAddGalleryImage,
  useDeleteGalleryImage,
  uploadGalleryImage,
  deleteGalleryImageFromStorage,
  GalleryImage,
} from "@/hooks/useGallery";

const CATEGORIES = ["Events", "Campus", "Graduation", "Sports", "Cultural", "General","Other"];

export const AdminGalleryTab = () => {
  const { data: gallery, isLoading } = useGallery();
  const addImage = useAddGalleryImage();
  const deleteImage = useDeleteGalleryImage();

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    setUploading(true);
    try {
      const imageUrl = await uploadGalleryImage(selectedFile);

      await addImage.mutateAsync({
        image_url: imageUrl,
        title: title || undefined,
        description: description || undefined,
        category,
      });

      resetForm();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    if (!confirm("Delete this image?")) return;

    try {
      await deleteGalleryImageFromStorage(image.image_url);
      await deleteImage.mutateAsync(image.id);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const resetForm = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setTitle("");
    setDescription("");
    setCategory(CATEGORIES[0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Manage Gallery</CardTitle>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload className="w-4 h-4 mr-2" /> Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardHeader>

      <CardContent>
        {previewUrl && (
          <div className="mb-6 flex gap-6">
            <img src={previewUrl} className="w-40 h-40 object-cover rounded-lg" />
            <div className="flex-1 space-y-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 border rounded-md px-3"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
              <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        ) : gallery && gallery.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((image) => (
              <motion.div key={image.id} className="relative group aspect-square">
                <img
                  src={`${image.image_url}?width=400&quality=60`}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                  onClick={() => handleDelete(image)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <ImageIcon className="mx-auto mb-2" />
            No images yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};