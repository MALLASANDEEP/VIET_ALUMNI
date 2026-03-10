import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Loader2, 
  GraduationCap, 
  Briefcase, 
  Users, 
  Clock, 
  CheckCircle,
  XCircle,
  Home,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { AlumniDashboard } from "@/components/dashboard/AlumniDashboard";
import DashboardNotificationBell from "@/components/dashboard/DashboardNotificationBell";
import ProfileMenu from "@/components/ProfileMenu";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // Redirect admin to admin panel
  useEffect(() => {
    if (isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) return null;

  // Show pending approval message
  if (profile?.status === "pending") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md text-center">
            <CardContent className="pt-6">
              <Clock className="w-16 h-16 text-gold mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Registration Pending</h2>
              <p className="text-muted-foreground mb-4">
                Your registration is awaiting admin approval. You'll receive access once approved.
              </p>
              <div className="flex gap-2 justify-center">
                <Link to="/">
                  <Button variant="outline" className="gap-2">
                    <Home className="w-4 h-4" />
                    Go Home
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Show rejected message
  if (profile?.status === "rejected") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md text-center">
            <CardContent className="pt-6">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Registration Rejected</h2>
              <p className="text-muted-foreground mb-4">
                Unfortunately, your registration was not approved. Please contact the administrator for more information.
              </p>
              <div className="flex gap-2 justify-center">
                <Link to="/">
                  <Button variant="outline" className="gap-2">
                    <Home className="w-4 h-4" />
                    Go Home
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // No profile yet
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md text-center">
            <CardContent className="pt-6">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
              <p className="text-muted-foreground mb-4">
                Please complete your registration to access the dashboard.
              </p>
              <div className="flex gap-2 justify-center">
                <Link to="/register">
                  <Button className="btn-gold">Complete Registration</Button>
                </Link>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-navy-dark via-navy-dark to-primary sticky top-0 z-50 border-b border-border/30 shadow-lg">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Left: Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-navy-dark" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-serif font-bold text-lg text-primary-foreground">
                  {profile?.requested_role === "alumni" ? "Alumni" : "Student"} Hub
                </h1>
                <p className="text-xs text-primary-foreground/70">{profile?.full_name}</p>
              </div>
            </div>

            {/* Center: Quick status */}
            <div className="hidden md:flex items-center gap-2 text-sm text-primary-foreground/80">
              <CheckCircle className="w-4 h-4 text-gold" />
              <span>Account Active</span>
            </div>

            {/* Right: Notification Bell, Home, Profile Menu */}
            <div className="flex items-center gap-2">
              <DashboardNotificationBell profile={profile} />
              <Link to="/">
                <Button 
                  variant="ghost" 
                  className="text-primary-foreground hover:bg-primary/20 gap-2 h-10"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </Link>
              <div className="w-px h-6 bg-primary-foreground/20 mx-1" />
              {profile && <ProfileMenu profile={profile} onLogout={handleSignOut} />}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-gold mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Account Approved</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground">
            Welcome, {profile.full_name.split(" ")[0]}!
          </h2>
          <p className="text-muted-foreground">
            {profile.requested_role === "alumni" 
              ? "Share opportunities and mentor the next generation"
              : "Explore job opportunities and find mentors"
            }
          </p>
        </motion.div>

        {/* Dashboard Content */}
        {profile.requested_role === "student" ? (
          <StudentDashboard profile={profile} />
        ) : (
          <AlumniDashboard profile={profile} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
