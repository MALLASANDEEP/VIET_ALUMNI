// src/hooks/useAddAdmin.ts
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/test/types";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type UserRoleInsert = Database["public"]["Tables"]["user_roles"]["Insert"];

export const useAddAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ✅ Add a new admin
  const addAdmin = async (
    email: string,
    password: string,
    full_name: string = ""
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!email || !password) throw new Error("Email and password required");

      // 1️⃣ Save current admin session
      const {
        data: { session: adminSession },
      } = await supabase.auth.getSession();

      if (!adminSession) throw new Error("Admin session not found");

      // 2️⃣ Create new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user?.id) throw new Error("User creation failed");

      const userId = authData.user.id;

      // 3️⃣ Restore admin session immediately
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });

      // 4️⃣ Insert profile
      const profileData: ProfileInsert = {
        user_id: userId,
        email,
        full_name,
        requested_role: "admin",
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .insert(profileData);

      if (profileError) throw profileError;

      // 5️⃣ Insert admin role
      const roleData: UserRoleInsert = {
        user_id: userId,
        role: "admin",
      };

      const { error: roleError } = await supabase.from("user_roles").insert(roleData);

      if (roleError) throw roleError;

      setSuccess("Admin created successfully!");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Remove admin access
  const deleteAdmin = async (userId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!userId) throw new Error("User ID required");

      // 1️⃣ Delete role from user_roles table
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (roleError) throw roleError;

      // 2️⃣ Update profile to normal user (optional)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ requested_role: "user" })
        .eq("user_id", userId);

      if (profileError) throw profileError;

      setSuccess("Admin access removed successfully!");
    } catch (err: any) {
      setError(err?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    addAdmin,
    deleteAdmin,
    loading,
    error,
    success,
  };
};
