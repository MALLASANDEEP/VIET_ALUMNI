import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export type AppRole = "admin" | "student" | "alumni" | "user";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  // 🔥 Centralized Role Fetcher
  const fetchUserRole = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) {
      console.error("Role fetch error:", error.message);
      setIsAdmin(false);
      setUserRole(null);
      return;
    }

    if (!data || data.length === 0) {
      setIsAdmin(false);
      setUserRole(null);
      return;
    }

    const roles = data.map((r) => r.role);

    setIsAdmin(roles.includes("admin"));

    if (roles.includes("admin")) setUserRole("admin");
    else if (roles.includes("alumni")) setUserRole("alumni");
    else if (roles.includes("student")) setUserRole("student");
    else setUserRole("user");
  }, []);

  useEffect(() => {
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserRole(session.user.id);
      } else {
        setIsAdmin(false);
        setUserRole(null);
      }

      setLoading(false);
    });

    // Initial session load
    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserRole(session.user.id);
      }

      setLoading(false);
    };

    initialize();

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  // 🔐 Sign In
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  // 📝 Sign Up
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) throw error;
  };

  // 🚪 Sign Out (Fixed)
  const signOut = async () => {
    const { error } = await supabase.auth.signOut({
      scope: "local", // 🔥 prevents 403 global logout error
    });

    if (error) {
      console.error("Logout error:", error.message);
      throw error;
    }
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
