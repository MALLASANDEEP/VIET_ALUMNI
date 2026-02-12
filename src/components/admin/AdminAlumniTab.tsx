import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Trash2, Loader2, X, Settings2, Edit } from "lucide-react";
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
  Alumni 
} from "@/hooks/useAlumni";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DEPARTMENTS = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Chemical",
  "Information Technology",
  "Biotechnology"
];

export const AdminAlumniTab = () => {
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
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<AlumniInsert>({
    name: "",
    batch: "",
    department: DEPARTMENTS[0],
    email: "",
    current_position: "",
    company: "",
    linkedin: "", 
    lpa: null,     
    message: ""   
  });

  // ---------------- TITLE ----------------
  const handleUpdateTitle = async () => {
    if (!newSectionTitle) return;
    await updateTitle.mutateAsync(newSectionTitle);
    setNewSectionTitle("");
  };

  // ---------------- UPLOAD PHOTO ----------------
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAlumniPhoto(file);
      setPhotoUrl(url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  // ---------------- SUBMIT FORM ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.batch || !formData.department) return;

    const payload = { ...formData, photo_url: photoUrl || undefined };

    if (editingId) await updateAlumni.mutateAsync({ id: editingId, ...payload });
    else await addAlumni.mutateAsync(payload);

    setFormData({ name: "", batch: "", department: DEPARTMENTS[0], email: "", current_position: "", company: "", linkedin: "", lpa: null, message: "" });
    setPhotoUrl(null);
    setEditingId(null);
    setShowForm(false);
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this alumni?")) await deleteAlumni.mutateAsync(id);
  };

  // ---------------- EDIT ----------------
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
      message: alumni.message || ""
    });
    setPhotoUrl(alumni.photo_url || null);
    setShowForm(true);
  };

  return (
    <div className="space-y-8">
      {/* TITLE CARD */}
      <Card className="border-indigo-100 shadow-md">
        <CardHeader className="bg-slate-50/50 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-indigo-600"/>
          <CardTitle className="text-lg">Section Customization</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex gap-4 items-end">
          <div className="flex-1">
            <Label>Main Section Title</Label>
            <Input placeholder={currentTitle} value={newSectionTitle} onChange={(e)=>setNewSectionTitle(e.target.value)} className="mt-1"/>
          </div>
          <Button onClick={handleUpdateTitle} disabled={updateTitle.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {updateTitle.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Update Title"}
          </Button>
        </CardContent>
      </Card>

      {/* ALUMNI MANAGEMENT */}
      <Card className="border-border/50 shadow-xl">
        <CardHeader className="flex items-center justify-between bg-muted/30">
          <div>
            <CardTitle className="font-serif text-2xl">Manage Alumni</CardTitle>
            <p className="text-sm text-muted-foreground">Add, edit and organize your distinguished alumni profiles</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={() => {setShowForm(!showForm); setEditingId(null);}}>
            {showForm ? <X className="w-4 h-4"/> : <UserPlus className="w-4 h-4"/>}{showForm ? "Cancel":"Add Alumni"}
          </Button>
        </CardHeader>

        <CardContent className="pt-6">
          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity:0, y:-20}}
                animate={{ opacity:1, y:0}}
                exit={{ opacity:0, y:-20}}
                onSubmit={handleSubmit}
                className="bg-muted/50 rounded-2xl p-6 mb-8 border border-indigo-100 space-y-4"
              >
                {/* FORM GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Name *</Label><Input value={formData.name} required onChange={e=>setFormData({...formData, name:e.target.value})}/></div>
                  <div><Label>Batch *</Label><Input value={formData.batch} required onChange={e=>setFormData({...formData, batch:e.target.value})}/></div>
                  <div><Label>Department *</Label>
                    <select value={formData.department} onChange={e=>setFormData({...formData, department:e.target.value})} className="w-full border rounded px-2 py-1">
                      {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div><Label>Email</Label><Input value={formData.email||""} onChange={e=>setFormData({...formData,email:e.target.value})}/></div>
                  <div><Label>Current Position</Label><Input value={formData.current_position||""} onChange={e=>setFormData({...formData,current_position:e.target.value})}/></div>
                  <div><Label>Company</Label><Input value={formData.company||""} onChange={e=>setFormData({...formData,company:e.target.value})}/></div>
                  <div><Label>LinkedIn</Label><Input value={formData.linkedin||""} onChange={e=>setFormData({...formData,linkedin:e.target.value})}/></div>
                  <div><Label>LPA</Label><Input type="number" value={formData.lpa||""} onChange={e=>setFormData({...formData,lpa:e.target.value?Number(e.target.value):null})}/></div>
                  <div className="md:col-span-2"><Label>Message</Label><textarea value={formData.message||""} onChange={e=>setFormData({...formData,message:e.target.value})} className="w-full border rounded px-2 py-1"/></div>
                  <div className="md:col-span-2 flex items-center gap-4">
                    <Button type="button" variant="outline" onClick={()=>fileInputRef.current?.click()} disabled={uploading}>{uploading?"Uploading...":"Upload Photo"}</Button>
                    {photoUrl && <span className="text-sm text-indigo-600">{photoUrl.split("/").pop()}</span>}
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload}/>
                  </div>
                </div>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">{editingId?"Update Alumni":"Add Alumni"}</Button>
              </motion.form>
            )}
          </AnimatePresence>
          {/* ALUMNI LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600"/>                                         
              </div>
            ) : (
              alumniList.map(alumni => (

                <Card key={alumni.id} className="border-border/50 shadow">

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={alumni.photo_url || undefined} alt={alumni.name}/>
                        <AvatarFallback>{alumni.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold">{alumni.name}</h3>
                        <p className="text-sm text-muted-foreground">{alumni.department} - Class of {alumni.batch}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={()=>handleEdit(alumni)}><Edit className="w-4 h-4"/> Edit</Button>
                      <Button variant="destructive" size="sm" onClick={()=>handleDelete(alumni.id)}><Trash2 className="w-4 h-4"/> Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );    
};