import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Loader2, 
  ArrowLeft,
  Linkedin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Check if user is already logged in (after OAuth redirect)
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
        return;
      }

      if (session?.user) {
        // User is logged in, redirect to dashboard
        navigate("/dashboard");
      }
    };

    checkUser();

    // Optional: Listen for auth state changes while on login page
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    try {
      setSocialLoading("google");

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login`, // redirect back to login page
        },
      });
    } catch (error: any) {
      toast({
        title: "Google Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSocialLoading(null);
    }
  };

  // LinkedIn login
  const handleLinkedInLogin = async () => {
    try {
      setSocialLoading("linkedin");

      await supabase.auth.signInWithOAuth({
        provider: "linkedin_oidc",
        options: {
          redirectTo: `${window.location.origin}/login`, // redirect back to login page
        },
      });
    } catch (error: any) {
      toast({
        title: "LinkedIn Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/95 backdrop-blur shadow-2xl border border-gold/20">
          <CardHeader className="text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center mx-auto mb-4 shadow-lg">
              <GraduationCap className="w-8 h-8 text-navy-dark" />
            </div>

            <CardTitle className="font-serif text-2xl">
              Alumni Portal Login
            </CardTitle>

            <CardDescription>
              Our Pride. Our Network. Our Legacy.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">

              <div className="space-y-3">
                <Button
                  type="button"
                  className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-3"
                  onClick={handleGoogleLogin}
                  disabled={socialLoading === "google"}
                >
                  {socialLoading === "google" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="w-5 h-5"
                    />
                  )}
                  Continue with Google
                </Button>

                <Button
                  type="button"
                  className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white flex items-center justify-center gap-3"
                  onClick={handleLinkedInLogin}
                  disabled={socialLoading === "linkedin"}
                >
                  {socialLoading === "linkedin" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Linkedin className="w-5 h-5" />
                  )}
                  Continue with LinkedIn
                </Button>

                <div className="relative text-center text-sm text-muted-foreground">
                  <span className="bg-card px-2 relative z-10">
                    or continue with email
                  </span>
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted"></div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gold hover:bg-yellow-500 text-navy-dark font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Login"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don’t have an account?{" "}
                <Link to="/register" className="text-gold hover:underline">
                  Register
                </Link>
              </p>

            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
