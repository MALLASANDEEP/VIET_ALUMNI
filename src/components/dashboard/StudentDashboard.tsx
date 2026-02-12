import { motion } from "framer-motion";
import { Briefcase, Users, MapPin, ExternalLink, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobPostings } from "@/hooks/useJobPostings";
import { useMentorshipOffers } from "@/hooks/useMentorship";
import { Profile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

interface StudentDashboardProps {
  profile: Profile;
}

export const StudentDashboard = ({ profile }: StudentDashboardProps) => {
  const { data: jobs, isLoading: jobsLoading } = useJobPostings();
  const { data: mentorships, isLoading: mentorshipsLoading } = useMentorshipOffers();

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
                    className="bg-muted/50 rounded-xl p-6 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
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
                        <p className="text-muted-foreground mt-3 text-sm line-clamp-2">
                          {job.description}
                        </p>
                        {job.alumni && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Posted by: {job.alumni.full_name}
                          </p>
                        )}
                      </div>
                      {job.apply_link && (
                        <a href={job.apply_link} target="_blank" rel="noopener noreferrer">
                          <Button className="btn-gold gap-2">
                            Apply Now
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
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

      {/* Mentors Tab */}
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
                    className="bg-muted/50 rounded-xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                        {mentor.alumni?.photo_url ? (
                          <img 
                            src={mentor.alumni.photo_url} 
                            alt={mentor.alumni.full_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gold font-bold text-lg">
                            {mentor.alumni?.full_name?.charAt(0) || "M"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{mentor.title}</h3>
                        {mentor.alumni && (
                          <p className="text-gold text-sm">
                            {mentor.alumni.full_name}
                            {mentor.alumni.current_position && ` • ${mentor.alumni.current_position}`}
                          </p>
                        )}
                        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
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
                        {(mentor.contact_email || mentor.contact_phone) && (
                          <div className="mt-3 pt-3 border-t border-border text-sm">
                            {mentor.contact_email && (
                              <a href={`mailto:${mentor.contact_email}`} className="text-gold hover:underline">
                                {mentor.contact_email}
                              </a>
                            )}
                            {mentor.contact_phone && (
                              <p className="text-muted-foreground">{mentor.contact_phone}</p>
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
