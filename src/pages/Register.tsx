import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  GraduationCap, Mail, Lock, User, Phone, Building, 
  Calendar, Loader2, ArrowLeft, UserCheck, Users, 
  Hash, Banknote, Linkedin, AlignLeft // Added icon for Bio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Ensure this exists in your UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCreateProfile } from "@/hooks/useProfile";

const departments = [
  "Computer Science(CSE)", "Data Science(DS)", "Cybersecurity(CS)", "AI &ML",
  "Mechanical(MECH)", "Civil", "Electronics Communication(ECE)", "Chemical",
  "Automobile", "Electrical & Electronics(EEE)", "MBA", "MCA", "BBA", "BCA",
];

const Register = () => {
  const navigate = useNavigate();
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

    if (formData.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await signUp(formData.email, formData.password);
      
      const { data: { user } } = await (await import("@/integrations/supabase/client")).supabase.auth.getUser();
      
      if (user) {
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
          bio: formData.bio || "", // Using the actual bio from state now
        });
      }
      
      toast({
        title: "Registration Submitted",
        description: "Please check your email to verify your account. An admin will review your registration.",
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-card/95 backdrop-blur">
          <CardHeader className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-navy-dark" />
            </div>
            <CardTitle className="font-serif text-2xl">Join Alumni Portal</CardTitle>
            <CardDescription>Register as a student or alumni member</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, requestedRole: "student" }))}
                  className={`p-4 rounded-xl border-2 transition-all ${formData.requestedRole === "student" ? "border-gold bg-gold/10" : "border-border hover:border-gold/50"}`}
                >
                  <Users className={`w-8 h-8 mx-auto mb-2 ${formData.requestedRole === "student" ? "text-gold" : "text-muted-foreground"}`} />
                  <p className="font-semibold">Student</p>
                  <p className="text-xs text-muted-foreground">Current student</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, requestedRole: "alumni" }))}
                  className={`p-4 rounded-xl border-2 transition-all ${formData.requestedRole === "alumni" ? "border-gold bg-gold/10" : "border-border hover:border-gold/50"}`}
                >
                  <UserCheck className={`w-8 h-8 mx-auto mb-2 ${formData.requestedRole === "alumni" ? "text-gold" : "text-muted-foreground"}`} />
                  <p className="font-semibold">Alumni</p>
                  <p className="text-xs text-muted-foreground">Graduate member</p>
                </button>
              </div>

              {/* Basic Info (Common to both) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} placeholder="John Doe" className="pl-10" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="rollNo">Roll Number *</Label>
                  <div className="relative mt-1">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="rollNo" value={formData.rollNo} onChange={(e) => setFormData(prev => ({ ...prev, rollNo: e.target.value }))} placeholder="e.g. 20XX1A05XX" className="pl-10" required />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="you@example.com" className="pl-10" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+1 234 567 890" className="pl-10" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" className="pl-10" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))} placeholder="••••••••" className="pl-10" required />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="batch">Batch/Year</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="batch" value={formData.batch} onChange={(e) => setFormData(prev => ({ ...prev, batch: e.target.value }))} placeholder="2020" className="pl-10" />
                  </div>
                </div>
              </div>

              {/* Alumni Specific Fields */}
              {formData.requestedRole === "alumni" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 pt-2 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Current Company</Label>
                      <div className="relative mt-1">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="company" value={formData.company} onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))} placeholder="Google, Microsoft..." className="pl-10" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="currentPosition">Current Position</Label>
                      <Input id="currentPosition" value={formData.currentPosition} onChange={(e) => setFormData(prev => ({ ...prev, currentPosition: e.target.value }))} placeholder="Software Engineer..." className="mt-1" />
                    </div>
                  </div>
                  
                  {/* Bio Field - Added here */}
                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <div className="relative mt-1">
                      <Textarea 
                        id="bio" 
                        value={formData.bio} 
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))} 
                        placeholder="Tell us about your professional journey..." 
                        className="min-h-[100px] resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lpa">LPA (Salary)</Label>
                      <div className="relative mt-1">
                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="lpa" type="number" value={formData.lpa} onChange={(e) => setFormData(prev => ({ ...prev, lpa: e.target.value }))} placeholder="12.5" className="pl-10" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                      <div className="relative mt-1">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="linkedin" type="url" value={formData.linkedin} onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/..." className="pl-10" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <Button type="submit" className="w-full btn-gold" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Account...</> : "Register"}
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