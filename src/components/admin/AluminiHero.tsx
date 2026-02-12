import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Trash2,
  Loader2,
  X,
  Settings2,
  Edit,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAlumni,
  useAddAlumni,
  useUpdateAlumni,
  useDeleteAlumni,
  useUpdateAlumniTitle,
  uploadAlumniPhoto,
  AlumniInsert,
  Alumni,
} from "@/hooks/useAlumni";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const DEPARTMENTS = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Chemical",
  "Information Technology",
  "Biotechnology",
];

export const AdminAlumnihero= () => {
  const { data, isLoading } = useAlumni();
  const alumniList = data?.alumni || [];
  const currentTitle = data?.sectionTitle || "Distinguished Alumni";

  const addAlumni = useAddAlumni();
  const updateAlumni = useUpdateAlumni();
  const deleteAlumni = useDeleteAlumni();
  const updateTitle = useUpdateAlumniTitle();

  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<AlumniInsert>({
    name: "",
    batch: "",
    department: DEPARTMENTS[0],
    email: "",
    current_position: "",
    company: "",
    linkedin: "",
    lpa: null,
    message: "",
  });

  /* ---------------- TITLE ---------------- */
  const handleUpdateTitle = async () => {
    if (!newSectionTitle) return;
    await updateTitle.mutateAsync(newSectionTitle);
    setNewSectionTitle("");
  };

  /* ---------------- PHOTO UPLOAD ---------------- */
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAlumniPhoto(file);
      setPhotoUrl(url);
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- ATTACHMENT UPLOAD ---------------- */
  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileName = `attachments/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("alumni-attachments")
      .upload(fileName, file);

    if (!error) {
      const { data } = supabase.storage
        .from("alumni-attachments")
        .getPublicUrl(fileName);
      setAttachmentUrl(data.publicUrl);
    }
    setUploading(false);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.batch) return;

    const payload = {
      ...formData,
      photo_url: photoUrl || undefined,
      attachment_url: attachmentUrl || undefined,
    };

    if (editingId)
      await updateAlumni.mutateAsync({ id: editingId, ...payload });
    else await addAlumni.mutateAsync(payload);

    setFormData({
      name: "",
      batch: "",
      department: DEPARTMENTS[0],
      email: "",
      current_position: "",
      company: "",
      linkedin: "",
      lpa: null,
      message: "",
    });
    setPhotoUrl(null);
    setAttachmentUrl(null);
    setEditingId(null);
    setShowForm(false);
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id: string) => {
    if (confirm("Delete this alumni?")) await deleteAlumni.mutateAsync(id);
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (alumni: Alumni) => {
    setEditingId(alumni.id);
    setFormData({
      name: alumni.name,
      batch: alumni.batch,
      department: alumni.department,
      email: alumni.email || "",
      current_position: alumni.current_position || "",
      company: alumni.company || "",
      linkedin: alumni.linkedin || "",
      lpa: alumni.lpa || null,
      message: alumni.message || "",
    });
    setPhotoUrl(alumni.photo_url || null);
    setAttachmentUrl((alumni as any).attachment_url || null);
    setShowForm(true);
  };

  return (
    <div className="space-y-8">
      {/* TITLE */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-indigo-600" />
          <CardTitle>Section Customization</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input
            placeholder={currentTitle}
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
          />
          <Button onClick={handleUpdateTitle}>Update</Button>
        </CardContent>
      </Card>

      {/* ALUMNI */}
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Manage Alumni</CardTitle>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? <X /> : <UserPlus />} {showForm ? "Cancel" : "Add"}
          </Button>
        </CardHeader>

        <CardContent>
          <AnimatePresence>
            {showForm && (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 mb-6"
              >
                <Input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Batch"
                  value={formData.batch}
                  onChange={(e) =>
                    setFormData({ ...formData, batch: e.target.value })
                  }
                />

                {/* PHOTO */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Photo
                </Button>
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />

                {/* ATTACHMENT */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => attachmentInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Upload Attachment
                </Button>
                <input
                  type="file"
                  hidden
                  ref={attachmentInputRef}
                  onChange={handleAttachmentUpload}
                />

                {attachmentUrl && (
                  <p className="text-xs text-indigo-600">
                    Attached: {attachmentUrl.split("/").pop()}
                  </p>
                )}

                <Button type="submit">
                  {editingId ? "Update Alumni" : "Add Alumni"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            alumniList.map((alumni) => (
              <Card key={alumni.id}>
                <CardContent className="flex justify-between items-center">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={alumni.photo_url || undefined} />
                      <AvatarFallback>
                        {alumni.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{alumni.name}</p>
                      {(alumni as any).attachment_url && (
                        <a
                          href={(alumni as any).attachment_url}
                          target="_blank"
                          className="text-xs text-indigo-600 flex items-center gap-1"
                        >
                          <Paperclip className="w-3 h-3" />
                          Attachment
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(alumni)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(alumni.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
