import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  MapPin, 
  ExternalLink,
  Building,
  Loader2,
  User,
  LogOut
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Profile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { 
  useMyJobPostings, 
  useCreateJobPosting, 
  useDeleteJobPosting 
} from "@/hooks/useJobPostings";
import { 
  useMyMentorshipOffers, 
  useCreateMentorshipOffer, 
  useDeleteMentorshipOffer 
} from "@/hooks/useMentorship";
import ProfileMenu from "@/components/ProfileMenu"; 
import { StudentDashboard } from "./StudentDashboard";

interface AlumniDashboardProps {
  profile: Profile;
}

export const AlumniDashboard = ({ profile }: AlumniDashboardProps) => {
  const { data: myJobs, isLoading: jobsLoading } = useMyJobPostings(profile.id);
  const { data: myMentorships, isLoading: mentorshipsLoading } = useMyMentorshipOffers(profile.id);
  
  const createJob = useCreateJobPosting();
  const deleteJob = useDeleteJobPosting();
  const createMentorship = useCreateMentorshipOffer();
  const deleteMentorship = useDeleteMentorshipOffer();
  
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [mentorDialogOpen, setMentorDialogOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const [jobForm, setJobForm] = useState<any>({
    title: "",
    company: profile.company || "",
    description: "",
    location: "",
    job_type: "",
    experience_required: "",
    salary_range: "",
    skills_required: "",
    responsibilities: "",
    eligibility: "",
    selection_process: "",
    application_deadline: "",
    referral_type: "direct_apply",
    referral_slots: 0,
    apply_link: "",
  });

  const [mentorForm, setMentorForm] = useState({
    title: "",
    description: "",
    expertise_areas: "",
    contact_email: profile.email,
    contact_phone: profile.phone || "",
  });

  const handleCreateJob = async () => {
    if (!jobForm.title || !jobForm.company || !jobForm.description) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }
    try {
      await createJob.mutateAsync({
        ...jobForm,
        alumni_id: profile.id,
        skills_required: jobForm.skills_required
          ? jobForm.skills_required.split(",").map((s: string) => s.trim())
          : undefined,
      });
      toast({ title: "Success", description: "Job posting created!" });
      setJobDialogOpen(false);
      setJobForm({
        title: "",
        company: profile.company || "",
        description: "",
        location: "",
        job_type: "",
        experience_required: "",
        salary_range: "",
        skills_required: "",
        responsibilities: "",
        eligibility: "",
        selection_process: "",
        application_deadline: "",
        referral_type: "direct_apply",
        referral_slots: 0,
        apply_link: "",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteJob.mutateAsync(id);
      toast({ title: "Success", description: "Job posting deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateMentorship = async () => {
    if (!mentorForm.title || !mentorForm.description) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }
    try {
      await createMentorship.mutateAsync({
        alumni_id: profile.id,
        title: mentorForm.title,
        description: mentorForm.description,
        expertise_areas: mentorForm.expertise_areas
          ? mentorForm.expertise_areas.split(",").map(s => s.trim())
          : undefined,
        contact_email: mentorForm.contact_email || undefined,
        contact_phone: mentorForm.contact_phone || undefined,
      });
      toast({ title: "Success", description: "Mentorship offer created!" });
      setMentorDialogOpen(false);
      setMentorForm({
        title: "",
        description: "",
        expertise_areas: "",
        contact_email: profile.email,
        contact_phone: profile.phone || "",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteMentorship = async (id: string) => {
    try {
      await deleteMentorship.mutateAsync(id);
      toast({ title: "Success", description: "Mentorship offer deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ProfileMenu profile={profile} onLogout={handleLogout} />
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="jobs" className="gap-2">
            <Briefcase className="w-4 h-4" />
            My Job Posts ({myJobs?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="mentoring" className="gap-2">
            <Users className="w-4 h-4" />
            Mentorship ({myMentorships?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="explore" className="gap-2">
            <User className="w-4 h-4" />
            Explore
          </TabsTrigger>
        </TabsList>

        {/* JOB POSTINGS TAB */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gold" />
                My Job Postings
              </CardTitle>
              <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-gold gap-2">
                    <Plus className="w-4 h-4" />
                    Post Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Post a New Job</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Job Title *</Label>
                      <Input placeholder="Software Engineer" value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Company *</Label>
                      <Input placeholder="Google" value={jobForm.company}
                        onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Textarea placeholder="Job description..." rows={4}
                        value={jobForm.description}
                        onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input placeholder="Remote, Hyderabad..."
                        value={jobForm.location}
                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Job Type</Label>
                      <Input placeholder="Internship / Full-time"
                        value={jobForm.job_type}
                        onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Experience Required</Label>
                      <Input placeholder="e.g. 2+ years"
                        value={jobForm.experience_required}
                        onChange={(e) => setJobForm({ ...jobForm, experience_required: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Salary Range</Label>
                      <Input placeholder="e.g. 10LPA - 15LPA"
                        value={jobForm.salary_range}
                        onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Skills Required (comma separated)</Label>
                      <Input placeholder="React, Node.js, SQL"
                        value={jobForm.skills_required}
                        onChange={(e) => setJobForm({ ...jobForm, skills_required: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Responsibilities</Label>
                      <Textarea placeholder="Key responsibilities..."
                        value={jobForm.responsibilities}
                        onChange={(e) => setJobForm({ ...jobForm, responsibilities: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Eligibility</Label>
                      <Textarea placeholder="Who can apply?"
                        value={jobForm.eligibility}
                        onChange={(e) => setJobForm({ ...jobForm, eligibility: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Selection Process</Label>
                      <Textarea placeholder="Interview rounds..."
                        value={jobForm.selection_process}
                        onChange={(e) => setJobForm({ ...jobForm, selection_process: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Application Deadline</Label>
                      <Input type="date"
                        value={jobForm.application_deadline}
                        onChange={(e) => setJobForm({ ...jobForm, application_deadline: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Referral Type</Label>
                      <Select value={jobForm.referral_type}
                        onValueChange={(v) => setJobForm({ ...jobForm, referral_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direct_apply">Direct Apply</SelectItem>
                          <SelectItem value="resume_upload">Upload Resume</SelectItem>
                          <SelectItem value="internal_referral">Internal Referral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Referral Slots</Label>
                      <Input type="number"
                        value={jobForm.referral_slots}
                        onChange={(e) => setJobForm({ ...jobForm, referral_slots: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Apply Link</Label>
                      <Input placeholder="https://company.com/careers"
                        value={jobForm.apply_link}
                        onChange={(e) => setJobForm({ ...jobForm, apply_link: e.target.value })} />
                    </div>
                    <Button className="w-full btn-gold"
                      onClick={handleCreateJob}
                      disabled={createJob.isPending}>
                      {createJob.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Job"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gold" />
                </div>
              ) : myJobs && myJobs.length > 0 ? (
                <div className="grid gap-4">
                  {myJobs.map((job) => (
                    <div key={job.id} className="bg-muted/50 rounded-xl p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <div className="flex items-center gap-2 text-gold font-medium mt-1">
                            <Building className="w-4 h-4" />
                            {job.company}
                          </div>
                          {job.location && (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                          )}
                          <p className="text-muted-foreground mt-2 text-sm line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deleteJob.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't posted any jobs yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MENTORSHIP TAB */}
        <TabsContent value="mentoring">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif flex items-center gap-2">
                <Users className="w-5 h-5 text-gold" />
                My Mentorship Offers
              </CardTitle>
              <Dialog open={mentorDialogOpen} onOpenChange={setMentorDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-gold gap-2">
                    <Plus className="w-4 h-4" />
                    Offer Mentorship
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Offer Mentorship</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Title *</Label>
                      <Input
                        value={mentorForm.title}
                        onChange={(e) => setMentorForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Career Guidance in Tech"
                      />
                    </div>
                    <div>
                      <Label>Description *</Label>
                      <Textarea
                        value={mentorForm.description}
                        onChange={(e) => setMentorForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="What kind of mentorship you offer..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Expertise Areas (comma separated)</Label>
                      <Input
                        value={mentorForm.expertise_areas}
                        onChange={(e) => setMentorForm(prev => ({ ...prev, expertise_areas: e.target.value }))}
                        placeholder="JavaScript, React, System Design"
                      />
                    </div>
                    <div>
                      <Label>Contact Email</Label>
                      <Input
                        value={mentorForm.contact_email}
                        onChange={(e) => setMentorForm(prev => ({ ...prev, contact_email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Contact Phone</Label>
                      <Input
                        value={mentorForm.contact_phone}
                        onChange={(e) => setMentorForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                      />
                    </div>
                    <Button
                      className="w-full btn-gold"
                      onClick={handleCreateMentorship}
                      disabled={createMentorship.isPending}
                    >
                      {createMentorship.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Offer"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {mentorshipsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gold" />
                </div>
              ) : myMentorships && myMentorships.length > 0 ? (
                <div className="grid gap-4">
                  {myMentorships.map((mentor) => (
                    <div key={mentor.id} className="bg-muted/50 rounded-xl p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{mentor.title}</h3>
                          <p className="text-muted-foreground mt-2 text-sm">{mentor.description}</p>
                          {mentor.expertise_areas && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {mentor.expertise_areas.map((area) => (
                                <Badge key={area} variant="secondary" className="text-xs">{area}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteMentorship(mentor.id)}
                          disabled={deleteMentorship.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't offered mentorship yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EXPLORE TAB — StudentDashboard renders here, same level as jobs & mentoring */}
        <TabsContent value="explore">
          <StudentDashboard profile={profile} />
        </TabsContent>

      </Tabs>
    </div>
  );
};