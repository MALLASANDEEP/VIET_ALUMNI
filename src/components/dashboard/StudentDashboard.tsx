import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Users, 
  MapPin, 
  ExternalLink, 
  Building, 
  IndianRupee, 
  Loader2,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useJobPostings } from "@/hooks/useJobPostings";
import { useMentorshipOffers } from "@/hooks/useMentorship";
import { Profile } from "@/hooks/useProfile";

interface StudentDashboardProps {
  profile: Profile;
}

export const StudentDashboard = ({ profile }: StudentDashboardProps) => {
  const { data: jobs, isLoading: jobsLoading } = useJobPostings();
  const { data: mentorships, isLoading: mentorshipsLoading } = useMentorshipOffers();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Bar with Smaller Profile Dropdown */}
      <div className="flex justify-between items-center">
        <div className="h-8" /> {/* Spacer */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full w-8 h-8 p-0 border border-border hover:border-gold/50 transition-all overflow-hidden">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gold/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-gold" />
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2 border-b">
              <p className="text-sm font-medium leading-none">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">{profile.email}</p>
            </div>
            <DropdownMenuItem onClick={() => setProfileDialogOpen(true)} className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              My Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile Detail Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden border-4 border-white/50 shadow-xl">
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold tracking-tight">{profile.full_name}</h3>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none capitalize">
                  Student
                </Badge>
                <p className="text-blue-100 flex items-center gap-2 mt-2">
                  <Building className="w-4 h-4" />
                  {profile.department} • Batch of {profile.batch}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Label className="text-slate-400 text-xs uppercase tracking-wider">Academic Info</Label>
                <div className="mt-2 space-y-2">
                  <p className="text-sm"><strong>Roll No:</strong> {profile.roll_no || "N/A"}</p>
                  <p className="text-sm"><strong>Department:</strong> {profile.department}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Label className="text-slate-400 text-xs uppercase tracking-wider">Contact</Label>
                <div className="mt-2 space-y-2">
                  <p className="text-sm truncate"><strong>Email:</strong> {profile.email}</p>
                  <p className="text-sm"><strong>Phone:</strong> {profile.phone || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <Label className="text-slate-400 text-xs uppercase tracking-wider">About Me</Label>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed italic">
                {profile.bio || "No bio added yet. Tell us about your journey!"}
              </p>
            </div>
            
            {profile.linkedin_url && (
              <Button variant="outline" className="w-full gap-2" asChild>
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Connect on LinkedIn
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="jobs" className="gap-2">
            <Briefcase className="w-4 h-4" />
            Job Postings
          </TabsTrigger>
          <TabsTrigger value="mentors" className="gap-2">
            <Users className="w-4 h-4" />
            Mentors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gold" />
                Available Job Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gold" />
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div className="grid gap-4">
                  {jobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-muted/50 rounded-xl p-6 hover:bg-muted/70 transition-colors border border-transparent hover:border-gold/20"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {job.job_type && <Badge variant="outline" className="text-gold border-gold/30">{job.job_type}</Badge>}
                              {job.experience_required && <Badge variant="secondary" className="text-xs font-normal">Exp: {job.experience_required}</Badge>}
                            </div>
                            <h3 className="font-semibold text-xl text-foreground">{job.title}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm">
                              <div className="flex items-center gap-1.5 text-gold font-medium">
                                <Building className="w-4 h-4" />
                                {job.company}
                              </div>
                              {job.location && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </div>
                              )}
                              {job.salary_range && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <IndianRupee className="w-4 h-4" />
                                  {job.salary_range}
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm line-clamp-2 italic">"{job.description}"</p>
                          <div className="flex items-center justify-between pt-2">
                            {job.alumni && (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center overflow-hidden">
                                  {job.alumni.photo_url ? (
                                    <img src={job.alumni.photo_url} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-[10px] text-gold font-bold">{job.alumni.full_name.charAt(0)}</span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">Posted by {job.alumni.full_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col gap-2 shrink-0">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1 md:w-32 text-xs">View Details</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-serif">{job.title}</DialogTitle>
                                <p className="text-gold font-medium">{job.company} • {job.location || 'Remote'}</p>
                              </DialogHeader>
                              <div className="mt-4 space-y-4">
                                <p className="text-sm whitespace-pre-wrap">{job.description}</p>
                                {job.apply_link && (
                                  <Button className="w-full btn-gold" asChild>
                                    <a href={job.apply_link} target="_blank" rel="noopener noreferrer">Apply Now</a>
                                  </Button>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                   <p className="text-muted-foreground">No jobs available right now.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentors">
            <Card>
                <CardHeader><CardTitle>Available Mentors</CardTitle></CardHeader>
                <CardContent>
                    {mentorshipsLoading ? <Loader2 className="animate-spin text-gold" /> : <p className="text-sm text-muted-foreground">Browse alumni mentorship offers.</p>}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};