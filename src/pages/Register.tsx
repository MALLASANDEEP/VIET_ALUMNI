import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap, Loader2, ArrowLeft, UserCheck, Users,
  Camera, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCreateProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

const departments = [
  "Computer Science(CSE)", "Data Science(DS)", "Cybersecurity(CS)", "AI &ML",
  "Mechanical(MECH)", "Civil", "Electronics Communication(ECE)", "Chemical",
  "Automobile", "Electrical & Electronics(EEE)", "MBA", "MCA", "BBA", "BCA",
];

const Register = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { signUp } = useAuth();
  const createProfile = useCreateProfile();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    department: "",
    batch: "",
    company: "",
    currentPosition: "",
    requestedRole: "" as "student" | "alumni" | "",
    rollNo: "",
    lpa: "",
    linkedin: "",
    photo: null as File | null,
    bio: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Error", description: "Image must be less than 2MB", variant: "destructive" });
        return;
      }
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.requestedRole) {
      toast({ title: "Error", description: "Please select your role", variant: "destructive" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Create Auth User
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (signUpError) throw signUpError;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User registration failed");

      // 2️⃣ Upload Photo (Optional)
      let photoUrl: string | undefined = undefined;
      if (formData.photo) {
        const fileExt = formData.photo.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(filePath, formData.photo);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("profile-photos").getPublicUrl(filePath);
        photoUrl = data.publicUrl;
      }

      // 3️⃣ Create Profile (Atomic)
      try {
        await createProfile.mutateAsync({
          user_id: user.id,
          email: formData.email,
          full_name: formData.fullName,
          phone: formData.phone || undefined,
          department: formData.department || undefined,
          batch: formData.batch || undefined,
          company: formData.company || undefined,
          current_position: formData.currentPosition || undefined,
          requested_role: formData.requestedRole,
          roll_no: formData.rollNo || undefined,
          lpa: formData.lpa ? parseFloat(formData.lpa) : undefined,
          linkedin_url: formData.linkedin || undefined,
          bio: formData.bio || "",
          photo_url: photoUrl,
        });
      } catch (profileError) {
        // ❌ Rollback auth user if profile creation fails
        await supabase.auth.admin.deleteUser(user.id);
        throw profileError;
      }

      toast({
        title: "Registration Successful",
        description: "Please verify your email. Admin will review your account soon.",
      });
      navigate("/login");

    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-dark flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <Card className="bg-card/95 backdrop-blur shadow-xl border-gold/10">
          <CardHeader className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-4 mx-auto w-fit">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-navy-dark" />
            </div>
            <CardTitle className="text-2xl font-serif">Join Alumni Portal</CardTitle>
            <CardDescription>Create your account to connect with our network</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, requestedRole: "student" }))}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center ${formData.requestedRole === "student" ? "border-gold bg-gold/10" : "border-border hover:border-gold/30"}`}
                >
                  <Users className={`w-8 h-8 mb-2 ${formData.requestedRole === "student" ? "text-gold" : "text-muted-foreground"}`} />
                  <span className="font-semibold text-sm">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, requestedRole: "alumni" }))}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center ${formData.requestedRole === "alumni" ? "border-gold bg-gold/10" : "border-border hover:border-gold/30"}`}
                >
                  <UserCheck className={`w-8 h-8 mb-2 ${formData.requestedRole === "alumni" ? "text-gold" : "text-muted-foreground"}`} />
                  <span className="font-semibold text-sm">Alumni</span>
                </button>
              </div>

              {/* Profile Image */}
              <div className="flex flex-col items-center gap-3">
                <Label>Profile Picture</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-full bg-muted border-2 border-dashed border-gold/40 flex items-center justify-center cursor-pointer hover:bg-gold/5 overflow-hidden transition-all"
                >
                  {formData.photo ? (
                    <img src={URL.createObjectURL(formData.photo)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              {/* Full Name & Roll No */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input required placeholder="John Doe" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Roll Number *</Label>
                  <Input required placeholder="e.g. 20XX1A05XX" value={formData.rollNo} onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })} />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" required placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input type="tel" placeholder="+91 00000 00000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input type="password" required placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password *</Label>
                  <Input type="password" required placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                </div>
              </div>

              {/* Department & Batch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select onValueChange={(v) => setFormData({...formData, department: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Dept" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Batch / Year</Label>
                  <Input placeholder="2024" value={formData.batch} onChange={(e) => setFormData({ ...formData, batch: e.target.value })} />
                </div>
              </div>

              {/* Alumni Fields */}
              {formData.requestedRole === "alumni" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 pt-4 border-t border-gold/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input placeholder="Current Organization" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input placeholder="Job Title" value={formData.currentPosition} onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Professional Bio</Label>
                    <Textarea placeholder="Share your professional journey..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="min-h-[80px]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>LPA (Optional)</Label>
                      <Input type="number" placeholder="12.5" value={formData.lpa} onChange={(e) => setFormData({ ...formData, lpa: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn URL</Label>
                      <Input type="url" placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} />
                    </div>
                  </div>
                </motion.div>
              )}

              <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-navy-dark font-bold py-6 text-lg" disabled={loading}>
                {loading ? <><Loader2 className="animate-spin mr-2" /> Creating Account...</> : "Complete Registration"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account? <Link to="/login" className="text-gold hover:underline">Sign In</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
