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
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Profile } from "@/hooks/useProfile";
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

  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [mentorDialogOpen, setMentorDialogOpen] = useState(false);

  // Job form state
  const [jobForm, setJobForm] = useState({
    title: "",
    company: profile.company || "",
    description: "",
    location: "",
    apply_link: "",
  });

  // Mentor form state
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
        alumni_id: profile.id,
        title: jobForm.title,
        company: jobForm.company,
        description: jobForm.description,
        location: jobForm.location || undefined,
        apply_link: jobForm.apply_link || undefined,
      });
      toast({ title: "Success", description: "Job posting created!" });
      setJobDialogOpen(false);
      setJobForm({ title: "", company: profile.company || "", description: "", location: "", apply_link: "" });
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
        expertise_areas: mentorForm.expertise_areas ? mentorForm.expertise_areas.split(",").map(s => s.trim()) : undefined,
        contact_email: mentorForm.contact_email || undefined,
        contact_phone: mentorForm.contact_phone || undefined,
      });
      toast({ title: "Success", description: "Mentorship offer created!" });
      setMentorDialogOpen(false);
      setMentorForm({ title: "", description: "", expertise_areas: "", contact_email: profile.email, contact_phone: profile.phone || "" });
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
      {/* Profile Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt={profile.full_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gold" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{profile.full_name}</h3>
              <p className="text-gold">{profile.current_position} {profile.company && `at ${profile.company}`}</p>
              <p className="text-muted-foreground text-sm">{profile.department} • Batch {profile.batch}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
        </TabsList>

        {/* Job Postings Tab */}
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
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Post a New Job</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Job Title *</Label>
                      <Input
                        value={jobForm.title}
                        onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Software Engineer"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Company *</Label>
                      <Input
                        value={jobForm.company}
                        onChange={(e) => setJobForm(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Google"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Description *</Label>
                      <Textarea
                        value={jobForm.description}
                        onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Job description..."
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={jobForm.location}
                        onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Remote, San Francisco..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Apply Link</Label>
                      <Input
                        value={jobForm.apply_link}
                        onChange={(e) => setJobForm(prev => ({ ...prev, apply_link: e.target.value }))}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      className="w-full btn-gold" 
                      onClick={handleCreateJob}
                      disabled={createJob.isPending}
                    >
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

        {/* Mentorship Tab */}
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
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Description *</Label>
                      <Textarea
                        value={mentorForm.description}
                        onChange={(e) => setMentorForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="What kind of mentorship you offer..."
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Expertise Areas (comma separated)</Label>
                      <Input
                        value={mentorForm.expertise_areas}
                        onChange={(e) => setMentorForm(prev => ({ ...prev, expertise_areas: e.target.value }))}
                        placeholder="JavaScript, React, System Design"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Contact Email</Label>
                      <Input
                        value={mentorForm.contact_email}
                        onChange={(e) => setMentorForm(prev => ({ ...prev, contact_email: e.target.value }))}
                        placeholder="your@email.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Contact Phone</Label>
                      <Input
                        value={mentorForm.contact_phone}
                        onChange={(e) => setMentorForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                        placeholder="+1 234 567 890"
                        className="mt-1"
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
                          <p className="text-muted-foreground mt-2 text-sm">
                            {mentor.description}
                          </p>
                          {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {mentor.expertise_areas.map((area) => (
                                <Badge key={area} variant="secondary" className="text-xs">
                                  {area}
                                </Badge>
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
      </Tabs>
    </div>
  );
};
