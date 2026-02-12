import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export type AppRole = "admin" | "student" | "alumni" | "user";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Check user roles
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id);

          if (roles && roles.length > 0) {
            const roleNames = roles.map(r => r.role);
            setIsAdmin(roleNames.includes("admin"));

            // Set primary role (admin > alumni > student > user)
            if (roleNames.includes("admin")) {
              setUserRole("admin");
            } else if (roleNames.includes("alumni")) {
              setUserRole("alumni");
            } else if (roleNames.includes("student")) {
              setUserRole("student");
            } else {
              setUserRole("user");
            }
          } else {
            setIsAdmin(false);
            setUserRole(null);
          }
        } else {
          setIsAdmin(false);
          setUserRole(null);
        }

        setLoading(false);
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .then(({ data: roles }) => {
            if (roles && roles.length > 0) {
              const roleNames = roles.map(r => r.role);
              setIsAdmin(roleNames.includes("admin"));
              if (roleNames.includes("admin")) {
                setUserRole("admin");
              } else if (roleNames.includes("alumni")) {
                setUserRole("alumni");
              } else if (roleNames.includes("student")) {
                setUserRole("student");
              } else {
                setUserRole("user");
              }
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    userRole,
    signIn,
    signUp,
    signOut,
  };
};
