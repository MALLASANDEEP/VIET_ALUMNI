import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Users, 
  MapPin, 
  ExternalLink, 
  Building, 
  Calendar, 
  Clock, 
  IndianRupee, 
  Loader2,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useJobPostings } from "@/hooks/useJobPostings";
import { useMentorshipOffers } from "@/hooks/useMentorship";
import { Profile } from "@/hooks/useProfile";

interface StudentDashboardProps {
  profile: Profile;
}

export const StudentDashboard = ({ profile }: StudentDashboardProps) => {
  const { data: jobs, isLoading: jobsLoading } = useJobPostings();
  const { data: mentorships, isLoading: mentorshipsLoading } = useMentorshipOffers();
  const [selectedJob, setSelectedJob] = useState<any>(null);

  return (
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

      {/* Job Postings Tab */}
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

                        <p className="text-muted-foreground text-sm line-clamp-2 italic">
                          "{job.description}"
                        </p>

                        {job.skills_required && job.skills_required.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {job.skills_required.map((skill: string) => (
                              <span key={skill} className="text-[10px] bg-background px-2 py-0.5 rounded border border-border text-muted-foreground">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

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
                              <span className="text-xs text-muted-foreground">
                                Posted by {job.alumni.full_name}
                              </span>
                            </div>
                          )}
                          {job.application_deadline && (
                            <div className="flex items-center gap-1 text-[11px] text-destructive font-medium">
                              <Clock className="w-3 h-3" />
                              Ends: {new Date(job.application_deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col gap-2 shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1 md:w-32 text-xs">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-serif">{job.title}</DialogTitle>
                              <p className="text-gold font-medium">{job.company} • {job.location || 'Remote'}</p>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                                <div><Label className="text-xs text-muted-foreground">Job Type</Label><p className="text-sm font-medium">{job.job_type || 'N/A'}</p></div>
                                <div><Label className="text-xs text-muted-foreground">Experience</Label><p className="text-sm font-medium">{job.experience_required || 'N/A'}</p></div>
                                <div><Label className="text-xs text-muted-foreground">Salary</Label><p className="text-sm font-medium">{job.salary_range || 'N/A'}</p></div>
                                <div><Label className="text-xs text-muted-foreground">Referral Type</Label><Badge variant="secondary" className="capitalize">{job.referral_type?.replace('_', ' ')}</Badge></div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-semibold flex items-center gap-2"><Briefcase className="w-4 h-4 text-gold"/> Description</h4>
                                <p className="text-sm leading-relaxed text-muted-foreground">{job.description}</p>
                              </div>

                              {job.responsibilities && (
                                <div className="space-y-2">
                                  <h4 className="font-semibold">Key Responsibilities</h4>
                                  <p className="text-sm whitespace-pre-line text-muted-foreground">{job.responsibilities}</p>
                                </div>
                              )}

                              {job.eligibility && (
                                <div className="space-y-2">
                                  <h4 className="font-semibold">Eligibility Criteria</h4>
                                  <p className="text-sm whitespace-pre-line text-muted-foreground">{job.eligibility}</p>
                                </div>
                              )}

                              {job.selection_process && (
                                <div className="space-y-2">
                                  <h4 className="font-semibold">Selection Process</h4>
                                  <p className="text-sm whitespace-pre-line text-muted-foreground">{job.selection_process}</p>
                                </div>
                              )}

                              {job.apply_link && (
                                <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="block">
                                  <Button className="w-full btn-gold gap-2 py-6 text-lg">
                                    Apply Now <ExternalLink className="w-5 h-5" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {job.apply_link && (
                          <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button className="w-full md:w-32 btn-gold gap-2 text-xs">
                              Apply <ExternalLink className="w-3 h-3" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No job postings available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Mentors Tab (Same as before but with consistent styling) */}
      <TabsContent value="mentors">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Users className="w-5 h-5 text-gold" />
              Available Mentors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mentorshipsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            ) : mentorships && mentorships.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {mentorships.map((mentor, index) => (
                  <motion.div
                    key={mentor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-muted/50 rounded-xl p-6 border border-transparent hover:border-gold/20 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center border-2 border-background shadow-sm shrink-0 overflow-hidden">
                        {mentor.alumni?.photo_url ? (
                          <img 
                            src={mentor.alumni.photo_url} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gold font-bold text-xl">
                            {mentor.alumni?.full_name?.charAt(0) || "M"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground">{mentor.title}</h3>
                        {mentor.alumni && (
                          <p className="text-gold text-sm font-medium">
                            {mentor.alumni.full_name}
                            {mentor.alumni.current_position && <span className="text-muted-foreground font-normal"> • {mentor.alumni.current_position}</span>}
                          </p>
                        )}
                        <p className="text-muted-foreground text-sm mt-3 line-clamp-3 leading-relaxed">
                          {mentor.description}
                        </p>
                        
                        {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-4">
                            {mentor.expertise_areas.map((area: string) => (
                              <Badge key={area} variant="secondary" className="text-[10px] bg-gold/5 text-gold hover:bg-gold/10 border-gold/10">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {(mentor.contact_email || mentor.contact_phone) && (
                          <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-4 items-center">
                            {mentor.contact_email && (
                              <a href={`mailto:${mentor.contact_email}`} className="text-xs text-gold hover:underline flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                {mentor.contact_email}
                              </a>
                            )}
                            {mentor.contact_phone && (
                              <p className="text-xs text-muted-foreground">{mentor.contact_phone}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No mentors available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default StudentDashboard;